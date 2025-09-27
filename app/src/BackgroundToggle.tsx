import { useQueryState, parseAsStringEnum } from 'nuqs';
import { BACKGROUND_OPTIONS } from './constants';

export default function BackgroundToggle() {
  const [background, setBackground] = useQueryState('background', parseAsStringEnum(Object.values(BACKGROUND_OPTIONS)).withDefault('standard'));

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-3">Kartenhintergrund</h2>
      <div className="space-y-2">
        <button
          onClick={() => setBackground('standard')}
          className={`w-full text-left px-3 py-2 rounded ${
            background === 'standard'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          🗺️ Standard-Karte
        </button>
        <button
          onClick={() => setBackground('aerial')}
          className={`w-full text-left px-3 py-2 rounded ${
            background === 'aerial'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          🛰️ Luftbild (Brandenburg)
        </button>
      </div>
    </div>
  );
}
