// --- 1. Get DOM References ---
const micPermissionCallout = document.getElementById('mic-permission-callout');
const categoryScreen = document.getElementById('category-screen');
const categoriesContainer = document.getElementById('categories-container');
const affirmationScreen = document.getElementById('affirmation-screen');
const winScreen = document.getElementById('win-screen');
const starIcons = document.querySelectorAll('.star-icon');
const trophyIcon = document.getElementById('trophy-icon');
const winMessage = document.getElementById('win-message');
const winTitle = document.getElementById('win-title');
const affirmationTextContainer = document.getElementById('affirmation-text');


// --- 2. App State & Data ---
let allAffirmations = [];
let currentAffirmationData = {};
let starCount = parseInt(localStorage.getItem('affirmationStarCount') || '0');


// --- 3. Initialize Sounds & Speech Recognition ---
const clickSound = new Audio('click.mp3');
const successSound = new Audio('success.mp3');
clickSound.volume = 0.5;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    console.warn("Speech Recognition not supported in this browser.");
}
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
}


// --- 4. Core App Logic ---
async function fetchAndParseData() {
    try {
        const response = await fetch('affirmations.json');
        if (!response.ok) throw new Error('Network response was not ok.');
        
        allAffirmations = await response.json();
        
        populateCategories();
    } catch (error) {
        console.error("Failed to load affirmations:", error);
        categoriesContainer.innerHTML = '<p>Could not load affirmations. Please check the affirmations.json file.</p>';
    }
}

function populateCategories() {
    const categories = [...new Set(allAffirmations.map(a => a.category))];
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.addEventListener('click', () => {
            clickSound.play();
            startAffirmation(category);
        });
        categoriesContainer.appendChild(button);
    });
}

function startAffirmation(category) {
    const affirmationsForCategory = allAffirmations.filter(a => a.category === category);
    currentAffirmationData = affirmationsForCategory[Math.floor(Math.random() * affirmationsForCategory.length)];
    setupAffirmationScreen();
}

function setupAffirmationScreen() {
    affirmationTextContainer.innerHTML = '';
    currentAffirmationData.affirmation.split(' ').forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        affirmationTextContainer.appendChild(span);
    });
    showScreen(affirmationScreen);
    document.getElementById('status-message').textContent = "Listening...";
    if (recognition) {
        setTimeout(() => { try { recognition.start(); } catch(e) {} }, 500);
    }
}

function updateStars() {
    starIcons.forEach((star, index) => {
        star.classList.toggle('unlocked', index < starCount);
    });
}

function handleSuccess() {
    successSound.play();
    starCount++;
    localStorage.setItem('affirmationStarCount', starCount);

    updateStars();

    if (starCount >= 3) {
        trophyIcon.style.display = 'block';
        document.getElementById('star-container').style.display = 'none';
        winTitle.textContent = "You did it!";
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        starCount = 0;
        localStorage.setItem('affirmationStarCount', starCount);
    } else {
        trophyIcon.style.display = 'none';
        document.getElementById('star-container').style.display = 'flex';
        winTitle.textContent = "Success!";
    }

    winMessage.textContent = currentAffirmationData.successMessage || "You've taken the first step to reprogram your mind!";
    showScreen(winScreen);
}

function showScreen(screen) {
    [categoryScreen, affirmationScreen, winScreen].forEach(s => s.style.display = 'none');
    screen.style.display = 'block';

    // When showing the win screen, always reset the email form for next time
    if (screen === winScreen) {
        document.getElementById('email-capture-form').style.display = 'flex';
        document.getElementById('email-thank-you').style.display = 'none';
        const submitButton = document.getElementById('submit-email-btn');
        submitButton.disabled = false;
        submitButton.textContent = 'Save My Progress!';
    }
}

function checkSimilarity(spokenText) {
    const stopWords = ['i', 'a', 'an', 'the', 'is', 'am', 'are', 'will', 'to', 'and', 'my', 'of', 'for'];
    const originalWords = currentAffirmationData.affirmation.split(' ').map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, '')).filter(w => w && !stopWords.includes(w));
    const spokenWords = spokenText.toLowerCase().split(' ');
    if (originalWords.length === 0) return 0;
    let matchedKeywords = originalWords.filter(w => spokenWords.includes(w)).length;
    return (matchedKeywords / originalWords.length) * 100;
}

// --- 5. Event Listeners & Initializer ---
document.getElementById('another-one-btn').addEventListener('click', () => { clickSound.play(); showScreen(categoryScreen); });
document.getElementById('refresh-btn').addEventListener('click', () => { clickSound.play(); startAffirmation(currentAffirmationData.category); });

// --- THIS IS THE RESTORED EMAIL SUBMISSION CODE ---
document.getElementById('submit-email-btn').addEventListener('click', async () => {
    const emailInput = document.getElementById('email-input');
    const email = emailInput.value;
    const submitButton = document.getElementById('submit-email-btn');

    // ** PASTE YOUR N8N PRODUCTION URL HERE **
    const n8nWebhookUrl = 'https://esh1991.app.n8n.cloud/webhook/4e9ed364-627b-41bd-92fa-d6a36e63fbfc';

    if (n8nWebhookUrl === 'YOUR_N8N_PRODUCTION_URL_GOES_HERE') {
        alert('Please update the n8nWebhookUrl in app.js first!');
        return;
    }

    if (email && emailInput.checkValidity()) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        try {
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
            });
            if (!response.ok) { throw new Error('Network response was not ok'); }
            
            document.getElementById('email-capture-form').style.display = 'none';
            document.getElementById('email-thank-you').style.display = 'block';

        } catch (error) {
            console.error('There was a problem sending the email:', error);
            alert('Sorry, there was an issue signing you up. Please try again later.');
            submitButton.disabled = false;
            submitButton.textContent = 'Save My Progress!';
        }
    } else {
        alert("Please enter a valid email address.");
    }
});


if (recognition) {
    recognition.onresult = (event) => {
        let interimTranscript = '', finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            else interimTranscript += event.results[i][0].transcript;
        }

        const allSpokenWords = (finalTranscript + interimTranscript).toLowerCase().split(' ');
        affirmationTextContainer.querySelectorAll('span').forEach((span) => {
            const originalWord = span.textContent.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
            if (originalWord && allSpokenWords.includes(originalWord)) {
                span.classList.add('spoken');
            }
        });
        
        if(finalTranscript) {
            recognition.stop();
            if (checkSimilarity(finalTranscript) >= 70) {
                handleSuccess();
            } else {
                document.getElementById('status-message').textContent = "That wasn't quite right. Let's try again!";
                setTimeout(() => setupAffirmationScreen(), 2000);
            }
        }
    };
    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') micPermissionCallout.style.display = 'block';
    };
}

// --- App Start ---
document.addEventListener('DOMContentLoaded', () => {
    updateStars();
    fetchAndParseData();
});