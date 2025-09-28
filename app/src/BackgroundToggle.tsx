import { useQueryState, parseAsStringEnum } from 'nuqs';
import { BACKGROUND_OPTIONS } from './constants';
import { MapIcon, CameraIcon } from '@heroicons/react/24/solid';

export default function BackgroundToggle() {
  const [background, setBackground] = useQueryState('background', parseAsStringEnum(Object.values(BACKGROUND_OPTIONS)).withDefault('standard'));

  return (
    <div className="mb-4 border-b border-red-800 pb-4">
      <h2 className="text-lg font-semibold mb-3 text-red-700">Kartenhintergrund</h2>
      <div className="space-y-2">
        <button
          onClick={() => setBackground('standard')}
          className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
            background === 'standard'
              ? 'bg-amber-400 text-amber-900'
              : 'bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          Standard-Karte
        </button>
        <button
          onClick={() => setBackground('aerial')}
          className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
            background === 'aerial'
              ? 'bg-amber-400 text-amber-900'
              : 'bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <CameraIcon className="w-4 h-4" />
          Luftbild (Brandenburg)
        </button>
      </div>
    </div>
  );
}
