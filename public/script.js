// --- THEME SWITCHER LOGIC ---
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.checked = false;
    } else {
        body.classList.remove('light-mode');
        themeToggle.checked = true;
    }
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
});

document.addEventListener('DOMContentLoaded', applySavedTheme);


// --- VOICE ASSISTANT LOGIC (FINAL VERSION) ---
const talkButton = document.getElementById('talkButton');
const statusDiv = document.getElementById('status');
const transcriptDiv = document.getElementById('transcript');

let voices = [];
function populateVoiceList() {
    voices = speechSynthesis.getVoices();
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isSessionActive = false;
let silenceTimeout;
let endOfSpeechTimer;
let lastTranscriptIndex = 0;
let isProcessing = false; // The processing "lock"

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isSessionActive = true;
        talkButton.classList.add('listening');
        lastTranscriptIndex = 0;
        resetSilenceTimeout();
    };

    recognition.onend = () => {
        isSessionActive = false;
        talkButton.classList.remove('listening');
        clearTimeout(silenceTimeout);
        clearTimeout(endOfSpeechTimer);
    };

    recognition.onresult = (event) => {
        resetSilenceTimeout();
        clearTimeout(endOfSpeechTimer);

        const fullTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        endOfSpeechTimer = setTimeout(() => {
            if (!isSessionActive) return;

            // Only process if the lock is OFF
            if (!isProcessing) {
                const commandToSend = fullTranscript.substring(lastTranscriptIndex).trim();
                if (commandToSend) {
                    lastTranscriptIndex = fullTranscript.length;
                    getAIResponse(commandToSend);
                }
            }
        }, 1200);
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        isProcessing = false; // Release lock on recognition error
    };

} else {
    statusDiv.textContent = "Browser not supported.";
    talkButton.disabled = true;
}

function startSilenceTimeout() {
    silenceTimeout = setTimeout(() => {
        if (isSessionActive) {
            recognition.stop();
        }
    }, 120000);
}

function resetSilenceTimeout() {
    clearTimeout(silenceTimeout);
    if (isSessionActive) {
        startSilenceTimeout();
    }
}

talkButton.addEventListener('click', () => {
    if (isSessionActive) {
        recognition.stop();
    } else {
        speechSynthesis.cancel();
        speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        recognition.start();
    }
});

async function getAIResponse(userMessage) {
    // Engage the lock as soon as we start processing
    isProcessing = true;

    try {
        const response = await fetch('/api/dialog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const data = await response.json();

        if (data.responseText && data.languageCode) {
            speak(data.responseText, data.languageCode);
        } else {
            console.error("Invalid response format from AI:", data);
            isProcessing = false; // Release lock on error
        }

    } catch (error) {
        console.error('Error fetching or parsing AI response:', error);
        isProcessing = false; // Release lock on error
    }
}

function speak(text, langCode) {
    if (!text || !langCode) {
        isProcessing = false; // Release lock if there's nothing to speak
        return;
    }
    if ('speechSynthesis' in window) {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.lang = langCode;
        
        const voice = voices.find(v => v.lang === langCode);
        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`No voice found for language: ${langCode}`);
        }

        utterance.onstart = () => resetSilenceTimeout();
        
        // Release the lock only after the AI has finished speaking or if speaking fails
        utterance.onend = () => {
            resetSilenceTimeout();
            isProcessing = false;
        };
        utterance.onerror = (event) => {
            console.error("Speech Synthesis Error:", event.error);
            isProcessing = false;
        };
        
        speechSynthesis.speak(utterance);
    }
}

