const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const html = response.data;

    const matches = [...html.matchAll(/"videoId":"(.*?)".*?"title":{"runs":\[{"text":"(.*?)"}\]/g)];

    const results = matches.slice(0, 10).map(m => ({
      id: m[1],
      title: m[2]
    }));

    res.json(results);
  } catch (err) {
    res.json([]);
  }
});

module.exports = app;   // export app
