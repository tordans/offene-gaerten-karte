# Offene Gärten Karte App

This is a React app (Vite + TypeScript + Tailwind CSS + react-map-gl) that visualizes the gardens from `../../data/gardens-parsed.json`.

- Shows all gardens as markers on a map (maps.black background)
- Sidebar navigation for filtering by month (Jan–Dec, with counts)
- Click on markers to see garden details and opening dates
- Gardens appear in all months they are open

## Usage

1. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```

2. Start the dev server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```

The app expects `../../data/gardens-parsed.json` to exist.

## Features

- **Map View**: Interactive map showing all gardens with geocoded coordinates
- **Month Filtering**: Filter gardens by opening month with count display
- **Garden Details**: Click markers to see address, opening dates, and link to original page
- **Responsive Design**: Sidebar with filters and full-screen map
- **Modern UI**: Clean design using Tailwind CSS
