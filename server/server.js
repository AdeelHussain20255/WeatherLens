const express = require('express');
const path = require('path');

// Node 18+ includes a built-in fetch implementation. The app is designed for modern
// runtimes so it can proxy Open-Meteo requests without adding a fetch dependency.
if (typeof fetch !== 'function') {
  console.error('This app requires Node.js 18 or newer because it uses built-in fetch.');
  process.exit(1);
}

const {
  listFavorites,
  addFavorite,
  removeFavorite,
  addHistoryEntry,
  listHistory
} = require('./storage');

const app = express();

app.use(express.json());

// ---- Static frontend ----
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ---- Open-Meteo endpoints (server-side proxy) ----
const WEATHER_API_GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast';

function mustNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error('Invalid number');
  return n;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstream error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

function buildForecastUrl(lat, lon) {
  // Request the current, hourly, and daily weather fields Open-Meteo provides.
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility',
    hourly: 'temperature_2m,weather_code,relative_humidity_2m,apparent_temperature',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
    timezone: 'auto'
  });
  return `${WEATHER_API_BASE}?${params.toString()}`;
}

function normalizeForecast(data, location) {
  // Keep only the frontend shape we need and fall back to empty arrays when fields are missing.
  return {
    location,
    current: data.current,
    current_units: data.current_units,
    hourly: {
      time: data.hourly?.time || [],
      temperature_2m: data.hourly?.temperature_2m || [],
      weather_code: data.hourly?.weather_code || []
    },
    daily: {
      time: data.daily?.time || [],
      weather_code: data.daily?.weather_code || [],
      temperature_2m_max: data.daily?.temperature_2m_max || [],
      temperature_2m_min: data.daily?.temperature_2m_min || [],
      sunrise: data.daily?.sunrise || [],
      sunset: data.daily?.sunset || [],
      uv_index_max: data.daily?.uv_index_max || []
    }
  };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/search', async (req, res) => {
  try {
    const city = String(req.query.city || '').trim();
    if (!city) return res.status(400).json({ error: 'Missing city' });

    const geoUrl = `${WEATHER_API_GEOCODE}?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;

    const geo = await fetchJson(geoUrl);
    if (!geo.results || geo.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const r = geo.results[0];
    const location = {
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      lat: r.latitude,
      lon: r.longitude
    };

    const forecastUrl = buildForecastUrl(location.lat, location.lon);
    const forecast = await fetchJson(forecastUrl);
    const payload = normalizeForecast(forecast, location);

    await addHistoryEntry({
      query: city,
      name: location.name,
      lat: location.lat,
      lon: location.lon
    });

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    const lat = mustNumber(req.query.lat);
    const lon = mustNumber(req.query.lon);
    const name = String(req.query.name || 'Your Location');

    const location = { name, lat, lon };
    const forecastUrl = buildForecastUrl(lat, lon);
    const forecast = await fetchJson(forecastUrl);
    const payload = normalizeForecast(forecast, location);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Bad request' });
  }
});

// ---- Favorites & history (simple JSON persistence) ----
app.get('/api/favorites', async (req, res) => {
  res.json(await listFavorites());
});

app.post('/api/favorites', async (req, res) => {
  const { name, lat, lon } = req.body || {};
  if (!name || typeof lat !== 'number' || typeof lon !== 'number') {
    return res.status(400).json({ error: 'name, lat, lon required' });
  }
  res.json(await addFavorite({ name, lat, lon }));
});

app.delete('/api/favorites/:id', async (req, res) => {
  res.json(await removeFavorite(req.params.id));
});

app.get('/api/history', async (req, res) => {
  res.json(await listHistory());
});

// ---- SPA fallback (optional) ----
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WeatherLens server running on http://localhost:${PORT}`);
});

