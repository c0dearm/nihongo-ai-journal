# 日本語AIジャーナル

## AI-Powered Japanese Journal

日本語AIジャーナル (Nihongo AI Journal) is a webapp designed to help Japanese language learners improve their writing skills. It leverages the power of Google's Gemini AI to provide intelligent feedback on journal entries, helping users identify grammar mistakes, suggest better vocabulary, and offer overall comments tailored to their JLPT proficiency level.

## ✨ Key Features

- **AI-Powered Feedback**: Get comprehensive feedback on your Japanese journal entries, including corrected text, grammar explanations, vocabulary suggestions, and overall comments.
- **JLPT Level Customization**: Tailor the AI feedback to your specific Japanese Language Proficiency Test (JLPT) level (N5 to N1) for more relevant and effective learning.
- **Journal Management**: Easily add, view, and manage your journal entries, with all data stored locally in your browser.
- **Gemini API Integration**: Securely configure and use your own Gemini API key to power the AI feedback.

## 🚀 How It Works

1.  **Write Your Entry**: Users write their daily journal entries in Japanese within the application.
2.  **Select JLPT Level**: Before submitting, users select their current JLPT proficiency level (e.g., N5, N4, N3, N2, N1).
3.  **AI Analysis**: The application sends the journal entry and the selected JLPT level to the Gemini AI.
4.  **Receive Feedback**: Gemini AI processes the entry and returns structured feedback, including a corrected version of the text, detailed explanations for grammar corrections, suggestions for improved vocabulary, and an encouraging overall comment.
5.  **Learn and Improve**: Users review the feedback to understand their mistakes and learn how to improve their Japanese writing.

## 💻 How to Use the App

1.  **Set Your API Key**: Navigate to the settings and enter your Google Gemini API key. This is essential for the AI feedback functionality.
2.  **Choose Your JLPT Level**: Select your current JLPT proficiency level from the dropdown menu. This helps the AI provide more accurate and relevant feedback.
3.  **Write a Journal Entry**: Type or paste your Japanese text into the journal entry area.
4.  **Get Feedback**: Submit your entry and receive instant AI-powered feedback.
5.  **Review and Learn**: Read through the corrected text, grammar explanations, and vocabulary suggestions to enhance your understanding.

## 📁 Project Structure

```
.
├── .gitignore               # Specifies intentionally untracked files to ignore.
├── .prettierignore          # Files for Prettier to ignore during formatting.
├── .prettierrc              # Prettier configuration file.
├── eslint.config.ts         # ESLint configuration for linting TypeScript files.
├── index.html               # Main HTML file.
├── manifest.json            # Web App Manifest for PWA features.
├── package-lock.json        # Records the exact dependency tree.
├── package.json             # Project metadata and dependency definitions.
├── README.md                # Project README file.
├── tsconfig.json            # TypeScript compiler configuration.
├── vite.config.ts           # Vite build tool configuration.
├── dist/                    # Compiled output directory.
├── node_modules/            # Directory for Node.js modules and dependencies.
└── src/                     # Source code directory.
    ├── App.tsx              # Main React application component.
    ├── constants.ts         # Defines application-wide constants.
    ├── index.tsx            # Entry point for the React application.
    ├── style.css            # Global styles for the application.
    ├── types.ts             # TypeScript type definitions.
    ├── components/          # Reusable UI components.
    │   ├── Chat.tsx         # Component for AI chat interactions.
    │   ├── Icons.tsx        # Defines SVG icons used in the application.
    │   ├── JlptSelector.tsx # Component for selecting JLPT levels.
    │   ├── Journal.tsx      # Component for displaying and managing journal entries.
    │   └── Settings.tsx     # Component for application settings (e.g., API key).
    └── services/            # Service layer for API interactions.
        └── geminiService.ts # Handles communication with the Google Gemini API.
```

## 💻 Running Locally

To run this application on your local machine for development, you'll need npm.

**1. Prerequisites**

- [npm](https://www.npmjs.com/)
- [firebase](https://firebase.google.com/)

**2. Setup & Installation**

1.  **Clone the repository** (or download the source code).

2.  **Install dependencies:** Open your terminal in the project root and run:
    ```bash
    npm install
    ```

**3. Run the Application**

Once the installation is complete, you can use the following scripts:

- **`npm run dev`**: Starts the development server on `http://localhost:5173`.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Previews the production build locally.
- **`npm run format`**: Formats the code using Prettier.
- **`npm run lint`**: Lints the project with ESLint.
- **`npm run type-check`**: Compiles the project using TypeScript.

## ⚡ Deploying

The project is setup to be deployed automatically to Firebase using GitHub actions,
however if a manual deployment is needed, you can follow these two steps, assuming you already completed the [Firebase client setup](https://firebase.google.com/docs/hosting/quickstart):

1.  **Build the static files**

    ```bash
    npm run build
    ```

2.  **Host in Firebase**:
    ```bash
    firebase deploy --only hosting
    ```
