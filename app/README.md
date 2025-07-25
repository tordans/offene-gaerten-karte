# Offene Gärten Karte App

This is a React app (Vite + TypeScript + Tailwind CSS + react-map-gl) that visualizes the gardens from `../../data/gardens.json`.

- Shows all gardens as markers on a map (maps.black background)
- Sidebar navigation for filtering by month (Jan–Dec, with counts)

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

The app expects `../../data/gardens.json` to exist.
