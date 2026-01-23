import { parseAsBoolean, useQueryState } from 'nuqs'
import type { Garden, GardensJson } from './types'

type DebugPanelProps = {
  gardens: Garden[]
  gardensData: GardensJson
}

export default function DebugPanel({ gardens, gardensData }: DebugPanelProps) {
  const [debugMode, setDebugMode] = useQueryState('debug', parseAsBoolean.withDefault(false))

  // Don't render if debug mode is off
  if (!debugMode) return null

  // Debug statistics
  const debugStats = {
    totalGardens: gardens.length,
    gardensWithErrors: gardens.filter((garden) => garden.errors && garden.errors.length > 0).length,
    totalDates: gardens.reduce((sum, garden) => sum + garden.dates.length, 0),
    gardensWithCoordinates: gardens.filter(
      (garden) => garden.coordinates.lat && garden.coordinates.lng,
    ).length,
    gardensWithBerlinFallback: gardens.filter(
      (garden) => garden.coordinates.lat === 52.52 && garden.coordinates.lng === 13.405,
    ).length,
    errorTypes: gardens
      .flatMap((garden) => garden.errors || [])
      .reduce(
        (acc, error) => {
          acc[error] = (acc[error] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
  }

  return (
    <div className="w-96 overflow-y-auto bg-gray-900 p-4 text-white shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">Debug-Informationen</h2>
        <button
          type="button"
          onClick={() => setDebugMode(false)}
          className="cursor-pointer text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 font-semibold">Statistiken</h3>
        <div className="space-y-1 text-sm">
          <div>Gesamt Gärten: {debugStats.totalGardens}</div>
          <div>Gärten mit Fehlern: {debugStats.gardensWithErrors}</div>
          <div>Gesamt Termine: {debugStats.totalDates}</div>
          <div>Gärten mit Koordinaten: {debugStats.gardensWithCoordinates}</div>
          <div>Gärten mit Berlin-Fallback: {debugStats.gardensWithBerlinFallback}</div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 font-semibold">Fehlertypen</h3>
        <div className="space-y-1 text-sm">
          {Object.entries(debugStats.errorTypes).map(([error, count]) => (
            <div key={error} className="text-red-300">
              {error}: {count}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Rohdaten (JSON)</h3>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(gardensData, null, 2))
            }}
            className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700"
            title="JSON in Zwischenablage kopieren"
          >
            Kopieren
          </button>
        </div>
        <div className="max-h-64 overflow-auto rounded bg-gray-800 p-2 text-xs">
          <pre>{JSON.stringify(gardensData, null, 2)}</pre>
        </div>
      </div>

      <div className="text-gray-400 text-xs">
        Debug-Modus über den Button in der Seitenleiste aktivieren
      </div>
    </div>
  )
}
