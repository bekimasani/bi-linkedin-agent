import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
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
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Groq error ${res.status}`);
  return data.choices[0].message.content.trim();
}

app.post("/generate", async (req, res) => {
  const { topic, audience, length } = req.body;

  if (!topic || !audience || !length) {
    return res.status(400).json({ error: "Missing required fields: topic, audience, length" });
  }

  try {
    const results = await Promise.all(
      ["A", "B", "C"].map(async (id) => {
        const { tone, style } = VARIATION_TONES[id];

        const prompt = `You are a top LinkedIn content strategist specializing in Business Intelligence, Power BI, Microsoft Fabric, and data analytics.

Write a LinkedIn post with these exact parameters:
- Topic: ${topic}
- Target audience: ${audience}
- Tone: ${tone} — ${style}
- Length: ${LENGTH_MAP[length]}

Hard rules:
- Start with a powerful hook — no clichés like "In today's world" or "Did you know"
- Use short paragraphs (1–2 lines max)
- Include at least one concrete insight, stat, or specific example
- End with a thought-provoking question to drive engagement
- Add exactly 5 relevant hashtags on the last line (e.g. #PowerBI #BusinessIntelligence)
- Output ONLY the post text — no preamble, no labels, no explanation`;

        const text = await callGroq(prompt);
        return { id, text };
      })
    );

    const posts = {};
    results.forEach(({ id, text }) => { posts[id] = text; });
    res.json({ posts });

  } catch (err) {
    console.error("Groq error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok", provider: "groq" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ BI Agent backend running on http://localhost:${PORT} (powered by Groq)`));
