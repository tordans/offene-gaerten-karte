# Offene Gärten Karte

A React application that displays open gardens in Germany on an interactive map. The app uses pre-processed garden data and presents them in a user-friendly map interface.

## Features

- **Interactive Map**: Shows all gardens with geocoded coordinates using MapTiler
- **Month Filtering**: Filter gardens by opening month with count display
- **Garden Details**: Click markers to see address, opening dates, and link to original page
- **Responsive Design**: Clean, modern UI using Tailwind CSS

## Project Structure

```
offene-gaerten-karte/
├── app/                    # React application (Vite + TypeScript)
├── data/                   # Garden data files
├── shared/                 # Shared types and utilities
└── .github/workflows/      # GitHub Actions for deployment
```

## Development

### Prerequisites

- Node.js 18+

### Setup

1. **Run the React App**:
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

1. **Data**: Uses pre-processed garden data from `data/gardens-parsed.json`
2. **Display**: Show gardens on interactive map with filtering options

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Maps**: react-map-gl, MapTiler
- **Deployment**: GitHub Actions, GitHub Pages
