import { useState, useEffect } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import type { Garden, GardensJson } from './types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
// Import data as a module
import gardensData from './data/gardens-parsed.json';
import 'maplibre-gl/dist/maplibre-gl.css';

// Use MapTiler landscape style
const MAP_STYLE = 'https://api.maptiler.com/maps/landscape/style.json?key=ur6Yh3ULc6QjatOYBgln';

// Function to format parsed dates with relative time
function formatDate(parsed: { day: number; month: number; year?: number }): { formatted: string; relative: string } {
  const year = parsed.year || new Date().getFullYear();

  // Create date object for formatting
  const date = new Date(year, parsed.month - 1, parsed.day);

  // Use German locale for date formatting
  const formatted = date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Create date object for relative time calculation
  const relative = formatDistanceToNow(date, {
    addSuffix: true,
    locale: de
  });

  return { formatted, relative };
}

function App() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 13.4050, // Berlin center
    latitude: 52.5200,
    zoom: 8
  });

  useEffect(() => {
    // Use imported data directly
    console.log('Loading gardens data:', gardensData);
    setGardens(gardensData as GardensJson);
  }, []);

  const filteredGardens = selectedMonth
    ? gardens.filter(garden =>
        garden.dates.some(date =>
          date.parsed.month === selectedMonth &&
          (selectedDay === null || date.parsed.day === selectedDay)
        )
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

  // Get available days for selected month with counts
  const availableDays = selectedMonth
    ? Array.from(
        new Set(
          gardens
            .flatMap(garden => garden.dates)
            .filter(date => date.parsed.month === selectedMonth)
            .map(date => date.parsed.day)
        )
      )
      .sort((a, b) => a - b)
      .map(day => ({
        day,
        count: gardens.filter(garden =>
          garden.dates.some(date =>
            date.parsed.month === selectedMonth &&
            date.parsed.day === day
          )
        ).length
      }))
    : [];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Helper function to get weekday name for a specific day
  const getWeekdayName = (day: number, month: number, year?: number) => {
    const date = new Date(year || new Date().getFullYear(), month - 1, day);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Offene Gärten Karte</h1>

        {/* Project Description */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            Diese interaktive Karte zeigt alle offenen Gärten aus der Datenbank von
            <a
              href="https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              Offene Gärten
            </a>
            . Die Daten daten wurden zuletzt am 25.7.2025 gescraped und geocodiert.
          </p>
          <p className="text-xs text-gray-500">
            <a
              href="https://github.com/tordans/offene-gaerten-karte"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub Repository
            </a>
          </p>
        </div>

        {/* Month Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Filter by Month</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedMonth(null);
                setSelectedDay(null);
              }}
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
                onClick={() => {
                  setSelectedMonth(month);
                  setSelectedDay(null);
                }}
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

        {/* Day Filter */}
        {selectedMonth && availableDays.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Filter by Day</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedDay(null)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedDay === null
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                All Days in {monthNames[selectedMonth - 1]} ({monthCounts.find(m => m.month === selectedMonth)?.count || 0})
              </button>
              {availableDays.map(({ day, count }) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedDay === day
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {getWeekdayName(day, selectedMonth)} {day}. {monthNames[selectedMonth - 1]} ({count})
                </button>
              ))}
            </div>
          </div>
        )}

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
                {selectedGarden.dates.map((date, index) => {
                  const { formatted, relative } = formatDate(date.parsed);
                  return (
                    <li key={index} className="text-gray-700">
                      <div>{formatted} {date.parsed.startTime && date.parsed.endTime && `(${date.parsed.startTime}-${date.parsed.endTime})`}</div>
                      <div className="text-xs text-gray-500">{relative}</div>
                    </li>
                  );
                })}
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
                    {selectedGarden.dates.map((date, index) => {
                      const { formatted, relative } = formatDate(date.parsed);
                      return (
                        <li key={index} className="text-gray-700">
                          <div>{formatted} {date.parsed.startTime && date.parsed.endTime && `(${date.parsed.startTime}-${date.parsed.endTime})`}</div>
                          <div className="text-xs text-gray-500">{relative}</div>
                        </li>
                      );
                    })}
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
