// --- 1. Get References to HTML Elements ---
const micPermissionCallout = document.getElementById('mic-permission-callout');
const categoryScreen = document.getElementById('category-screen');
const customInputScreen = document.getElementById('custom-input-screen');
const affirmationScreen = document.getElementById('affirmation-screen');
const winScreen = document.getElementById('win-screen');

// --- 2. Initialize Sounds ---
const clickSound = new Audio('click.mp3');
const successSound = new Audio('success.mp3');
clickSound.volume = 0.5;

// --- 3. Define Affirmations & App State ---
const affirmations = {
    fitness: ["I will go to the gym today.", "My body is strong and capable.", "I enjoy moving my body and getting stronger."],
    confidence: ["I believe in myself and my abilities.", "I am worthy of success and happiness.", "I radiate confidence and self-respect."],
    focus: ["I am focused and free from all distractions.", "I will complete my most important task.", "My mind is clear and sharp."],
    gratitude: ["I am grateful for the simple joys in my life.", "I appreciate the people who support me.", "My heart is full of gratitude."],
    wealth: ["I am a magnet for financial abundance.", "I make wise financial decisions.", "Wealth flows to me easily and frequently."]
};
let currentAffirmation = "", currentCategory = "";

// --- 4. Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) alert("Sorry, your browser doesn't support Speech Recognition. Please use Chrome, Edge, or Safari.");
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

// --- 5. Core App Logic ---
function showScreen(screen) {
    [categoryScreen, customInputScreen, affirmationScreen, winScreen].forEach(s => s.style.display = 'none');
    screen.style.display = 'block';
    
    // When showing the win screen, reset the email form for next time
    if (screen === winScreen) {
        document.getElementById('email-capture-form').style.display = 'flex';
        document.getElementById('email-thank-you').style.display = 'none';
    }
}

function setupAffirmation(affirmationText, category = null) {
    recognition.stop();
    micPermissionCallout.style.display = 'none';
    currentCategory = category;
    document.getElementById('refresh-btn').style.display = category ? 'flex' : 'none';
    
    let container = document.getElementById('affirmation-text');
    container.innerHTML = '';
    affirmationText.split(' ').forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        container.appendChild(span);
    });
    currentAffirmation = affirmationText;

    showScreen(affirmationScreen);
    document.getElementById('status-message').textContent = "Listening...";
    setTimeout(() => {
        try { recognition.start(); } catch(e) { /* Fails silently if already started */ }
    }, 500);
}

function checkSimilarity(spokenText) {
    const stopWords = ['i', 'a', 'an', 'the', 'is', 'am', 'are', 'will', 'to', 'and', 'my', 'of', 'for'];
    const originalWords = currentAffirmation.split(' ').map(w => w.toLowerCase().replace(/[^a-z0-9]/gi, '')).filter(w => w && !stopWords.includes(w));
    const spokenWords = spokenText.toLowerCase().split(' ');
    if (originalWords.length === 0) return spokenText ? 100 : 0;
    let matchedKeywords = originalWords.filter(w => spokenWords.includes(w)).length;
    return (matchedKeywords / originalWords.length) * 100;
}

// --- 6. Event Listeners ---
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => clickSound.play());
});

document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        const chosenAffirmation = affirmations[category][Math.floor(Math.random() * affirmations[category].length)];
        setupAffirmation(chosenAffirmation, category);
    });
});

document.getElementById('write-my-own-btn').addEventListener('click', () => showScreen(customInputScreen));
document.getElementById('back-to-categories-btn').addEventListener('click', () => showScreen(categoryScreen));
document.getElementById('start-custom-btn').addEventListener('click', () => {
    const customText = document.getElementById('custom-text-input').value.trim();
    if (customText) setupAffirmation(customText);
    else alert("Please write your affirmation first!");
});

document.getElementById('another-one-btn').addEventListener('click', () => {
    showScreen(categoryScreen);
    document.getElementById('custom-text-input').value = '';
});

document.getElementById('refresh-btn').addEventListener('click', () => {
    if (currentCategory && affirmations[currentCategory]) {
        let newAffirmation;
        do { newAffirmation = affirmations[currentCategory][Math.floor(Math.random() * affirmations[currentCategory].length)]; }
        while (newAffirmation === currentAffirmation && affirmations[currentCategory].length > 1);
        setupAffirmation(newAffirmation, currentCategory);
    }
});

document.getElementById('submit-email-btn').addEventListener('click', () => {
    const emailInput = document.getElementById('email-input');
    if (emailInput.value && emailInput.checkValidity()) {
        console.log(`Email captured: ${emailInput.value}`);
        document.getElementById('email-capture-form').style.display = 'none';
        document.getElementById('email-thank-you').style.display = 'block';
    } else {
        alert("Please enter a valid email address.");
    }
});

// --- 7. Speech Recognition Handlers ---
recognition.onresult = (event) => {
    let finalTranscript = '', interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
    }
    document.getElementById('affirmation-text').querySelectorAll('span').forEach(span => {
        const originalWord = span.textContent.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
        if (originalWord && (finalTranscript + interimTranscript).toLowerCase().includes(originalWord)) span.classList.add('spoken');
    });
    if (finalTranscript) {
        recognition.stop();
        if (checkSimilarity(finalTranscript) >= 70) {
            document.getElementById('status-message').textContent = "Great job!";
            successSound.play();
            setTimeout(() => {
                showScreen(winScreen);
                confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
            }, 800);
        } else {
            document.getElementById('status-message').textContent = "That wasn't quite right. Let's try again!";
            setTimeout(() => setupAffirmation(currentAffirmation, currentCategory), 3000);
        }
    }
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event);
    if (event.error === 'not-allowed') {
        micPermissionCallout.style.display = 'block'; // Show the callout
        showScreen(categoryScreen);
    } else {
        document.getElementById('status-message').textContent = "Oops, an error occurred.";
    }
};

// --- Initial state ---
showScreen(categoryScreen);