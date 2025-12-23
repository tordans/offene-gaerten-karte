import { MapProvider } from 'react-map-gl/maplibre'
import type { GardensJson } from './types'
// Import data as a module
import 'maplibre-gl/dist/maplibre-gl.css'
import DebugPanel from './DebugPanel'
import gardensData from './data/gardens-and-dates.json'
import MapComponent from './MapComponent'
import Sidebar from './Sidebar'

function App() {
  const gardens = gardensData as GardensJson

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
