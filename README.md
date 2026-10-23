# 🚀 AutoDoc AI — Autonomous YouTube-to-PDF Knowledge Engine

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Model](https://img.shields.io/badge/Model-Gemini%203.8%20Flash-4285F4.svg)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-black.svg)](https://expressjs.com/)

An autonomous, open-source AI engine that transforms any YouTube video link into publication-grade, beautifully formatted PDF documentation, executive summaries, timestamped chapter breakdowns, actionable cheat sheets, visual mindmaps, and interactive gamified study decks.

---

## 🌟 Key Features

- 🧠 **Autonomous Multi-Stage Pipeline**: Automatically parses video URLs, resolves metadata via oEmbed, grounds knowledge using Google Gemini 3.8 Flash, and synthesizes structured documentation.
- 🔐 **Google Sign Up & Sign In**: Seamless Google authentication with Google Identity Services (GIS), persistent session management, user profile avatar, and cross-device document sync with bonus XP awards.
- 📄 **Crisp PDF Generator**: Exports multi-page, publication-quality PDFs with headers, footers, callouts, tables of contents, page numbers, and print-optimized typography.
- 🎮 **Gamified Mastery & Progression**:
  - Earn Experience Points (XP) for synthesizing videos, completing quizzes, reviewing flashcards, and exporting PDFs.
  - Level progression from *Novice Scribe* to *Grand Knowledge Master*.
  - Collectible achievements & badges with real-time unlock alerts and confetti animations.
  - Interactive Skill Tree unlocking specialized synthesis styles (Feynman, Executive, Technical Spec).
- 🧩 **Interactive Learning Deck**:
  - Auto-generated self-assessment quizzes with real-time grading, feedback, and XP rewards.
  - Flip flashcards for spaced-repetition memory retention.
  - Visual knowledge graph & ASCII/Mermaid mindmap.
- 📚 **Persistent Knowledge Library**: Searchable local archive of all processed video documents with instant re-export.
- 💬 **Grounded Q&A Companion**: Ask questions about the video and receive precise answers grounded in the synthesized knowledge base.

---

## 🏗️ Autonomous Architecture

```
[ YouTube URL Input ]
         │
         ▼
┌───────────────────────────────────────────────┐
│ Stage 1: URL Normalizer & oEmbed Resolver     │
│ - Validates video ID (standard, short, embed) │
│ - Resolves official title, author, thumbnail  │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│ Stage 2: Gemini 3.8 Flash Grounding Engine    │
│ - Multi-modal context & web search grounding  │
│ - Transcript deconstruction & key topic trace │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│ Stage 3: Structured Knowledge Synthesis       │
│ - Executive Summary & Core Insights           │
│ - Chapter breakdown with exact timestamps     │
│ - Technical Glossary & Concept definitions    │
│ - Actionable Implementation Playbook          │
│ - 5-Question Adaptive Self-Test Quiz          │
│ - Spaced-Repetition Flashcard Deck            │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│ Stage 4: PDF Compiler & Export Engine         │
│ - Vector-based jsPDF document layout          │
│ - Theme styling (Academic, Cyber, Notion)     │
│ - Print CSS & Markdown/JSON serialization     │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│ Stage 5: Gamification & Reward Engine         │
│ - Calculate XP gains & streak multipliers     │
│ - Evaluate badge criteria & trigger unlocks   │
│ - Update Player Level & Skill Trees           │
└───────────────────────────────────────────────┘
```

---

## 🛠️ API Configuration & Setup

### Prerequisites
- Node.js >= 18.0.0
- Google Gemini API Key (`GEMINI_API_KEY`)

### Environment Variables
Create a `.env` file or configure via AI Studio Secrets:

```bash
# Gemini API Key (handled automatically in Google AI Studio)
GEMINI_API_KEY="AIzaSy..."

# Application Host Port (defaults to 3000)
PORT=3000
```

### Local Development
```bash
# Clone the repository
git clone https://github.com/autodoc-ai/autodoc-engine.git
cd autodoc-engine

# Install dependencies
npm install

# Run the development server (Express + Vite)
npm run dev
```

### ⚡ Deploying to Vercel
This repository includes a production-ready `vercel.json` and Serverless Function entrypoint (`/api/index.ts`):
1. **Push your repository** to GitHub/GitLab.
2. **Import into Vercel**:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variables in Vercel**:
   - Go to **Project Settings > Environment Variables**
   - Key: `GEMINI_API_KEY`
   - Value: `Your_Actual_Gemini_API_Key`
   - Ensure checkboxes for **Production**, **Preview**, and **Development** are checked.
4. **Trigger a Redeployment**:
   - In Vercel, navigate to the **Deployments** tab.
   - Click the three dots `...` on the latest deployment and select **Redeploy** (important: Vercel does not inject newly added environment variables into existing builds without a redeploy!).

---

## 📡 API Endpoints

### 1. `POST /api/synthesize`
Generates comprehensive structured knowledge from a YouTube link.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=kCc8FmEb1nY",
  "style": "comprehensive",
  "customFocus": "System architecture and best practices"
}
```

**Response Format:**
```json
{
  "videoId": "kCc8FmEb1nY",
  "title": "Introduction to Large Language Models",
  "author": "Andrej Karpathy",
  "thumbnail": "https://i.ytimg.com/vi/kCc8FmEb1nY/hqdefault.jpg",
  "executiveSummary": "...",
  "keyTakeaways": ["..."],
  "chapters": [
    { "timestamp": "00:00", "title": "Overview", "summary": "...", "bullets": ["..."] }
  ],
  "glossary": [
    { "term": "Transformer", "definition": "..." }
  ],
  "actionPlan": [
    { "step": 1, "title": "Tokenization", "action": "..." }
  ],
  "quiz": [
    {
      "question": "What is the primary role of self-attention?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ],
  "flashcards": [
    { "front": "Loss Function", "back": "..." }
  ],
  "mindmap": "..."
}
```

### 2. `POST /api/chat-document`
Query the synthesized knowledge base in real-time.

---

## 🏆 Gamification Mechanics

| Action | XP Earned | Cooldown / Limits |
| :--- | :--- | :--- |
| **Synthesize Video** | +50 XP | Uncapped |
| **Complete Quiz (100% Score)** | +50 XP | Per quiz |
| **Correct Quiz Answer** | +10 XP | Per question |
| **Review Flashcard Deck** | +25 XP | Per session |
| **Export Formatted PDF** | +20 XP | Per document |
| **Daily Streak Bonus** | +15% XP multiplier | Re-evaluates every 24h |

### Player Levels
- **Level 1**: Novice Scribe (0 XP)
- **Level 2**: Curious Apprentice (100 XP)
- **Level 3**: Knowledge Synthesizer (300 XP)
- **Level 4**: Insight Architect (600 XP)
- **Level 5**: Master Documentarian (1,000 XP)
- **Level 10**: Grand Scholar (5,000 XP)
- **Level 20**: Grand Knowledge Master (20,000 XP)

---

## 📄 License
Released under the **Apache 2.0 License**. Free for personal, academic, and commercial use.
