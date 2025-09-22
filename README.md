# Facebook Comment Form (React + TypeScript + Vite)

A Facebook-style comment form built with **React**, **TypeScript**, and **Vite**.  
This project demonstrates modern React best practices including hooks, state management, and component composition.

---

## 🚀 Features

- 💬 **Comment form** with input box and submit button
- 🧵 **Threaded replies** (nested comment support)
- 😀 **Emoji reactions** (like Facebook reactions)
- 📎 **File/image attachments**
- 🔔 **User tagging (`@mentions`)**
- 🕒 **Relative timestamps** (e.g., `2m`, `3h`)
- 🗑️ **Edit & delete actions** via dropdown

---

## 🛠️ Tech Stack

- **React 18** – UI framework
- **TypeScript** – Strongly typed JavaScript
- **Vite** – Fast build tool and dev server
- **TailwindCSS** – Utility-first CSS framework
- **Zustand** – Lightweight state management
- **date-fns** – Date formatting utilities

---

## 📂 Project Structure

```bash
.
├── src
│   ├── components      # Reusable UI components
│   │   ├── Comment.tsx
│   │   ├── CommentForm.tsx
│   │   ├── ReactionBar.tsx
│   │   └── ReplyThread.tsx
│   ├── store           # Zustand or context store
│   ├── utils           # Helpers (e.g., date formatting)
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── index.html
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** or **yarn** package manager

### 1. Clone the repo

```bash
git clone https://github.com/your-username/facebook-comment-form.git
cd facebook-comment-form
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## 🔧 Available Scripts

- `dev` – Start development server with HMR
- `build` – Build production bundle
- `preview` – Preview production build locally
- `lint` – Run linter
- `test` – Run unit tests
- `deploy` – Deploy to github pages

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
