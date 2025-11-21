import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// API keys
const API_KEY = process.env.API_KEY || '76b6f309a4d1ff9512ec99c2dd0ad8e5';
const CRICKET_KEY = process.env.CRICKET_API_KEY || 'eebe5ade-a481-477d-8f02-440685b4cd53';
const NEWS_KEY = process.env.NEWS_API_KEY || "9455fa9a233f46f290770aa1018c93e6";

// CORS
app.use(cors());

// --- Футбол ---
app.get("/matches/football", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date обязателен" });

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
      headers: {
        'x-rapidapi-key': API_KEY, 
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    const text = await response.text();
    console.log(`[DEBUG] Football API status: ${response.status}`);
    console.log(`[DEBUG] Football API body: ${text.slice(0, 1000)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Football API error ${response.status}`, raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "Invalid JSON", raw: text });
    }

    res.json(data);
  } catch (err) {
    console.error("Football proxy error:", err);
    res.status(500).json({ error: "Football proxy error" });
  }
});

// --- Крикет ---
app.get("/matches/cricket", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICKET_KEY}&offset=0`
    );

    const text = await response.text();
    console.log(`[DEBUG] Cricket API status: ${response.status}`);
    console.log(`[DEBUG] Cricket API body: ${text.slice(0, 500)}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Cricket API ${response.status}`, raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "Invalid JSON", raw: text });
    }

    if (!data.data || data.data.length === 0) {
      return res.json({ matches: [], message: "Матчей нет" });
    }

    const matches = data.data.map(match => ({
      id: match.id,
      name: match.name,
      venue: match.venue,
      status: match.status,
      teams: match.teams,
      date: match.dateTimeGMT,
      dateOnly: match.date,
      teamInfo: match.teamInfo,
      score: match.score
    }));

    res.json({ data: matches });
  } catch (err) {
    console.error("Cricket proxy error:", err);
    res.status(500).json({ error: "Крикет ошибка" });
  }
});

// --- Баскетбол ---

app.get("/matches/basketball", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date обязателен" });

  try {
    const response = await fetch(`https://v1.basketball.api-sports.io/games?date=${date}`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v1.basketball.api-sports.io'
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);

    if (!data.response || !Array.isArray(data.response)) {
      return res.json({ data: [] });
    }

    // Группируем по лигам, как футбол
    const leaguesMap = {};
    data.response.forEach(match => {
      const leagueId = match.league.id;
      if (!leaguesMap[leagueId]) {
        leaguesMap[leagueId] = {
          league: match.league,
          matches: []
        };
      }
      leaguesMap[leagueId].matches.push({
        id: match.id,
        date: match.date.start,
        status: match.status.long,
        teams: [match.teams.home.name, match.teams.away.name],
        teamInfo: [
          { name: match.teams.home.name, img: match.teams.home.logo },
          { name: match.teams.away.name, img: match.teams.away.logo }
        ]
      });
    });

    // вернём массив лиг в поле `data`, чтобы клиент ожидалую структуру корректно обрабатывал
    res.json({ data: Object.values(leaguesMap) });

  } catch (err) {
    console.error("Basketball proxy error:", err);
    res.status(500).json({ error: "Basketball proxy error" });
  }
});

// добавлен маршрут для волейбола (аналогично баскетболу)
app.get("/matches/volleyball", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date обязателен" });

  try {
    const response = await fetch(`https://v1.volleyball.api-sports.io/games?date=${date}`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v1.volleyball.api-sports.io'
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);

    if (!data.response || !Array.isArray(data.response)) {
      return res.json({ data: [] });
    }

    const leaguesMap = {};
    data.response.forEach(match => {
      const leagueId = match.league.id;
      if (!leaguesMap[leagueId]) {
        leaguesMap[leagueId] = {
          league: match.league,
          matches: []
        };
      }
      leaguesMap[leagueId].matches.push({
        id: match.id,
        date: match.date.start,
        status: match.status.long,
        teams: [match.teams.home.name, match.teams.away.name],
        teamInfo: [
          { name: match.teams.home.name, img: match.teams.home.logo },
          { name: match.teams.away.name, img: match.teams.away.logo }
        ]
      });
    });

    res.json({ data: Object.values(leaguesMap) });

  } catch (err) {
    console.error("Volleyball proxy error:", err);
    res.status(500).json({ error: "Volleyball proxy error" });
  }
});


// Эндпоинт для таблицы (standings) — прокси для api-football (v3)
app.get('/standings/football', async (req, res) => {
  const league = req.query.league;
  const season = req.query.season;

  if (!league || !season) {
    return res.status(400).json({ error: 'league и season обязательны' });
  }

  try {
    const url = `https://v3.football.api-sports.io/standings?league=${encodeURIComponent(league)}&season=${encodeURIComponent(season)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY, // Замените на свой API ключ
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    console.log(`[DEBUG] Standings API status: ${response.status}`);
    console.log(`[DEBUG] Standings API body (full response):`, text); // Выводим весь ответ

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Remote API error', status: response.status, raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Invalid JSON from standings API', e);
      return res.status(502).json({ error: 'Invalid JSON from standings API', raw: text });
    }

    // Выводим весь разобранный объект
    console.log(`[DEBUG] Parsed response data:`, data);

    const result = {
      league: (data?.response?.[0]?.league) || null,
      season: season,
      standings: []
    };

    const rawStandings = (Array.isArray(data.response) ? data.response.flatMap(r => {
      if (r?.league?.standings && Array.isArray(r.league.standings)) return r.league.standings.flat();
      if (r?.standings && Array.isArray(r.standings)) return r.standings.flat();
      return [];
    }) : []);

    result.standings = rawStandings.map(item => ({
      rank: item.rank ?? item.position ?? null,
      team: item.team?.name ?? item.team?.short ?? item.name ?? null,
      teamId: item.team?.id ?? null,
      logo: item.team?.logo ?? null,
      points: item.points ?? item.pts ?? null,
      form: item.form ?? null,
      all: item.all ?? item.matches ?? null
    }));

    res.json(result);
  } catch (err) {
    console.error('Standings proxy error:', err.stack || err);
    res.status(500).json({ error: 'Standings proxy error', message: err.message || String(err) });
  }
});

// Новости по теме
app.get("/news", async (req, res) => {
  try {
    const topic = req.query.q || "Football";
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${NEWS_KEY}`;
    const response = await axios.get(url);

    let articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt
    }));
    res.json({ articles });
  } catch (err) {
    console.error("News proxy error:", err);
    res.status(500).json({ error: "News proxy error" });
  }
});

// Новый маршрут для всех популярных запросов
app.get("/popular/all", (req, res) => {
  res.json({
    sport: [
      "Football",
      "Cricket ",
      "eSports ",
      "Basketball",
      "Volleyball",
      "Tennis",
      "MMA",
      "Highlights",
      "Motorsport",
      "Rugby",
      "Baseball",
      "Golf",
      "Hockey",
      "American Football",
      "Cycling",
      "Snooker",
      "Darts",
      "Winter Sports"
    ],
  });
});

// Статика
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Первый и единственный запуск сервера (оставить этот)
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
