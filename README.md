<div align="center">

# Ponder

### A personal book-tracking and note-taking web app

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ponder--v5.web.app-orange?style=for-the-badge&logo=firebase)](https://ponder-v5.web.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## What is Ponder?

Ponder is a full-stack web application that lets readers track their library and capture notes as they read — page by page, book by book. Users sign in with Google, add books (with cover photos taken directly from their phone camera or uploaded from their gallery), and attach timestamped notes tied to specific page numbers.

The entire backend runs serverlessly on Firebase — no custom server to maintain — with per-user Firestore security rules ensuring that each reader's data stays completely private.

**[Try it live →](https://ponder-v5.web.app)**

---

## Features

- **Google OAuth** — one-click sign-in via Firebase Authentication; session persists across reloads
- **Book library** — add, edit, and delete books with title, author, and a cover photo
- **Camera / upload cover** — native `<input capture>` lets mobile users snap a photo directly in the browser
- **Reading status** — filter your shelf by *Want to Read*, *Reading*, or *Finished*
- **Notes per book** — create, edit, and delete notes tied to a specific page number
- **Search** — instant client-side search across your entire book collection
- **Protected routes** — unauthenticated users are redirected to login automatically
- **Secure by default** — Firestore & Storage rules enforce `request.auth.uid == userId`; no user can touch another's data

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | React 18 + React Router 6 | Component model, client-side routing |
| Build tool | Vite 5 | Sub-second HMR, optimized production builds |
| Styling | Tailwind CSS 3 | Utility-first, no CSS file bloat |
| Auth | Firebase Authentication | Google Sign-In, managed sessions, zero backend code |
| Database | Cloud Firestore | Real-time NoSQL, nested subcollections for books → notes |
| File storage | Firebase Storage | Cover image upload with 5 MB cap enforced in rules |
| Hosting | Firebase Hosting | Global CDN, single deploy command |

---

## Architecture

```
React + Vite  (SPA)
    │
    ├── Firebase Auth     →  Google Sign-In, session state (AuthContext)
    ├── Cloud Firestore   →  users/{uid}/books/{bookId}/notes/{noteId}
    ├── Firebase Storage  →  covers/{uid}/{bookId}.jpg
    └── Firebase Hosting  →  https://ponder-v5.web.app
```

All reads and writes go directly from the browser to Firebase. Security rules (not application logic) are the enforcement layer — this means even a crafted HTTP request cannot access another user's data.

**Firestore schema:**
```
users/{userId}
  └── books/{bookId}
        ├── title: string
        ├── author: string
        ├── coverUrl: string      ← Firebase Storage URL
        ├── status: "want" | "reading" | "finished"
        ├── createdAt: timestamp
        └── notes/{noteId}
              ├── content: string
              ├── page: number
              └── createdAt: timestamp
```

---

## Project Structure

```
src/
  App.jsx                  Route definitions
  main.jsx                 Entry point
  firebase.js              Firebase SDK init (reads from env vars)
  contexts/
    AuthContext.jsx        Google sign-in + global session state
  lib/
    books.js               Books CRUD + status enum
    notes.js               Notes CRUD (subcollection)
    storage.js             Cover image upload / delete
  components/
    Layout.jsx             App shell with header & nav
    ProtectedRoute.jsx     Auth gate — redirects unauthenticated users
    BookCard.jsx           Cover tile for the grid view
    ConfirmDialog.jsx      Reusable confirm modal
    LoadingScreen.jsx      Splash shown during auth initialization
  pages/
    Login.jsx
    Home.jsx               Grid + search + status filter
    AddBook.jsx            Manual entry + cover upload
    BookDetail.jsx         Notes list, edit / delete book & notes
    NotFound.jsx
```

---

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Ponder-v5.git
cd Ponder-v5
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Authentication** → Sign-in method → enable **Google**.
3. **Firestore Database** → Create database (production mode).
4. **Storage** → Get started (production mode).
5. **Project settings** → General → Your apps → register a **Web app** and copy the config.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase project values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 5. Start the dev server

```bash
npm run dev
```

---

## Deploying

Set your project ID in `.firebaserc`, then:

```bash
npm install -g firebase-tools
firebase login
npm run deploy        # builds and deploys hosting in one step
```

Security rules are deployed with:

```bash
firebase deploy --only firestore:rules,storage
```
