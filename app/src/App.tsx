import { useState, useEffect } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import { useQueryState, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';
import type { Garden, GardensJson } from './types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
// Import data as a module
import gardensData from './data/gardens-and-dates.json';
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
  const [selectedMonth, setSelectedMonth] = useQueryState('month', parseAsInteger);
  const [selectedDay, setSelectedDay] = useQueryState('day', parseAsInteger);
  const [favorites, setFavorites] = useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]));
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
          date.month === selectedMonth &&
          (selectedDay === null || date.day === selectedDay)
        )
      )
    : gardens;

  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      count: gardens.filter(garden =>
        garden.dates.some(date => date.month === month)
      ).length
    };
  });

  // Get available days for selected month with counts
  const availableDays = selectedMonth
    ? Array.from(
        new Set(
          gardens
            .flatMap(garden => garden.dates)
            .filter(date => date.month === selectedMonth)
            .map(date => date.day)
        )
      )
      .sort((a, b) => a - b)
      .map(day => ({
        day,
        count: gardens.filter(garden =>
          garden.dates.some(date =>
            date.month === selectedMonth &&
            date.day === day
          )
        ).length
      }))
    : [];

  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];

  // Helper function to get weekday name for a specific day
  const getWeekdayName = (day: number, month: number, year?: number) => {
    const date = new Date(year || new Date().getFullYear(), month - 1, day);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  };

  // Function to toggle favorite status
  const toggleFavorite = (gardenId: string) => {
    const newFavorites = favorites?.includes(gardenId)
      ? favorites.filter((id: string) => id !== gardenId)
      : [...(favorites || []), gardenId];
    setFavorites(newFavorites);
  };

  // Function to check if a garden is favorited
  const isFavorite = (gardenId: string) => favorites?.includes(gardenId) || false;

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
            . Die Daten wurden zuletzt am 25.7.2025 verarbeitet.
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
          <h2 className="text-lg font-semibold mb-3">Nach Monat filtern</h2>
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
              Alle Gärten ({gardens.length})
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
            <h2 className="text-lg font-semibold mb-3">Nach Tag filtern</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedDay(null)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedDay === null
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                Alle Tage im {monthNames[selectedMonth - 1]} ({monthCounts.find(m => m.month === selectedMonth)?.count || 0})
              </button>
                                        {availableDays.map(({ day, count }) => (
                            <button
                              key={`${selectedMonth}-${day}`}
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

        {/* Favorites Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Favoriten ({favorites?.length || 0})</h2>
          <div className="space-y-2">
            {favorites && favorites.length > 0 ? (
              gardens
                .filter(garden => garden.id && isFavorite(garden.id))
                .map((garden) => (
                  <div key={garden.id} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {garden.address}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <button
                        onClick={() => garden.id && toggleFavorite(garden.id)}
                        className="text-red-600 hover:text-red-800 mr-2"
                      >
                        ❌ Entfernen
                      </button>
                      <button
                        onClick={() => setSelectedGarden(garden)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Details anzeigen
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-sm text-gray-500 italic">
                Noch keine Favoriten. Klicken Sie auf das Herz-Symbol bei einem Garten, um ihn zu Ihren Favoriten hinzuzufügen.
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Always show favorite gardens as blue markers */}
          {gardens
            .filter(garden => garden.id && isFavorite(garden.id) && garden.coordinates.lat && garden.coordinates.lng)
            .map((garden) => (
              <Marker
                key={`favorite-${garden.id}`}
                longitude={garden.coordinates.lng}
                latitude={garden.coordinates.lat}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedGarden(garden);
                }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-colors bg-blue-500 hover:bg-blue-600" />
              </Marker>
            ))}

          {/* Show filtered gardens as green markers (excluding favorites to avoid duplicates) */}
          {filteredGardens
            .filter(garden => garden.id && !isFavorite(garden.id) && garden.coordinates.lat && garden.coordinates.lng)
            .map((garden) => (
              <Marker
                key={`filtered-${garden.id}`}
                longitude={garden.coordinates.lng}
                latitude={garden.coordinates.lat}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedGarden(garden);
                }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-colors bg-green-500 hover:bg-green-600" />
              </Marker>
            ))}

          {selectedGarden && selectedGarden.coordinates.lat && selectedGarden.coordinates.lng && (
            <Popup
              longitude={selectedGarden.coordinates.lng}
              latitude={selectedGarden.coordinates.lat}
              onClose={() => setSelectedGarden(null)}
              closeButton={true}
              closeOnClick={false}
              className="max-w-xs"
            >
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">
                  {selectedGarden.address}
                </h3>
                <div className="text-xs text-gray-600 mb-2 space-y-1">
                  <button
                    onClick={() => selectedGarden.id && toggleFavorite(selectedGarden.id)}
                    className={`text-xs ${selectedGarden.id && isFavorite(selectedGarden.id) ? 'text-red-600' : 'text-gray-600'} hover:underline block`}
                  >
                    {selectedGarden.id && isFavorite(selectedGarden.id) ? '❤️ Aus Favoriten entfernen' : '🤍 Zu Favoriten hinzufügen'}
                  </button>
                  <a
                    href={`https://www.xn--offene-grten-ncb.de/${selectedGarden.websiteSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    Details anzeigen
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedGarden.address)}&travelmode=transit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline block"
                  >
                    🚌 Route berechnen (ÖPNV)
                  </a>
                </div>
                <div className="text-xs">
                  <strong>Öffnungszeiten:</strong>
                  <ul className="mt-1 space-y-1">
                    {selectedGarden.dates.map((date, index) => {
                      const { formatted, relative } = formatDate(date);
                      return (
                        <li key={index} className="text-gray-700">
                          <div>{formatted} {date.startTime && date.endTime && `(${date.startTime}-${date.endTime})`}</div>
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
