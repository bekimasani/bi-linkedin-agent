import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["https://reliable-chimera-58182e.netlify.app", "http://localhost:5175", "http://localhost:5174", "http://localhost:5173"]
}));
app.use(express.json());

const LENGTH_MAP = {
  Short: "80–120 words",
  Medium: "150–200 words",
  Long: "220–300 words",
};

const VARIATION_TONES = {
  A: { tone: "Thought Leader", style: "Bold, forward-looking, authoritative. Share a strong opinion or prediction." },
  B: { tone: "Educational",    style: "Clear, structured, practical. Teach something specific and actionable." },
  C: { tone: "Provocative",    style: "Challenge assumptions. Start with a contrarian take that sparks debate." },
};

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("Using key:", apiKey ? apiKey.slice(0, 8) + "..." : "MISSING");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new
cd ~/Downloads/bi-agent\ 2 && git add backend/server.js && git commit -m "Fix CORS for Netlify" && git push origin main
