import { parseAsBoolean, useQueryState } from 'nuqs'

export default function DebugToggle() {
  const [debugMode, setDebugMode] = useQueryState('debug', parseAsBoolean.withDefault(false))

  return (
    <button
      onClick={() => setDebugMode(!debugMode)}
      className="text-xs text-gray-600 hover:text-red-700 underline"
      title="Debug-Modus umschalten"
    >
      {debugMode ? 'Debug-Modus deaktivieren' : 'Debug-Modus aktivieren'}
    </button>
  )
}
