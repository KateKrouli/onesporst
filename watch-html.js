import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_KEY = process.env.API_KEY;
if (!API_KEY) console.warn('watch-html: API_KEY not set in environment; proxy requests will likely fail. Create a .env file or set API_KEY env var.');

// Прокси-эндпоинт
app.get("/matches", async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  if (!dateFrom || !dateTo) return res.status(400).json({ error: "Укажите dateFrom и dateTo" });

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Ошибка прокси" });
  }
});

// Слушаем все интерфейсы для Codespaces
app.listen(5000, "0.0.0.0", () => console.log("Proxy запущен на http://0.0.0.0:5000"));
