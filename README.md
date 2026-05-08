# WeatherLens (Full-Stack)

A calming and immersive weather application designed to connect users with nature while providing accurate weather information.

## Core Vision

This app aims to evoke peace and a deep connection to nature. Its design incorporates natural elements, calm colors, and organic flows, offering a serene experience like observing a peaceful landscape.

## Features

### Core
-   **Search Weather by City Name**: Real-time search with input validation and a search history.
-   **Geolocation Detection**: Auto-detects user's current location and displays weather on load, with fallback for denied permissions.
-   **Comprehensive Weather Display**: Shows current temperature, conditions, humidity, wind speed, "feels like" temperature, pressure, visibility, sunrise/sunset times.
-   **Saved Locations (Server-Persisted)**: Save and manage favorite locations (stored on the backend).
-   **Dynamic Nature-Based Backgrounds**: Backgrounds change based on weather conditions.

### Planned/Advanced (Future Enhancements)
-   Hourly and 5-day forecasts.
-   Smart notifications for extreme weather.
-   Personalization options (Celsius/Fahrenheit toggle, theme customization).
-   Interactive elements and subtle animations.
-   Monthly weather statistics and trends.
-   Favorite locations management.

## Technical Stack

-   **Frontend**: HTML5 + Tailwind (CDN) + Vanilla JavaScript
-   **Backend**: Node.js + Express (serves the frontend + provides `/api/*` endpoints)
-   **Weather Data**: Open‑Meteo (geocoding + forecast)
-   **Persistence**: JSON file storage (`data/db.json`) for favorites + search history
-   **Responsiveness**: Mobile-first design

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Run the full-stack app

```bash
npm start
```

Then open:
`http://localhost:3000`

## Usage Guidelines & Rate Limits

-   Open‑Meteo is free and does not require an API key, but always be considerate with request frequency.
-   Handle API errors gracefully (e.g., city not found) — the app displays notifications.

## Testing & Linting

-   Run the built-in storage tests:
    ```bash
    npm test
    ```
-   Run ESLint over the project:
    ```bash
    npm run lint
    ```

## File Structure

```
weather-app/
├── public/
│   ├── index.html       (Frontend UI)
│   ├── script.js        (Frontend logic)
│   └── styles.css       (Small custom CSS)
├── server/
│   ├── server.js        (Express server + API routes)
│   └── storage.js       (Simple JSON persistence)
├── data/
│   └── db.json          (Created automatically on first run)
├── package.json
└── README.md
```

Enjoy your peaceful weather experience!
