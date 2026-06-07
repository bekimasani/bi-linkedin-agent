# BI LinkedIn Post Agent · Rootalytix

AI-powered LinkedIn post generator for Business Intelligence professionals.
Generates 3 variations (Thought Leadership, Educational, High Engagement) simultaneously using Claude AI.

---

## Project Structure

```
bi-agent/
├── backend/          ← Node.js + Express API server
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/         ← React + Vite app
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup (takes ~5 minutes)

### Prerequisites
- Node.js 18+ installed (https://nodejs.org)
- An Anthropic API key (https://console.anthropic.com)

---

### Step 1 — Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and paste your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
PORT=3001
```

Start the backend:
```bash
npm start
```

You should see: `✅ BI Agent backend running on http://localhost:3001`

---

### Step 2 — Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see: `Local: http://localhost:5173`

---

### Step 3 — Open the app

Go to **http://localhost:5173** in your browser.

Select topic → audience → length → click **Generate All Variations →**

---

## Sharing with others

### Option A — Run on the same machine
Anyone on your local network can access:
`http://YOUR_IP_ADDRESS:5173`

### Option B — Deploy to the web (free)

**Backend → Railway.app**
1. Push the `backend/` folder to GitHub
2. Connect to Railway, add `ANTHROPIC_API_KEY` as environment variable
3. Deploy — get a URL like `https://bi-agent-backend.up.railway.app`

**Frontend → Netlify or Vercel**
1. In `vite.config.js`, change the proxy target to your Railway backend URL
2. Run `npm run build` in the frontend folder
3. Drag the `dist/` folder to netlify.com/drop

Anyone with the Netlify URL can use the agent — no setup needed.

---

## API Endpoint

`POST /api/generate`

Request:
```json
{
  "topic": "DAX best practices",
  "audience": "Power BI Developers",
  "length": "Medium"
}
```

Response:
```json
{
  "posts": {
    "A": "Thought leadership post...",
    "B": "Educational post...",
    "C": "Provocative post..."
  }
}
```

---

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| AI       | Claude (claude-haiku-4-5)   |
| Backend  | Node.js + Express           |
| Frontend | React + Vite                |
| Styling  | Inline CSS (no dependencies)|

---

Built by Rootalytix · info@rootalytix.com
