Facebook Comment Form (React + TypeScript + Vite)

A Facebook-style comment form built with React, TypeScript, and Vite.
This project demonstrates modern React best practices including hooks, state management, and component composition.

🚀 Features

💬 Comment form with input box and submit button

🧵 Threaded replies (nested comment support)

😀 Emoji reactions (like Facebook reactions)

📎 File/image attachments

🔔 User tagging (@mentions)

🕒 Relative timestamps (e.g., 2m ago, 3h ago)

🗑️ Edit & delete actions via dropdown

🛠️ Tech Stack

React 18 – UI framework

TypeScript – Strongly typed JavaScript

Vite – Fast build tool and dev server

TailwindCSS – Utility-first CSS framework (optional, if you used it)

Zustand – Lightweight state management (if you used it)

date-fns – Date formatting utilities

📂 Project Structure
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

⚡ Getting Started
1. Clone the repo
git clone https://github.com/saravana2107/facebook-chat.git
cd facebook-chat

2. Install dependencies
npm install

3. Run the development server
npm run dev

4. Build for production
npm run build

🔧 Available Scripts

dev – Start development server with HMR

build – Build production bundle

preview – Preview production build locally

lint – Run linter (if configured)

test – Run unit tests (if added)

deploy - Run deployment script to deploy the changes to github pages