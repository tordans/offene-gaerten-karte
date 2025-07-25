import { useState, useEffect } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import type { Garden, GardensJson } from './types';
import 'maplibre-gl/dist/maplibre-gl.css';

// Use MapTiler landscape style
const MAP_STYLE = 'https://api.maptiler.com/maps/landscape/style.json?key=ur6Yh3ULc6QjatOYBgln';

function App() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 13.4050, // Berlin center
    latitude: 52.5200,
    zoom: 8
  });

  useEffect(() => {
    // Copy the data file to public directory first, then access it
    fetch('/data/gardens-parsed.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: GardensJson) => setGardens(data))
      .catch(error => {
        console.error('Error loading gardens:', error);
        // Fallback: try to load from relative path
        fetch('../../data/gardens-parsed.json')
          .then(response => response.json())
          .then((data: GardensJson) => setGardens(data))
          .catch(err => console.error('Fallback also failed:', err));
      });
  }, []);

  const filteredGardens = selectedMonth
    ? gardens.filter(garden =>
        garden.dates.some(date => date.parsed.month === selectedMonth)
      )
    : gardens;

  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      count: gardens.filter(garden =>
        garden.dates.some(date => date.parsed.month === month)
      ).length
    };
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Offene Gärten</h1>

        {/* Month Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Filter by Month</h2>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`w-full text-left px-3 py-2 rounded ${
                selectedMonth === null
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              All Gardens ({gardens.length})
            </button>
            {monthCounts.map(({ month, count }) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedMonth === month
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {monthNames[month - 1]} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Garden Info */}
        {selectedGarden && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">{selectedGarden.address.raw}</h3>
            <div className="text-sm text-gray-600 mb-2">
              <a
                href={selectedGarden.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Details
              </a>
            </div>
            <div className="text-sm">
              <strong>Opening Dates:</strong>
              <ul className="mt-1 space-y-1">
                {selectedGarden.dates.map((date, index) => (
                  <li key={index} className="text-gray-700">
                    {date.raw}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          {filteredGardens
            .filter(garden => garden.lat && garden.lng)
            .map((garden) => (
              <Marker
                key={garden._id || garden.url}
                longitude={garden.lng!}
                latitude={garden.lat!}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedGarden(garden);
                }}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600 transition-colors" />
              </Marker>
            ))}

          {selectedGarden && selectedGarden.lat && selectedGarden.lng && (
            <Popup
              longitude={selectedGarden.lng}
              latitude={selectedGarden.lat}
              onClose={() => setSelectedGarden(null)}
              closeButton={true}
              closeOnClick={false}
              className="max-w-xs"
            >
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">
                  {selectedGarden.address.raw}
                </h3>
                <div className="text-xs text-gray-600 mb-2">
                  <a
                    href={selectedGarden.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </a>
                </div>
                <div className="text-xs">
                  <strong>Opening Dates:</strong>
                  <ul className="mt-1 space-y-1">
                    {selectedGarden.dates.map((date, index) => (
                      <li key={index} className="text-gray-700">
                        {date.raw}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}

export default App;
