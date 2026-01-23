import { useEffect } from 'react'
import { MapProvider } from 'react-map-gl/maplibre'
import type { GardensJson } from './types'
// Import data as a module
import 'maplibre-gl/dist/maplibre-gl.css'
import DebugPanel from './DebugPanel'
import gardensData from './data/gardens-and-dates.json'
import MapComponent from './MapComponent'
import Sidebar from './Sidebar'
import { useFavorites } from './stores/useFavoritesState'
import { useFavoritesFeatureActions } from './stores/useFavoritesFeatureState'

function App() {
  const gardens = gardensData as GardensJson
  const { enable } = useFavoritesFeatureActions()
  const [favorites] = useFavorites()

  useEffect(() => {
    // Check if favorites exist in URL state via nuqs
    if (favorites.length > 0) {
      enable()
    }
  }, [favorites, enable])

  return (
    <MapProvider>
      <div className="flex h-screen bg-amber-50">
        <DebugPanel gardens={gardens} gardensData={gardensData} />

        <Sidebar gardens={gardens} />

        <MapComponent gardens={gardens} />
      </div>
    </MapProvider>
  )
}

export default App
