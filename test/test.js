const assert = require('node:assert').strict;
const fs = require('fs/promises');
const path = require('path');

// Use a temporary database file for tests so we do not overwrite real user data.
const tempDb = path.join(__dirname, 'temp-db.json');
process.env.WEATHER_APP_DB_PATH = tempDb;

const {
  addFavorite,
  listFavorites,
  removeFavorite,
  addHistoryEntry,
  listHistory
} = require('../server/storage');

async function cleanup() {
  await fs.rm(tempDb, { force: true });
}

async function runTests() {
  await cleanup();

  const favoriteResponse = await addFavorite({ name: 'Test City', lat: 10.5, lon: 20.75 });
  assert.equal(favoriteResponse.ok, true, 'Favorite should be saved successfully');
  assert.equal(favoriteResponse.duplicate, undefined, 'New favorite should not be marked duplicate');

  const favorites = await listFavorites();
  assert.equal(favorites.length, 1, 'Should return one saved favorite');
  assert.equal(favorites[0].name, 'Test City');

  const removeResponse = await removeFavorite(favorites[0].id);
  assert.equal(removeResponse.ok, true, 'Remove favorite response should still be ok');
  assert.equal(removeResponse.removed, true, 'Favorite should be removed');

  const historyEntry = await addHistoryEntry({ query: 'test query', name: 'Test City', lat: 10.5, lon: 20.75 });
  assert.equal(historyEntry.name, 'Test City', 'History entry name should be preserved');

  const history = await listHistory();
  assert.equal(history.length, 1, 'History should contain one entry');
  assert.equal(history[0].query, 'test query');

  await cleanup();
  console.log('All tests passed.');
}

runTests().catch((error) => {
  console.error('Test failure:', error);
  process.exit(1);
});
