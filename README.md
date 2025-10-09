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

```bash
cd app
npm install
npm run dev
```

The app is automatically deployed to GitHub Pages when you push to the `main` branch.
https://tordans.github.io/offene-gaerten-karte/

### Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **State management**: nuqs, zustand, useState
- **Maps**: react-map-gl, MapTiler
- **Deployment**: GitHub Actions, GitHub Pages
