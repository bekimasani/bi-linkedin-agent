import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());app.use(express.json());

const LENGTH_MAP = {
  Short: "80-120 words",
  Medium: "150-200 words",
  Long: "220-300 words",
};

const VARIATION_TONES = {
  A: { tone: "Thought Leader", style: "Bold, forward-looking, authoritative." },
  B: { tone: "Educational", style: "Clear, structured, practical." },
  C: { tone: "Provocative", style: "Challenge assumptions, contrarian take." },
};

async function callGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
  return data.choices[0].message.content.trim();
}

app.post("/generate", async (req, res) => {
  const { topic, audience, length } = req.body;
  if (!topic || !audience || !length) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const results = await Promise.all(
      ["A", "B", "C"].map(async (id) => {
        const { tone, style } = VARIATION_TONES[id];
        const prompt = `You are a LinkedIn content strategist for Business Intelligence professionals.
Write a LinkedIn post:
- Topic: ${topic}
- Audience: ${audience}
- Tone: ${tone} - ${style}
- Length: ${LENGTH_MAP[length]}
- Strong hook, short paragraphs, end with engagement question
- 5 hashtags on last line
- Output ONLY the post`;
        const text = await callGroq(prompt);
        return { id, text };
      })
    );
    const posts = {};
    results.forEach(({ id, text }) => { posts[id] = text; });
    res.json({ posts });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
