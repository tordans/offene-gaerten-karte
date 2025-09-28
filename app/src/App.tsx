import { useState } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import { useQueryState, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs';
import type { Garden, GardensJson } from './types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { HeartIcon, ArrowTopRightOnSquareIcon, HomeModernIcon } from '@heroicons/react/24/solid';
// Import data as a module
import gardensData from './data/gardens-and-dates.json';
import DebugPanel from './DebugPanel';
import DebugToggle from './DebugToggle';
import BackgroundToggle from './BackgroundToggle';
import BackgroundLayers from './BackgroundLayers';
import DateFilter from './DateFilter';
import FavoritesSection from './FavoritesSection';
import { useMapParam } from './useMapParam';
import 'maplibre-gl/dist/maplibre-gl.css';

// Maptiler API key, only valid for `tordans.github.io`
// https://cloud.maptiler.com/account/keys/22a6bf6f-03b1-42b1-8f75-eccae2a6513f/settings
const MAP_TILER_API_KEY = 'EaBsqIr5D7rH2Vm2sjv7';
// Use MapTiler landscape style
const MAP_STYLE = `https://api.maptiler.com/maps/landscape/style.json?key=${MAP_TILER_API_KEY}`;

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
  const gardens = gardensData as GardensJson;
  const [selectedMonth, setSelectedMonth] = useQueryState('month', parseAsInteger);
  const [selectedDay, setSelectedDay] = useQueryState('day', parseAsInteger);
  const [favorites, setFavorites] = useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]));
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const { viewState, setViewState, onMoveEnd } = useMapParam();

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
    <div className="h-screen flex bg-amber-50">
      <DebugPanel
        gardens={gardens}
        gardensData={gardensData}
      />

      {/* Sidebar */}
      <div className="w-80 bg-amber-100 shadow-lg p-4 overflow-y-auto border-r-2 border-red-800">
        <h1 className="text-xl font-bold mb-4 text-red-700">Offene Gärten Karte</h1>

        {/* Project Description */}
        <div className="mb-6 p-3 bg-amber-200 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-3">
            Diese interaktive Karte zeigt alle offenen Gärten aus der Datenbank von
            <a
              href="https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-blue-400 hover:underline ml-1"
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
              className="text-black hover:text-blue-400 hover:underline"
            >
              GitHub Repository
            </a>
          </p>
        </div>

        <DateFilter
          gardens={gardens}
          monthCounts={monthCounts}
          availableDays={availableDays}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          setSelectedMonth={setSelectedMonth}
          setSelectedDay={setSelectedDay}
        />

        <FavoritesSection
          gardens={gardens}
          setSelectedGarden={setSelectedGarden}
          setViewState={setViewState}
          viewState={viewState}
        />

        <BackgroundToggle />

        {/* Debug Link */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <DebugToggle />
        </div>

      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onMoveEnd={onMoveEnd}
          mapStyle={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
        >
          <BackgroundLayers />

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
                <div className="w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-colors" style={{ backgroundColor: '#0000f2' }} />
              </Marker>
            ))}

          {/* Show filtered gardens as amber markers (excluding favorites to avoid duplicates) */}
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
                <div className="w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-colors bg-amber-500 hover:bg-amber-600" />
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
                    className={`text-xs flex items-center gap-1 ${selectedGarden.id && isFavorite(selectedGarden.id) ? 'text-amber-600' : 'text-blue-600'} hover:underline block`}
                  >
                    <HeartIcon className="w-3 h-3" />
                    {selectedGarden.id && isFavorite(selectedGarden.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                  </button>
                  <a
                    href={`https://www.xn--offene-grten-ncb.de/${selectedGarden.websiteSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    Website öffnen
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedGarden.address)}&travelmode=transit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline flex items-center gap-1"
                  >
                    <HomeModernIcon className="w-3 h-3" />
                    Route berechnen (ÖPNV)
                  </a>
                </div>
                <div className="text-xs">
                  <strong>Öffnungszeiten:</strong>
                  <ul className="mt-1 space-y-2">
                    {selectedGarden.dates.map((date, index) => {
                      const { formatted, relative } = formatDate(date);
                      return (
                        <li key={index} className="text-gray-700">
                          <div className="font-medium">{formatted}</div>
                          {date.startTime && date.endTime && (
                            <div className="text-gray-600">{date.startTime}-{date.endTime}</div>
                          )}
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
