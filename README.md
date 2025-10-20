# Collaborative Real-Time Text Editor

A real-time collaborative text editor built with **Next.js** (Pages Router) and **Socket.IO**, supporting live multi-user editing with simplified Operational Transformation (OT).
Now designed for **modern deployment**: the Next.js frontend runs on **Vercel**, and the real-time backend runs independently on **Render**, **Railway**, or any Node host.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Usage](#usage)
8. [Deployment](#deployment)
9. [Session Cleanup & Persistence](#session-cleanup--persistence)
10. [Contributing](#contributing)
11. [License](#license)
12. [Author](#author)

---

## Project Overview

This project is a **real-time collaborative text editor** that lets multiple users edit the same document simultaneously.
Edits are synchronized live over **WebSockets** powered by **Socket.IO**, with conflict handling using a basic **Operational Transformation (OT)** model.

Unlike monolithic setups, this version splits responsibilities:

* **Frontend (Next.js)** → UI, routing, and editor rendering
* **Backend (Node.js + Socket.IO)** → WebSocket event handling and document state management

---

## Architecture

```plaintext
 ┌───────────────────────┐       WebSocket (Socket.IO)       ┌────────────────────────┐
 │     Next.js Frontend  │  <──────────────────────────────> │  Socket.IO Node Server │
 │  (Deployed on Vercel) │                                   │ (Deployed on Render)   │ 
 └───────────────────────┘                                   └────────────────────────┘
            │                                                         │
            │                         HTTP GET                        │
            └──────────────────────>  /health (for uptime checks)     │
```

---

## Features

* 🔁 Real-time multi-user collaboration
* ⚡ Conflict resolution via Operational Transformation
* 🧠 Auto document recreation on reconnect
* 🕒 Inactivity cleanup after 10 minutes
* 🎨 Clean VSCode-style dark theme with Tailwind CSS
* 🧩 Modular architecture: frontend + backend separation
* 💬 Health check endpoint for monitoring

---

## Tech Stack

### Frontend

* [Next.js](https://nextjs.org/)
* [React](https://react.dev/)
* [Tailwind CSS](https://tailwindcss.com/)

### Backend

* [Node.js](https://nodejs.org/)
* [Socket.IO](https://socket.io/)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/initeshjain/collab-editor.git
cd collab-editor
```

### 2. Install dependencies

```bash
npm install
```

---

## Environment Variables

### For Frontend (`.env.local`)

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-socket-server.onrender.com
```

### For Backend (`.env`)

```bash
PORT=4000
```

---

## Usage

### Run frontend (Next.js)

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### Run backend (Socket.IO server)

```bash
node socket-server.js
```

Health check:

```
GET http://localhost:4000/health
→ {"status":"ok","uptime":12.34,"timestamp":1729448300000}
```

---

## Deployment

| Component               | Platform                  | Notes                                                              |
| ----------------------- | ------------------------- | ------------------------------------------------------------------ |
| **Frontend (Next.js)**  | Vercel                    | Just `next build` and `next start`. No custom server.              |
| **Backend (Socket.IO)** | Render / Railway / Fly.io | Runs as a web service (`node socket-server.js`) with CORS enabled. |

Make sure the frontend `.env.local` points to the deployed backend URL.

---

## Session Cleanup & Persistence

* Documents and operations are kept **in-memory** using a `Map`
* Inactive documents (no edits for 10 minutes) are automatically removed
* Cleanup runs every minute
* If a deleted document receives new activity, it’s **recreated** instantly

---

## Contributing

Pull requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Submit a pull request

For bugs, open an issue with steps to reproduce.

---

## License

[MIT License](LICENSE)

---

## Author

Created with ❤️ by [@initeshjain](https://github.com/initeshjain)
