// --- 1. DOM References ---
const body = document.body;
const tabBtns = document.querySelectorAll('.tab-btn');
const mainContent = document.getElementById('main-content');
const categoryScreen = document.getElementById('category-screen');
const categoriesContainer = document.getElementById('categories-container');
const affirmationScreen = document.getElementById('affirmation-screen');
const winScreen = document.getElementById('win-screen');
const streakCountEl = document.getElementById('streak-count');
const favoriteBtn = document.getElementById('favorite-btn');
const tooltip = document.getElementById('tooltip');
const affirmationTextContainer = document.getElementById('affirmation-text');
const statusMessage = document.getElementById('status-message');
const homeBtnAffirmation = document.getElementById('home-btn-affirmation');
const homeView = document.getElementById('home-view');
const winScreenContent = document.getElementById('win-screen-content');
const winScreenEmailSignup = document.getElementById('win-screen-email-signup');

// --- 2. App State ---
let allData = {};
let currentMode = 'affirmations';
let currentAffirmationData = {};
let starCount = parseInt(localStorage.getItem('affirmationStarCount') || '0');
let streakCount = parseInt(localStorage.getItem('affirmationStreakCount') || '0');
let lastVisitDate = localStorage.getItem('affirmationLastVisit');
let hasInteracted = false;

// --- 3. Speech Recognition & Sounds ---
const clickSound = new Audio('click.mp3');
const successSound = new Audio('success.mp3');
clickSound.volume = 0.5;
function playSound(sound) { if (hasInteracted) sound.play().catch(e => {}); }

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
}

// --- 4. Core Logic ---

async function initializeApp() {
    try {
        const response = await fetch('affirmations.json');
        if (!response.ok) throw new Error(`Network response was not ok.`);
        allData = await response.json();
        setupTabs();
        switchMode(currentMode, true);
        updateStreak();
    } catch (error) {
        console.error("Failed to load initial data:", error);
        categoriesContainer.innerHTML = '<p>Could not load content. Check console.</p>';
    }
}

function setupTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newMode = btn.dataset.mode;
            if (newMode !== currentMode) {
                playSound(clickSound);
                switchMode(newMode);
            }
        });
    });
}

function switchMode(newMode, isInitialLoad = false) {
    currentMode = newMode;
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === newMode));
    body.className = `theme-${newMode}`;
    
    if (!isInitialLoad) {
        categoryScreen.classList.add('fade-out');
        setTimeout(() => {
            populateCategories(newMode);
            categoryScreen.classList.remove('fade-out');
        }, 300);
    } else {
        populateCategories(newMode);
    }
}

function populateCategories(mode) {
    const dataForMode = allData[mode];
    const categories = [...new Set(dataForMode.map(a => a.category))];
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.addEventListener('click', () => {
            playSound(clickSound);
            startAffirmation(category);
        });
        categoriesContainer.appendChild(button);
    });
    goToHomeScreen();
}

function startAffirmation(category) {
    const affirmationsForCategory = allData[currentMode].filter(a => a.category === category);
    currentAffirmationData = affirmationsForCategory[Math.floor(Math.random() * affirmationsForCategory.length)];
    setupAffirmationScreen();
}

function setupAffirmationScreen() {
    favoriteBtn.classList.remove('favorited');
    affirmationTextContainer.innerHTML = '';
    currentAffirmationData.affirmation.split(' ').forEach(word => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.dataset.word = word.toLowerCase().replace(/[^a-z]/g, '');
        affirmationTextContainer.appendChild(span);
    });
    showScreen('affirmation');
    if (recognition) {
        statusMessage.textContent = "Listening...";
        setTimeout(() => { try { recognition.start(); } catch(e) {} }, 500);
    }
}

function handleSuccess() {
    playSound(successSound);
    starCount++;
    localStorage.setItem('affirmationStarCount', starCount);

    let contentHTML;
    winScreenEmailSignup.style.display = 'none';

    if (starCount >= 3) {
        contentHTML = `
            <img src="trophy.png" alt="Trophy" class="trophy-icon">
            <h2>You did it!</h2>
            <p class="success-message">${currentAffirmationData.successMessage}</p>
            <button id="another-one-btn-win">Do Another One</button>
        `;
        winScreenEmailSignup.style.display = 'block';
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        starCount = 0;
        localStorage.setItem('affirmationStarCount', starCount);
    } else {
        contentHTML = `
            <div class="star-container">
                ${[...Array(3)].map((_, i) => `<svg class="star-icon ${i < starCount ? 'unlocked' : ''}" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`).join('')}
            </div>
            <h2>Success!</h2>
            <p class="success-message">${currentAffirmationData.successMessage}</p>
            <button id="another-one-btn-win">Do Another One</button>
        `;
    }
    
    winScreenContent.innerHTML = contentHTML;
    document.getElementById('another-one-btn-win').addEventListener('click', goToHomeScreen);
    showScreen('win');
}

// --- 5. Helper Functions ---
function updateStreak() {
    const today = new Date().toDateString();
    if (lastVisitDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        streakCount = (lastVisitDate === yesterday.toDateString()) ? streakCount + 1 : 1;
        localStorage.setItem('affirmationLastVisit', today);
        localStorage.setItem('affirmationStreakCount', streakCount);
    }
    updateStreakUI();
}
function updateStreakUI() { streakCountEl.textContent = `Day ${streakCount}`; }
function checkSimilarity(spokenText) {
    const stopWords = ['i', 'a', 'an', 'the', 'is', 'am', 'are', 'will', 'to', 'and', 'my', 'of', 'for'];
    const originalWords = currentAffirmationData.affirmation.split(' ').map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w && !stopWords.includes(w));
    const spokenWords = spokenText.toLowerCase().split(' ');
    if (originalWords.length === 0) return 0;
    const matchedKeywords = originalWords.filter(w => spokenWords.includes(w)).length;
    return (matchedKeywords / originalWords.length) * 100;
}
function goToHomeScreen(e) {
    if (e) e.preventDefault();
    playSound(clickSound);
    showScreen('home');
}
function showScreen(screenName) {
    const isHomeScreen = screenName === 'home';
    homeView.style.display = isHomeScreen ? 'block' : 'none';
    affirmationScreen.style.display = screenName === 'affirmation' ? 'block' : 'none';
    winScreen.style.display = screenName === 'win' ? 'block' : 'none';
}

// --- 6. Event Listeners ---
document.getElementById('refresh-btn').addEventListener('click', () => { playSound(clickSound); startAffirmation(currentAffirmationData.category); });
favoriteBtn.addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('favorited');
    tooltip.classList.add('show');
    setTimeout(() => tooltip.classList.remove('show'), 2000);
});
homeBtnAffirmation.addEventListener('click', goToHomeScreen);

async function handleEmailSubmit(email, button, formWrapper, thankYouEl) {
    const n8nWebhookUrl = 'https://esh1991.app.n8n.cloud/webhook/4e9ed364-627b-41bd-92fa-d6a36e63fbfc'; // PASTE YOUR URL HERE

    if (n8nWebhookUrl === 'YOUR_N8N_PRODUCTION_URL_GOES_HERE') {
        alert('Please update the n8nWebhookUrl in app.js first!');
        return;
    }
    
    button.disabled = true;
    button.textContent = 'Submitting...';
    try {
        await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
        });
        formWrapper.style.display = 'none';
        thankYouEl.style.display = 'block';
    } catch (error) {
        console.error('Email submission error:', error);
        alert('Sorry, there was an issue signing you up.');
        button.disabled = false;
        button.textContent = 'Submit';
    }
}

document.getElementById('submit-email-btn').addEventListener('click', () => {
    const emailInput = document.getElementById('email-input');
    if (emailInput.value && emailInput.checkValidity()) {
        handleEmailSubmit(emailInput.value, emailInput.nextElementSibling, document.getElementById('email-capture-form'), document.getElementById('email-thank-you'));
    }
});
document.getElementById('win-submit-email-btn').addEventListener('click', () => {
    const emailInput = document.getElementById('win-email-input');
    if (emailInput.value && emailInput.checkValidity()) {
        handleEmailSubmit(emailInput.value, emailInput.nextElementSibling, document.getElementById('win-email-capture-form'), document.getElementById('win-email-thank-you'));
    }
});

if (recognition) {
    recognition.onresult = (event) => {
        let interimTranscript = '', finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            else interimTranscript += event.results[i][0].transcript;
        }
        const allSpokenWords = (finalTranscript + interimTranscript).toLowerCase().split(' ').filter(Boolean);
        affirmationTextContainer.querySelectorAll('span').forEach(span => {
            if (allSpokenWords.includes(span.dataset.word)) span.classList.add('spoken');
        });
        if (finalTranscript) {
            recognition.stop();
            if (checkSimilarity(finalTranscript) >= 70) {
                handleSuccess();
            } else {
                statusMessage.textContent = "That wasn't quite right. Let's try again!";
                setTimeout(() => setupAffirmationScreen(), 2000);
            }
        }
    };
    recognition.onerror = (event) => { if (event.error === 'not-allowed') console.error("Mic permission denied"); };
}

// --- 7. App Initialization ---
document.body.addEventListener('click', () => { hasInteracted = true; }, { once: true });
document.addEventListener('DOMContentLoaded', initializeApp);