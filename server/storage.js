const fs = require('fs/promises');
const path = require('path');

// Allow tests or alternate environments to override the database path.
const DB_PATH = process.env.WEATHER_APP_DB_PATH || path.join(__dirname, '..', 'data', 'db.json');

// Serialize writes so concurrent requests do not corrupt the JSON file.
let pendingWrite = Promise.resolve();

function defaultDb() {
  return {
    favorites: [],
    history: []
  };
}

async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(defaultDb(), null, 2), 'utf8');
  }
}

async function readDb() {
  // Wait for any queued writes to finish before reading the file.
  await pendingWrite;
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultDb(), ...parsed };
  } catch {
    return defaultDb();
  }
}

async function writeDb(db) {
  await ensureDbFile();
  const data = JSON.stringify(db, null, 2);
  // Chain writes so only one write happens at a time.
  pendingWrite = pendingWrite.finally(() => fs.writeFile(DB_PATH, data, 'utf8'));
  await pendingWrite;
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function addHistoryEntry(entry, max = 10) {
  const db = await readDb();
  const normalized = {
    id: createId(),
    query: entry.query,
    name: entry.name,
    lat: entry.lat,
    lon: entry.lon,
    createdAt: new Date().toISOString()
  };

  db.history = [normalized, ...(db.history || [])]
    // de-dupe by name (keep latest)
    .reduce((acc, item) => {
      if (!acc.some((x) => x.name?.toLowerCase() === item.name?.toLowerCase())) acc.push(item);
      return acc;
    }, [])
    .slice(0, max);

  await writeDb(db);
  return normalized;
}

async function listHistory() {
  const db = await readDb();
  return db.history || [];
}

async function listFavorites() {
  const db = await readDb();
  return db.favorites || [];
}

async function addFavorite({ name, lat, lon }) {
  const db = await readDb();
  const exists = (db.favorites || []).some(
    (f) => f.name?.toLowerCase() === name?.toLowerCase()
  );
  if (exists) return { ok: true, duplicate: true };

  const favorite = {
    id: createId(),
    name,
    lat,
    lon,
    createdAt: new Date().toISOString()
  };

  db.favorites = [favorite, ...(db.favorites || [])];
  await writeDb(db);
  return { ok: true, favorite };
}

async function removeFavorite(id) {
  const db = await readDb();
  const before = db.favorites || [];
  db.favorites = before.filter((f) => f.id !== id);
  await writeDb(db);
  return { ok: true, removed: before.length !== db.favorites.length };
}

module.exports = {
  readDb,
  writeDb,
  listFavorites,
  addFavorite,
  removeFavorite,
  addHistoryEntry,
  listHistory
};

