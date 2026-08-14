<div align="center">

# GrindWise

### AI-powered coding interview coach for practicing DSA problems without immediately revealing the solution.

</div>

---

## 🧠 What is GrindWise?

**GrindWise** is a Chrome extension that turns online coding platforms into an interactive interview-practice environment.

Instead of immediately showing the solution when you get stuck, GrindWise acts as an AI-powered coding coach. It analyzes the problem you're solving and provides **progressive hints** that help you reason toward the solution while keeping the final implementation in your hands.

The extension is designed around the idea of **guided problem solving rather than answer generation**.

---

## ✨ Features

### 🤖 Progressive AI Hints

GrindWise provides up to three progressive hints:

- **Hint 1 — Approach:** Guides you toward the right way of thinking without immediately revealing the solution.
- **Hint 2 — Data Structure / Technique:** Identifies the relevant data structure, algorithm, or technique and explains why it is useful.
- **Hint 3 — Implementation Guidance:** Provides partial pseudocode or implementation-level guidance while avoiding a complete solution.

Hints become progressively more explicit as you continue requesting help.

---

### 🎯 Multiple Learning Modes

GrindWise supports different coaching styles so that hints can match how you prefer to learn:

- **Socratic** — Uses questions and guided reasoning to help you discover the next step yourself.
- **Coaching** — Provides encouraging explanations along with practical next steps.
- **Direct** — Gives clearer and more explicit guidance when you are stuck.

The learning mode influences how the hints are presented without changing the underlying goal of helping you solve the problem yourself.

---

### 🧩 Approach-Aware Coaching

GrindWise is being extended to understand the approach you're already taking rather than treating every hint request as a fresh problem.

When meaningful code is detected, the system can distinguish between two directions:

- **Continue My Approach** — Help improve the strategy you are already implementing.
- **Optimized Direction** — Analyze the current implementation and guide you toward a more efficient algorithm or data structure.

The selected approach is associated with the active learning session so that subsequent hints remain consistent with the chosen direction.

> Approach-aware hinting is designed to guide the learner without automatically replacing their work with a complete solution.

---

### 📝 Live Code Awareness

GrindWise can retrieve code from supported online coding editors using a generic extraction layer.

The extraction layer attempts to work with common editor implementations such as:

- Monaco
- CodeMirror
- Ace

It also provides a DOM-based fallback when necessary.

The system is designed to distinguish between:

- No code
- Starter/template code
- Meaningful user implementation
- Editor/code extraction failure

If code cannot be reliably extracted, GrindWise falls back to the normal hint experience rather than blocking the user.

---

### 🔄 Learning Sessions

Each problem can have an active learning session containing information such as:

- Problem details
- Selected AI provider
- Learning mode
- Hint requests
- Generated hints
- Session start time
- Current learning state
- Selected approach direction

Sessions can be restored so that closing or reopening the GrindWise panel does not unnecessarily restart the learning experience.

---

### 🧠 Multiple AI Providers

GrindWise follows a **Bring Your Own AI** model.

You can configure your preferred provider and API key locally.

Supported providers include:

- Groq
- Google Gemini
- OpenAI
- Anthropic Claude
- Cohere

The extension sends requests directly to the selected provider rather than relying on a GrindWise backend.

---

### 🐙 GitHub Auto-Sync

Once a solution is accepted, GrindWise can retrieve the submitted code and synchronize it with GitHub.

The goal is to eliminate the need to manually copy accepted solutions into a personal repository.

Solutions can be organized automatically so that your coding-practice history remains structured and easy to browse.

---

## 🌐 Supported Platforms

GrindWise currently includes platform integrations for:

- LeetCode
- Codeforces
- GeeksForGeeks
- CodeChef
- AtCoder
- HackerRank
- InterviewBit
- TakeUForward

Platform integrations are responsible primarily for detecting the current problem and extracting its relevant information.

Code extraction uses a shared mechanism where possible, with graceful fallback when a platform's editor cannot be reliably accessed.

---

## 🏗️ Architecture

GrindWise follows a modular Chrome Extension architecture.

```text
                    ┌──────────────────────┐
                    │   Coding Platform    │
                    │ LeetCode / GFG / ... │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Platform Scraper   │
                    │ Problem + Metadata   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Learning Session   │
                    │ Mode / Hints / State │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
      ┌──────────────────┐          ┌──────────────────┐
      │  Code Extraction │          │  Prompt Builder  │
      │ Monaco / Ace /   │          │ Context + Mode + │
      │ CodeMirror / DOM │          │ Approach + Hints │
      └────────┬─────────┘          └────────┬─────────┘
               │                             │
               └──────────────┬──────────────┘
                              ▼
                    ┌──────────────────────┐
                    │    AI Provider       │
                    │ Groq / Gemini /      │
                    │ OpenAI / Claude /    │
                    │ Cohere               │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Progressive Hints  │
                    │       1 → 2 → 3      │
                    └──────────────────────┘

                         On Accepted
                              │
                              ▼
                    ┌──────────────────────┐
                    │    GitHub Sync       │
                    └──────────────────────┘
```

---

## 📁 Project Structure

```text
GrindWise/
│
├── content/
│   └── content.js
│
├── core/
│   ├── ai.js
│   ├── context.js
│   ├── promptBuilder.js
│   └── session.js
│
├── platforms/
│   ├── index.js
│   ├── leetcode.js
│   ├── codeforces.js
│   ├── gfg.js
│   ├── codechef.js
│   ├── atcoder.js
│   ├── hackerrank.js
│   ├── interviewbit.js
│   └── takeuforward.js
│
├── background/
│   └── background.js
│
├── github/
│   └── githubSync.js
│
├── storage/
│   └── ...
│
├── ui/
│   ├── panel.js
│   └── toast.js
│
├── styles/
│   └── panel.css
│
├── popup/
│   ├── popup.html
│   └── popup.js
│
├── utils/
│   ├── constants.js
│   └── helpers.js
│
└── manifest.json
```

The project separates **problem extraction, session management, prompt construction, AI communication, UI rendering, storage, and platform integrations** so that individual components can evolve independently.

---

## 🔐 Privacy & Security

GrindWise is designed around a **local-first architecture**.

### API Keys

AI provider API keys are stored locally using Chrome extension storage.

### GitHub Authentication

GitHub authentication information is handled by the extension and used for repository synchronization.

### No GrindWise Backend

GrindWise does not require a central application server for generating hints.

Requests are made directly between the browser and the selected AI provider.

### User Code

When approach-aware hints are used, the current editor code may be included in the request sent to the selected AI provider so that the model can reason about the learner's current implementation.

For this reason, users should avoid submitting sensitive or proprietary code to third-party AI providers unless they are comfortable with the provider's policies.

Full editor code is **not intended to be stored in the extension's persistent session storage**.

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd GrindWise
```

### 2. Open Chrome Extensions

Navigate to:

```text
chrome://extensions/
```

### 3. Enable Developer Mode

Enable **Developer mode** in the top-right corner.

### 4. Load the extension

Click:

```text
Load unpacked
```

and select the GrindWise project directory.

### 5. Configure GrindWise

Open the extension popup and configure:

- Your preferred AI provider
- API key
- GitHub integration, if required

### 6. Start practicing

Open a supported coding platform, select a problem, and use GrindWise to request your first hint.

---

## 💡 Example Workflow

Suppose you're solving a problem involving an array.

You start writing a brute-force solution but get stuck.

Instead of asking:

> "Give me the solution."

GrindWise can guide you progressively:

```text
Hint 1
↓
Think about whether you are recomputing information
that could be maintained while moving through the array.

Hint 2
↓
Consider a data structure that lets you efficiently
keep track of previously seen values.

Hint 3
↓
Maintain the required information while iterating
through the array rather than repeatedly scanning it.
```

The objective is to help you reach the solution yourself.

---

## 🛠️ Development

GrindWise is built as a Chrome Extension using:

- JavaScript
- Chrome Extension APIs
- HTML/CSS
- Chrome Storage API
- GitHub API
- Multiple LLM APIs

The codebase is organized into independent modules for:

```text
Problem Detection
       ↓
Problem Scraping
       ↓
Code Extraction
       ↓
Learning Session
       ↓
Prompt Construction
       ↓
AI Provider
       ↓
Progressive Hints
       ↓
Submission Detection
       ↓
GitHub Synchronization
```

---

## 🤝 Contributing

Contributions are welcome!

If you want to:

- Add support for another coding platform
- Improve editor/code extraction
- Add another AI provider
- Improve hint generation
- Improve GitHub synchronization
- Fix bugs
- Improve the UI

you can contribute through a pull request.

### Development workflow

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a Pull Request.

---

## 🗺️ Roadmap

Planned improvements include:

- [ ] More reliable platform-specific editor extraction
- [ ] Improved approach detection
- [ ] Better comparison between learner and optimized approaches
- [ ] More adaptive hint generation
- [ ] Improved session recovery
- [ ] Additional coding-platform integrations
- [ ] More detailed learning analytics
- [ ] Better privacy disclosures for code-aware AI requests

---

## 📄 License

Add your project license here.

---

<div align="center">

### Keep up the grind 📈

**GrindWise — Don't get the solution. Learn the solution.**

</div>
