// WeatherLens (Full-stack edition)
// Frontend talks to our Express backend under /api/*

const weatherCodeMap = {
  0: { icon: "wb_sunny", condition: "Clear" },
  1: { icon: "wb_sunny", condition: "Clear" },
  2: { icon: "cloud", condition: "Clouds" },
  3: { icon: "cloud", condition: "Clouds" },
  45: { icon: "cloud", condition: "Mist" },
  48: { icon: "cloud", condition: "Mist" },
  51: { icon: "water_drop", condition: "Drizzle" },
  53: { icon: "water_drop", condition: "Drizzle" },
  55: { icon: "water_drop", condition: "Drizzle" },
  61: { icon: "water_drop", condition: "Rain" },
  63: { icon: "water_drop", condition: "Rain" },
  65: { icon: "water_drop", condition: "Rain" },
  71: { icon: "ac_unit", condition: "Snow" },
  73: { icon: "ac_unit", condition: "Snow" },
  75: { icon: "ac_unit", condition: "Snow" },
  77: { icon: "ac_unit", condition: "Snow" },
  80: { icon: "water_drop", condition: "Rain" },
  81: { icon: "water_drop", condition: "Rain" },
  82: { icon: "water_drop", condition: "Rain" },
  85: { icon: "ac_unit", condition: "Snow" },
  86: { icon: "ac_unit", condition: "Snow" },
  95: { icon: "water_drop", condition: "Thunderstorm" },
  96: { icon: "water_drop", condition: "Thunderstorm" },
  99: { icon: "water_drop", condition: "Thunderstorm" }
};

const state = {
  isCelsius: true,
  data: null
};

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(celsius) {
  if (celsius == null || Number.isNaN(Number(celsius))) return "—";
  const v = state.isCelsius ? Number(celsius) : cToF(Number(celsius));
  return String(Math.round(v));
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  const bgColor = type === "error" ? "bg-error" : type === "info" ? "bg-secondary" : "bg-primary";

  notification.className = `fixed top-20 right-4 ${bgColor} text-on-primary px-6 py-3 rounded-full shadow-lg z-[70] font-body-md`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "fadeOut 0.25s ease-out forwards";
    setTimeout(() => notification.remove(), 260);
  }, 2200);
}

async function apiFetch(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `Request failed (${res.status})`;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || message;
    } catch {
      // ignore parse errors and keep the raw text
    }
    throw new Error(message);
  }
  return res.json();
}

function generatePoeticDescription(condition) {
  const descriptions = {
    Clear: ["A golden embrace of sunlight", "Crystal skies stretch endlessly", "Pure light breaks through", "Endless blue and radiance"],
    Clouds: ["Soft clouds drift lazily", "A gentle veil of serenity", "Nature's canvas in gray", "Contemplative clouds gather"],
    Rain: ["Gentle drops nourish the earth", "A symphony of rain", "Nature quenches her thirst", "Petrichor fills the air"],
    Drizzle: ["Soft mist kisses the ground", "Light rain whispers softly", "A gentle, nourishing drizzle", "Misty veils drift gently"],
    Thunderstorm: ["Nature's powerful display", "Thunder echoes through sky", "Electric energy unleashed", "A dramatic transformation"],
    Snow: ["Pristine white blanket", "Crystalline beauty descends", "Winter's quiet wonder", "Nature's frozen art"],
    Mist: ["A quiet hush over the world", "Fog drifts like a soft curtain", "Muted horizons, calm minds", "A gentle blur of peace"]
  };
  const arr = descriptions[condition] || descriptions.Clouds;
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateBackground(condition) {
  // Map conditions to background image files based on the actual weather pattern
  const backgroundImages = {
    Clear: "/assets/backgrounds/clear.jpg",
    Clouds: "/assets/backgrounds/clouds.jpg",
    Rain: "/assets/backgrounds/rain.jpg",
    Drizzle: "/assets/backgrounds/rain.jpg",
    Thunderstorm: "/assets/backgrounds/thunder.jpg",
    Snow: "/assets/backgrounds/snow.jpg",
    Mist: "/assets/backgrounds/mist.jpg",
    Fog: "/assets/backgrounds/mist.jpg"
  };

  // Use the direct condition-to-image mapping for more accurate backgrounds
  const url = backgroundImages[condition] || backgroundImages.Mist;

  // Add a soft overlay to keep text readable on top of the illustration
  document.body.style.backgroundImage = `linear-gradient(rgba(251, 249, 246, 0.5), rgba(251, 249, 246, 0.5)), url('${url}')`;
  document.body.style.backgroundColor = "#fbf9f6";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
}

function displayWeather(payload) {
  state.data = payload;

  const locationName = document.getElementById("locationName");
  const poeticDesc = document.getElementById("poeticDesc");
  const weatherIcon = document.getElementById("weatherIcon");
  const tempValue = document.getElementById("tempValue");
  const feelsLike = document.getElementById("feelsLike");

  const humidityValue = document.getElementById("humidityValue");
  const windValue = document.getElementById("windValue");
  const pressureValue = document.getElementById("pressureValue");
  const visibilityValue = document.getElementById("visibilityValue");

  const uvValue = document.getElementById("uvValue");
  const uvBar = document.getElementById("uvBar");
  const sunriseValue = document.getElementById("sunriseValue");
  const sunsetValue = document.getElementById("sunsetValue");

  const current = payload.current || {};
  const info = weatherCodeMap[current.weather_code] || { icon: "wb_sunny", condition: "Clear" };

  if (locationName) locationName.textContent = payload.location?.name || "—";
  if (poeticDesc) poeticDesc.textContent = `"${generatePoeticDescription(info.condition)}"`;

  if (weatherIcon) {
    weatherIcon.textContent = info.icon;
    weatherIcon.setAttribute("data-icon", info.icon);
    weatherIcon.style.fontVariationSettings = info.condition === "Clear" ? "'FILL' 1" : "'FILL' 0";
  }

  if (tempValue) tempValue.textContent = formatTemp(current.temperature_2m);

  if (feelsLike) {
    const feels = current.apparent_temperature;
    feelsLike.textContent = `Feels like: ${formatTemp(feels)}°${state.isCelsius ? "C" : "F"}`;
  }

  if (humidityValue) humidityValue.textContent = current.relative_humidity_2m != null ? `${Math.round(current.relative_humidity_2m)}%` : "—";
  if (windValue) windValue.textContent = current.wind_speed_10m != null ? `${Math.round(current.wind_speed_10m)} km/h` : "—";
  if (pressureValue) pressureValue.textContent = current.pressure_msl != null ? `${Math.round(current.pressure_msl)} hPa` : "—";
  if (visibilityValue) {
    const km = current.visibility != null ? (Number(current.visibility) / 1000).toFixed(1) : null;
    visibilityValue.textContent = km ? `${km} km` : "—";
  }

  // Analytics: daily[0]
  const uvMax = payload.daily?.uv_index_max?.[0];
  if (uvValue) uvValue.textContent = uvMax != null ? `${uvMax}` : "—";
  if (uvBar) {
    const pct = uvMax != null ? Math.max(5, Math.min(100, (Number(uvMax) / 12) * 100)) : 10;
    uvBar.style.width = `${pct}%`;
  }
  if (sunriseValue) sunriseValue.textContent = formatTime(payload.daily?.sunrise?.[0]);
  if (sunsetValue) sunsetValue.textContent = formatTime(payload.daily?.sunset?.[0]);

  updateBackground(info.condition);
  displayForecast(payload);
  renderInsights(payload);
}

function formatTime(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function displayForecast(payload) {
  displayHourly(payload.hourly);
  displayDaily(payload.daily);
}

function displayHourly(hourly) {
  const hourlyContainer = document.getElementById("hourlyContainer");
  if (!hourlyContainer) return;
  hourlyContainer.innerHTML = "";

  const times = hourly?.time || [];
  const temps = hourly?.temperature_2m || [];
  const codes = hourly?.weather_code || [];

  for (let i = 0; i < 8 && i < times.length; i++) {
    const time = new Date(times[i]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const temp = temps[i];
    const info = weatherCodeMap[codes[i]] || { icon: "wb_sunny" };

    const card = document.createElement("div");
    card.className =
      "glass-panel min-w-[110px] p-4 rounded-lg flex flex-col items-center flex-shrink-0 botanical-shadow cursor-pointer hover:scale-[1.02] transition-transform" +
      (i === 2 ? " bg-primary-container/10" : "");
    card.innerHTML = `
      <span class="text-xs text-outline mb-3">${time}</span>
      <span class="material-symbols-outlined text-primary mb-3" data-icon="${info.icon}">${info.icon}</span>
      <span class="font-headline-md text-headline-md">${formatTemp(temp)}°</span>
    `;
    hourlyContainer.appendChild(card);
  }
}

function displayDaily(daily) {
  const container = document.getElementById("dailyContainer");
  if (!container) return;
  container.innerHTML = "";

  const times = daily?.time || [];
  const maxTemps = daily?.temperature_2m_max || [];
  const minTemps = daily?.temperature_2m_min || [];
  const codes = daily?.weather_code || [];
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (let i = 0; i < 5 && i < times.length; i++) {
    const date = new Date(times[i]);
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((dateStart - todayStart) / (1000 * 60 * 60 * 24));

    const dayName =
      diffDays === 0
        ? "Today"
        : diffDays === 1
        ? "Tomorrow"
        : date.toLocaleDateString("en-US", { weekday: "long" });

    const info = weatherCodeMap[codes[i]] || { icon: "wb_sunny" };

    const card = document.createElement("div");
    card.className =
      "glass-panel px-6 py-4 rounded-lg flex items-center justify-between botanical-shadow";
    card.innerHTML = `
      <span class="w-24">${dayName}</span>
      <span class="material-symbols-outlined text-primary" data-icon="${info.icon}">${info.icon}</span>
      <div class="flex gap-4">
        <span class="font-bold">${formatTemp(maxTemps[i])}°</span>
        <span class="text-secondary">${formatTemp(minTemps[i])}°</span>
      </div>
    `;
    container.appendChild(card);
  }
}

async function fetchWeatherByCity(city) {
  try {
    showNotification("Fetching weather data...");
    const payload = await apiFetch(`/api/search?city=${encodeURIComponent(city)}`);
    displayWeather(payload);
    await refreshHistory();
    showNotification(`Weather updated for ${payload.location?.name || city}!`);
  } catch (err) {
    console.error(err);
    showNotification(err.message || "Failed to fetch weather data.", "error");
  }
}

async function fetchWeatherByCoords(lat, lon, name = "Your Location") {
  try {
    showNotification("Fetching weather data...");
    const payload = await apiFetch(
      `/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&name=${encodeURIComponent(name)}`
    );
    displayWeather(payload);
    showNotification("Weather updated!");
  } catch (err) {
    console.error(err);
    showNotification(err.message || "Failed to fetch weather data.", "error");
  }
}

function getGeolocationWeather() {
  if (!navigator.geolocation) {
    showNotification("Geolocation not supported. Defaulting to San Francisco.", "info");
    fetchWeatherByCity("San Francisco");
    return;
  }

  showNotification("Detecting your location...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude, "Your Location");
    },
    (err) => {
      console.error("Geolocation error:", err);
      showNotification("Location access denied. Defaulting to San Francisco.", "info");
      fetchWeatherByCity("San Francisco");
    }
  );
}

function setUnit(isCelsius) {
  state.isCelsius = isCelsius;
  // Button styling
  const c = document.getElementById("celsiusBtn");
  const f = document.getElementById("fahrenheitBtn");
  if (c && f) {
    if (isCelsius) {
      c.classList.add("bg-primary", "text-on-primary");
      c.classList.remove("bg-surface-container", "text-on-surface");
      f.classList.remove("bg-primary", "text-on-primary");
      f.classList.add("bg-surface-container", "text-on-surface");
    } else {
      f.classList.add("bg-primary", "text-on-primary");
      f.classList.remove("bg-surface-container", "text-on-surface");
      c.classList.remove("bg-primary", "text-on-primary");
      c.classList.add("bg-surface-container", "text-on-surface");
    }
  }

  if (state.data) displayWeather(state.data);
}

function toggleSettingsSidebar() {
  const sidebar = document.getElementById("settings-sidebar");
  if (sidebar) sidebar.classList.toggle("-translate-x-full");
}

function setupTabs() {
  const forecastSection = document.getElementById("forecastSection");
  const savedSection = document.getElementById("savedSection");
  const insightsSection = document.getElementById("insightsSection");

  function show(tab) {
    forecastSection?.classList.toggle("hidden", tab !== "forecast");
    savedSection?.classList.toggle("hidden", tab !== "saved");
    insightsSection?.classList.toggle("hidden", tab !== "insights");

    document.querySelectorAll(".tab-btn").forEach((b) => {
      const active = b.getAttribute("data-tab") === tab;
      b.classList.toggle("text-primary", active);
      b.classList.toggle("font-bold", active);
      b.classList.toggle("text-secondary", !active);
    });
  }

  document.querySelectorAll('[data-tab="forecast"],[data-tab="saved"],[data-tab="insights"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tab = btn.getAttribute("data-tab");
      show(tab);
      if (tab === "saved") await refreshFavorites();
      if (tab === "forecast") await refreshHistory();
    });
  });

  show("forecast");
}

async function refreshHistory() {
  const container = document.getElementById("historyChips");
  if (!container) return;
  try {
    const items = await apiFetch("/api/history");
    container.innerHTML = "";
    items.forEach((h) => {
      const chip = document.createElement("button");
      chip.className = "px-3 py-1 rounded-full text-sm bg-primary-container/20 text-primary hover:bg-primary-container/30 transition-colors";
      chip.textContent = h.name || h.query;
      chip.addEventListener("click", () => fetchWeatherByCity(h.name || h.query));
      container.appendChild(chip);
    });
  } catch (err) {
    console.error(err);
  }
}

async function refreshFavorites() {
  const list = document.getElementById("favoritesList");
  if (!list) return;
  try {
    const favorites = await apiFetch("/api/favorites");
    list.innerHTML = "";

    if (!favorites.length) {
      const empty = document.createElement("div");
      empty.className = "text-secondary";
      empty.textContent = "No saved locations yet. Open Forecast and tap the save icon.";
      list.appendChild(empty);
      return;
    }

    favorites.forEach((f) => {
      const card = document.createElement("div");
      card.className = "glass-panel p-5 rounded-lg botanical-shadow flex items-center justify-between";
      card.innerHTML = `
        <div>
          <div class="font-medium text-on-surface">${f.name}</div>
          <div class="text-xs text-secondary">${Number(f.lat).toFixed(2)}, ${Number(f.lon).toFixed(2)}</div>
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-2 rounded-full bg-primary text-on-primary text-sm" data-action="view">View</button>
          <button class="px-3 py-2 rounded-full bg-surface-container text-on-surface text-sm" data-action="remove">Remove</button>
        </div>
      `;
      card.querySelector('[data-action="view"]').addEventListener("click", () => {
        // switch to forecast and load
        document.querySelector('[data-tab="forecast"]')?.click();
        fetchWeatherByCoords(f.lat, f.lon, f.name);
      });
      card.querySelector('[data-action="remove"]').addEventListener("click", async () => {
        await apiFetch(`/api/favorites/${encodeURIComponent(f.id)}`, { method: "DELETE" });
        await refreshFavorites();
        showNotification("Removed.");
      });
      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showNotification("Failed to load favorites.", "error");
  }
}

async function saveCurrentLocation() {
  const loc = state.data?.location;
  if (!loc?.name || loc.lat == null || loc.lon == null) return;
  try {
    const res = await apiFetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: loc.name, lat: Number(loc.lat), lon: Number(loc.lon) })
    });
    if (res.duplicate) showNotification("Already saved.", "info");
    else showNotification("Saved!");
  } catch (err) {
    console.error(err);
    showNotification("Failed to save location.", "error");
  }
}

function renderInsights(payload) {
  const container = document.getElementById("insightsCards");
  if (!container) return;
  container.innerHTML = "";

  const current = payload.current || {};
  const daily = payload.daily || {};
  const uv = daily.uv_index_max?.[0];
  const sunrise = daily.sunrise?.[0];
  const sunset = daily.sunset?.[0];

  const cards = [
    { title: "Feels like", value: `${formatTemp(current.apparent_temperature)}°${state.isCelsius ? "C" : "F"}`, icon: "thermostat" },
    { title: "UV (max)", value: uv != null ? String(uv) : "—", icon: "light_mode" },
    { title: "Sunrise/Sunset", value: `${formatTime(sunrise)} / ${formatTime(sunset)}`, icon: "wb_twilight" }
  ];

  cards.forEach((c) => {
    const el = document.createElement("div");
    el.className = "glass-panel p-6 rounded-lg botanical-shadow";
    el.innerHTML = `
      <div class="flex items-center gap-3 mb-2">
        <span class="material-symbols-outlined text-primary" data-icon="${c.icon}">${c.icon}</span>
        <div class="font-medium">${c.title}</div>
      </div>
      <div class="text-2xl font-bold">${c.value}</div>
    `;
    container.appendChild(el);
  });
}

function setupInteractions() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const useLocationBtn = document.getElementById("useLocationBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const minimizeBtn = document.getElementById("minimizeBtn");
  const analyticsToggle = document.getElementById("analyticsToggle");
  const analyticsContent = document.getElementById("analyticsContent");

  const celsiusBtn = document.getElementById("celsiusBtn");
  const fahrenheitBtn = document.getElementById("fahrenheitBtn");

  const saveCurrentBtn = document.getElementById("saveCurrentBtn");

  function doSearch() {
    const city = (searchInput?.value || "").trim();
    if (!city) return;
    fetchWeatherByCity(city);
    searchInput.value = "";
  }

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
  searchBtn?.addEventListener("click", doSearch);

  useLocationBtn?.addEventListener("click", getGeolocationWeather);
  settingsBtn?.addEventListener("click", toggleSettingsSidebar);

  minimizeBtn?.addEventListener("click", () => {
    const details = document.getElementById("forecastDetails");
    details?.classList.toggle("hidden");
  });

  analyticsToggle?.addEventListener("click", () => {
    analyticsContent?.classList.toggle("hidden");
  });

  celsiusBtn?.addEventListener("click", () => setUnit(true));
  fahrenheitBtn?.addEventListener("click", () => setUnit(false));

  saveCurrentBtn?.addEventListener("click", saveCurrentLocation);

  document.addEventListener("keydown", (e) => {
    if (e.key === "/") {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.key === "Escape") {
      const sidebar = document.getElementById("settings-sidebar");
      if (sidebar && !sidebar.classList.contains("-translate-x-full")) toggleSettingsSidebar();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setupInteractions();
  setupTabs();
  setUnit(true);
  await refreshHistory();
  getGeolocationWeather();
  console.log("WeatherLens app initialized successfully!");
});
