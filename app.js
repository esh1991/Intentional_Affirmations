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
    recognition.interimResults = true; // CRITICAL for real-time highlighting
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
// Add your email button listener here if needed

if (recognition) {
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        // --- THE HIGHLIGHTING LOGIC ---
        const allSpokenWords = (finalTranscript + interimTranscript).toLowerCase().split(' ');
        affirmationTextContainer.querySelectorAll('span').forEach((span) => {
            const originalWord = span.textContent.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
            if (originalWord && allSpokenWords.includes(originalWord)) {
                span.classList.add('spoken');
            } else {
                span.classList.remove('spoken');
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