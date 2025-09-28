import { parseAsBoolean, useQueryState } from 'nuqs'

export default function DebugToggle() {
  const [debugMode, setDebugMode] = useQueryState('debug', parseAsBoolean.withDefault(false))

  return (
    <button
      onClick={() => setDebugMode(!debugMode)}
      className="cursor-pointer text-black hover:text-blue-400 hover:underline"
      title="Debug-Modus umschalten"
    >
      {debugMode ? 'Debug-Modus deaktivieren' : 'Debug-Modus aktivieren'}
    </button>
  )
}
