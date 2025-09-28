import { MapProvider } from 'react-map-gl/maplibre';
import type { GardensJson } from './types';
// Import data as a module
import gardensData from './data/gardens-and-dates.json';
import DebugPanel from './DebugPanel';
import DebugToggle from './DebugToggle';
import BackgroundToggle from './BackgroundToggle';
import DateFilter from './DateFilter';
import FavoritesSection from './FavoritesSection';
import ProjectDescription from './ProjectDescription';
import MapComponent from './MapComponent';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  const gardens = gardensData as GardensJson;



  return (
    <MapProvider>
      <div className="h-screen flex bg-amber-50">
        <DebugPanel
          gardens={gardens}
          gardensData={gardensData}
        />

        <div className="w-80 bg-amber-100 shadow-lg p-4 overflow-y-auto border-r-2 border-red-800">
          <h1 className="text-xl font-bold mb-4 text-red-700">Offene Gärten Karte</h1>

          <ProjectDescription />

          <DateFilter gardens={gardens} />

          <FavoritesSection gardens={gardens} />

          <BackgroundToggle />

          <div className="mt-auto pt-4 border-t border-gray-200">
            <DebugToggle />
          </div>

        </div>

        <MapComponent gardens={gardens} />
      </div>
    </MapProvider>
  );
}

export default App;
