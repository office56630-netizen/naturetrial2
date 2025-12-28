const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "music.html"));
});

// YouTube search API
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(url);

    const html = response.data;
    const videoIds = [...html.matchAll(/"videoId":"(.*?)"/g)].map(v => v[1]);
    const titles = [...html.matchAll(/"title":\{"runs":\[{"text":"(.*?)"}/g)].map(t => t[1]);

    const results = videoIds.slice(0, 10).map((id, i) => ({
      videoId: id,
      title: titles[i] || "No Title"
    }));

    res.json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json([]);
  }
});

// 🔥 EXPORT for Vercel (NO listen)
module.exports = app;
