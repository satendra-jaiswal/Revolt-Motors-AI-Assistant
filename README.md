# Real-Time Conversational AI Assistant

This repository contains the source code for a full-stack, real-time voice assistant built with the Google Gemini API and Node.js. The application replicates the core functionality of the Revolt Motors chatbot, featuring continuous voice recognition, automatic language detection (English/Hindi), and a dynamic, theme-switching UI.

![AI Health Assistant](https://i.imgur.com/your-image-url.png)

## Features

-   **Real-Time Voice Interface**: A low-latency, continuous voice chat experience using the Web Speech API for natural conversation and seamless interruption handling.
-   **Intelligent Language Detection**: The AI automatically detects whether the user is speaking English, Hindi, or Hinglish and responds in the same language.
-   **Dynamic UI/UX**: A clean, responsive, single-page application with a persistent dark/light theme switcher and custom-styled, state-aware components.
-   **Robust Backend**: A secure server-to-server architecture using Node.js and Express to manage interactions with the Google Gemini API, ensuring API keys and core logic are protected.
-   **Advanced State Management**: Custom logic to handle browser-specific bugs and race conditions, ensuring a stable and reliable user experience.
-   **AI Safety Protocols**: The system instructions are designed to enforce disclaimers and prevent the AI from giving medical advice, ensuring a safe user interaction for the healthcare context.

## Technologies Used

-   **Backend**: Node.js, Express.js
-   **AI**: Google Gemini API (`gemini-1.5-flash-latest`)
-   **Frontend**: JavaScript, HTML, CSS
-   **APIs**: Web Speech API (SpeechRecognition & SpeechSynthesis)

## Setup and Installation

Follow these steps to run the project locally.

### Prerequisites

-   Node.js (v18 or later)
-   A Google Gemini API Key

