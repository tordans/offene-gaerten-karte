import { MapProvider } from 'react-map-gl/maplibre'
import type { GardensJson } from './types'
// Import data as a module
import 'maplibre-gl/dist/maplibre-gl.css'
import BackgroundToggle from './BackgroundToggle'
import gardensData from './data/gardens-and-dates.json'
import DateFilter from './DateFilter'
import DebugPanel from './DebugPanel'
import FavoritesSection from './FavoritesSection'
import Footer from './Footer'
import MapComponent from './MapComponent'
import ProjectDescription from './ProjectDescription'

function App() {
  const gardens = gardensData as GardensJson

  return (
    <MapProvider>
      <div className="flex h-screen bg-amber-50">
        <DebugPanel gardens={gardens} gardensData={gardensData} />

        <div className="w-80 overflow-y-auto border-r-2 border-red-800 bg-amber-100 p-4 shadow-lg">
          <h1 className="mb-2 text-xl font-bold text-red-700">Offene Gärten Karte</h1>

          <ProjectDescription />

          <FavoritesSection gardens={gardens} />

          <DateFilter gardens={gardens} />

          <BackgroundToggle />

          <Footer />
        </div>

        <MapComponent gardens={gardens} />
      </div>
    </MapProvider>
  )
}

export default App
