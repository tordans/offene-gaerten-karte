# Offene Gärten Karte

A React application that displays open gardens in Germany on an interactive map. The app scrapes garden data from [Offene Gärten](https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/), geocodes the addresses, and presents them in a user-friendly map interface.

## Features

- **Interactive Map**: Shows all gardens with geocoded coordinates using MapTiler
- **Month Filtering**: Filter gardens by opening month with count display
- **Garden Details**: Click markers to see address, opening dates, and link to original page
- **Responsive Design**: Clean, modern UI using Tailwind CSS

## Project Structure

```
offene-gaerten-karte/
├── app/                    # React application (Vite + TypeScript)
├── scripts/
│   ├── scrape/            # Web scraping scripts
│   └── geocode/           # Geocoding script
├── data/                  # Generated data files
└── .github/workflows/     # GitHub Actions for deployment
```

## Development

### Prerequisites

- Node.js 18+
- Bun (for scripts)

### Setup

1. **Scrape Garden Data**:
   ```bash
   cd scripts/scrape
   bun install
   bun run scrape.ts fetch-urls
   bun run scrape.ts fetch-pages
   bun run scrape.ts parse-pages
   ```

2. **Geocode Addresses**:
   ```bash
   cd scripts/geocode
   bun install
   bun run geocode.ts
   ```

3. **Run the React App**:
   ```bash
   cd app
   npm install
   npm run dev
   ```

## Deployment

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Manual Deployment

1. Build the app:
   ```bash
   cd app
   npm run build
   ```

2. The built files will be in `app/dist/`

### GitHub Pages

The app is automatically deployed to GitHub Pages when you push to the `main` branch. The deployment URL will be:
`https://[your-username].github.io/offene-gaerten-karte/`

## Data Flow

1. **Scraping**: Extract garden URLs, download pages, parse addresses and dates
2. **Geocoding**: Convert addresses to coordinates using Nominatim
3. **Display**: Show gardens on interactive map with filtering options

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Maps**: react-map-gl, MapTiler
- **Scraping**: Bun, fetch API
- **Geocoding**: Nominatim API
- **Deployment**: GitHub Actions, GitHub Pages
