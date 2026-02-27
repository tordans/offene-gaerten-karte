import { useEffect } from 'react'
import { MapProvider } from 'react-map-gl/maplibre'
import { type GardensJson, gardensJsonSchema } from '../../scripts/schemas.ts'
// Import data as a module
import 'maplibre-gl/dist/maplibre-gl.css'
import DebugPanel from './DebugPanel'
import gardensDataRaw from './data/gardens-and-dates.json'
import MapComponent from './MapComponent'
import Sidebar from './Sidebar'
import { useFavoritesFeatureActions } from './stores/useFavoritesFeatureState'
import { useFavorites } from './stores/useFavoritesState'

function App() {
  const gardens = gardensJsonSchema.parse(gardensDataRaw)
  const gardensData = gardensDataRaw as unknown as GardensJson
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
