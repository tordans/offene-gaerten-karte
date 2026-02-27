import { ArrowsPointingInIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useMap } from 'react-map-gl/maplibre'
import type { Garden } from '../../scripts/schemas.ts'
import { useFavoritesOnly } from './stores/useFavoritesOnlyState'
import { useFavorites, useIsFavorite, useToggleFavorite } from './stores/useFavoritesState'
import { useSetSelectedGarden } from './stores/useSelectedGardenState'

type FavoritesSectionProps = {
  gardens: Garden[]
}

export default function FavoritesSection({ gardens }: FavoritesSectionProps) {
  const [favorites] = useFavorites()
  const [favoritesOnly, setFavoritesOnly] = useFavoritesOnly()
  const [, setSelectedMonth] = useQueryState('month', parseAsInteger)
  const [, setSelectedDay] = useQueryState('day', parseAsInteger)
  const toggleFavorite = useToggleFavorite()
  const isFavorite = useIsFavorite()
  const setSelectedGarden = useSetSelectedGarden()
  const { gardenMap: mapInstance } = useMap()

  return (
    <div className="mb-6 border-red-800 border-b pb-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-black text-lg">
          <HeartIcon className="size-4 text-red-600" />
          Favoriten
        </h2>
        <span className="rounded-full bg-amber-200 px-2 py-1 font-medium text-amber-900 text-xs">
          {favorites.length}
        </span>
      </div>
      <div className="space-y-2">
        {favorites.length > 0 ? (
          gardens
            .filter((garden) => garden.id && isFavorite(garden.id))
            .map((garden) => (
              <div key={garden.id} className="rounded border-blue-500 border-l-4 bg-amber-200 p-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-gray-700 px-2 py-0.5 font-medium text-white text-xs">
                    {garden.id}
                  </span>
                  <span className="font-semibold text-sm">{garden.name}</span>
                </div>
                <p className="mb-2 text-gray-600 text-xs">{garden.address}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => garden.id && toggleFavorite(garden.id)}
                    className="flex cursor-pointer items-center gap-1 text-red-600 text-xs hover:text-red-800"
                  >
                    <XMarkIcon className="size-3" />
                    Entfernen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGarden(garden)
                      if (mapInstance) {
                        mapInstance.flyTo({
                          center: [garden.coordinates.lng, garden.coordinates.lat],
                          duration: 1000,
                        })
                      }
                    }}
                    className="flex cursor-pointer items-center gap-1 text-black text-xs hover:text-blue-400"
                  >
                    <ArrowsPointingInIcon className="size-3" />
                    Karte zentrieren
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-gray-500 text-sm italic">
            Noch keine Favoriten. Klicken Sie auf das Herz-Symbol bei einem Garten, um ihn zu Ihren
            Favoriten hinzuzufügen.
          </div>
        )}
      </div>

      {/* Favorites Only Toggle - Only show when there are favorites */}
      {favorites.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setFavoritesOnly(!favoritesOnly)
              setSelectedMonth(null)
              setSelectedDay(null)
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded px-3 py-2 ${
              favoritesOnly
                ? 'border border-blue-300 bg-blue-100 text-blue-900'
                : 'border border-amber-200 bg-amber-50 hover:bg-amber-200'
            }`}
          >
            <span>{favoritesOnly ? 'Alles anzeigen' : 'Nur Favoriten anzeigen'}</span>
            <span className="rounded-full bg-amber-200 px-2 py-1 font-medium text-amber-900 text-xs">
              {favoritesOnly ? gardens.length : favorites.length}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
