import { ArrowsPointingInIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useMap } from 'react-map-gl/maplibre'
import { useFavoritesOnly } from './stores/useFavoritesOnlyState'
import { useFavorites, useIsFavorite, useToggleFavorite } from './stores/useFavoritesState'
import { useSetSelectedGarden } from './stores/useSelectedGardenState'
import type { Garden } from './types'

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
    <div className="mb-6 border-b border-red-800 pb-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-600">
          <HeartIcon className="h-4 w-4 text-blue-600" />
          Favoriten
        </h2>
        <span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-medium text-amber-900">
          {favorites.length}
        </span>
      </div>
      <div className="space-y-2">
        {favorites.length > 0 ? (
          gardens
            .filter((garden) => garden.id && isFavorite(garden.id))
            .map((garden) => (
              <div key={garden.id} className="rounded border-l-4 border-blue-500 bg-amber-200 p-2">
                <div className="mb-2 text-sm font-medium text-gray-700">{garden.address}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => garden.id && toggleFavorite(garden.id)}
                    className="flex cursor-pointer items-center gap-1 text-xs text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                    Entfernen
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGarden(garden)
                      if (mapInstance) {
                        mapInstance.flyTo({
                          center: [garden.coordinates.lng, garden.coordinates.lat],
                          duration: 1000,
                        })
                      }
                    }}
                    className="flex cursor-pointer items-center gap-1 text-xs text-black hover:text-blue-400"
                  >
                    <ArrowsPointingInIcon className="h-3 w-3" />
                    Karte zentrieren
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-sm text-gray-500 italic">
            Noch keine Favoriten. Klicken Sie auf das Herz-Symbol bei einem Garten, um ihn zu Ihren
            Favoriten hinzuzufügen.
          </div>
        )}
      </div>

      {/* Favorites Only Toggle */}
      <div className="mt-4">
        <button
          onClick={() => {
            setFavoritesOnly(!favoritesOnly)
            setSelectedMonth(null)
            setSelectedDay(null)
          }}
          className={`flex w-full items-center justify-between rounded px-3 py-2 ${
            favoritesOnly
              ? 'border border-blue-300 bg-blue-100 text-blue-900'
              : 'border border-amber-200 bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <span>{favoritesOnly ? 'Alles anzeigen' : 'Nur Favoriten anzeigen'}</span>
          <span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-medium text-amber-900">
            {favoritesOnly ? gardens.length : favorites.length}
          </span>
        </button>
      </div>
    </div>
  )
}
