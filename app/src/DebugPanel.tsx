import { useQueryState, parseAsBoolean } from 'nuqs';
import type { Garden, GardensJson } from './types';

type DebugPanelProps = {
  gardens: Garden[];
  gardensData: GardensJson;
};

export default function DebugPanel({ gardens, gardensData }: DebugPanelProps) {
  const [debugMode, setDebugMode] = useQueryState('debug', parseAsBoolean.withDefault(false));

  // Don't render if debug mode is off
  if (!debugMode) return null;

  // Debug statistics
  const debugStats = {
    totalGardens: gardens.length,
    gardensWithErrors: gardens.filter(garden => garden.errors && garden.errors.length > 0).length,
    totalDates: gardens.reduce((sum, garden) => sum + garden.dates.length, 0),
    gardensWithCoordinates: gardens.filter(garden => garden.coordinates.lat && garden.coordinates.lng).length,
    gardensWithBerlinFallback: gardens.filter(garden =>
      garden.coordinates.lat === 52.5200 && garden.coordinates.lng === 13.4050
    ).length,
    errorTypes: gardens
      .flatMap(garden => garden.errors || [])
      .reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  };

  return (
    <div className="w-96 bg-gray-900 text-white shadow-lg p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Debug-Informationen</h2>
        <button
          onClick={() => setDebugMode(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Statistiken</h3>
        <div className="text-sm space-y-1">
          <div>Gesamt Gärten: {debugStats.totalGardens}</div>
          <div>Gärten mit Fehlern: {debugStats.gardensWithErrors}</div>
          <div>Gesamt Termine: {debugStats.totalDates}</div>
          <div>Gärten mit Koordinaten: {debugStats.gardensWithCoordinates}</div>
          <div>Gärten mit Berlin-Fallback: {debugStats.gardensWithBerlinFallback}</div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Fehlertypen</h3>
        <div className="text-sm space-y-1">
          {Object.entries(debugStats.errorTypes).map(([error, count]) => (
            <div key={error} className="text-red-300">
              {error}: {count}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Rohdaten (JSON)</h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(gardensData, null, 2));
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
            title="JSON in Zwischenablage kopieren"
          >
            Kopieren
          </button>
        </div>
        <div className="text-xs bg-gray-800 p-2 rounded overflow-auto max-h-64">
          <pre>{JSON.stringify(gardensData, null, 2)}</pre>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Debug-Modus über den Button in der Seitenleiste aktivieren
      </div>
    </div>
  );
}
