import { CameraIcon, MapIcon } from '@heroicons/react/24/solid'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { BACKGROUND_OPTIONS } from './constants'

export default function BackgroundToggle() {
  const [background, setBackground] = useQueryState(
    'background',
    parseAsStringEnum(Object.values(BACKGROUND_OPTIONS)).withDefault('standard'),
  )

  return (
    <div className="mb-4 border-red-800 border-b pb-4">
      <h2 className="mb-3 font-semibold text-lg text-red-700">Kartenhintergrund</h2>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setBackground('standard')}
          className={`flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left ${
            background === 'standard'
              ? 'bg-amber-400 text-amber-900'
              : 'bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <MapIcon className="size-4" />
          Standard-Karte
        </button>
        <button
          type="button"
          onClick={() => setBackground('aerial')}
          className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left ${
            background === 'aerial'
              ? 'bg-amber-400 text-amber-900'
              : 'bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <CameraIcon className="size-4" />
          Luftbild (Brandenburg)
        </button>
      </div>
    </div>
  )
}
