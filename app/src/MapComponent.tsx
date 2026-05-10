import { parseAsInteger, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { Map, Marker, Popup } from 'react-map-gl/maplibre'
import type { Garden } from '../../scripts/schemas.ts'
import GardenPopup from './GardenPopup'
import { useFavoritesOnly } from './stores/useFavoritesOnlyState'
import { useIsFavorite, useToggleFavorite } from './stores/useFavoritesState'
import { useMapParam } from './stores/useMapParam'
import { useSelectedGarden, useSetSelectedGarden } from './stores/useSelectedGardenState'

// OpenFreeMap public tiles (Liberty style) — https://openfreemap.org/
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

type MapComponentProps = {
  gardens: Garden[]
}

export default function MapComponent({ gardens }: MapComponentProps) {
  const [selectedMonth] = useQueryState('month', parseAsInteger)
  const [selectedDay] = useQueryState('day', parseAsInteger)
  const [favoritesOnly] = useFavoritesOnly()
  const isFavorite = useIsFavorite()
  const toggleFavorite = useToggleFavorite()
  // Calculate filtered gardens
  const filteredGardens = useMemo(() => {
    let filtered = gardens

    // Apply favorites-only filter first
    if (favoritesOnly) {
      filtered = gardens.filter((garden) => isFavorite(garden.id))
    } else {
      // When not in favorites-only mode, always show favorites + apply date filters to non-favorites
      const favoriteGardens = gardens.filter((garden) => isFavorite(garden.id))
      const nonFavoriteGardens = gardens.filter((garden) => !isFavorite(garden.id))

      let dateFilteredNonFavorites = nonFavoriteGardens

      // Apply date filters to non-favorite gardens only
      if (selectedMonth) {
        dateFilteredNonFavorites = nonFavoriteGardens.filter((garden) =>
          garden.dates.some(
            (date) =>
              date.month === selectedMonth && (selectedDay === null || date.day === selectedDay),
          ),
        )
      }

      // Combine favorites (always visible) with date-filtered non-favorites
      filtered = [...favoriteGardens, ...dateFilteredNonFavorites]
    }

    return filtered
  }, [gardens, selectedMonth, selectedDay, favoritesOnly, isFavorite])
  const { viewState, setViewState, onMoveEnd } = useMapParam()
  const selectedGarden = useSelectedGarden(gardens)
  const setSelectedGarden = useSetSelectedGarden()

  return (
    <div className="relative flex-1">
      <Map
        id="gardenMap"
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        onMoveEnd={onMoveEnd}
        onClick={() => setSelectedGarden(null)}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Markers for filtered gardens */}
        {filteredGardens.map((garden) => {
          const isFav = isFavorite(garden.id)
          const matchesDateFilter =
            !selectedMonth ||
            garden.dates.some(
              (date) =>
                date.month === selectedMonth && (selectedDay === null || date.day === selectedDay),
            )

          let markerColor: string
          if (isFav) {
            // Favorite gardens: bright red if they match date filter, gray if they don't
            markerColor = matchesDateFilter ? '#dc2626' : '#808080' // red-600
          } else {
            // Non-favorite gardens: black
            markerColor = '#000000'
          }

          return (
            <Marker
              key={garden.id}
              longitude={garden.coordinates.lng}
              latitude={garden.coordinates.lat}
              onClick={(event) => {
                event.originalEvent.stopPropagation()
                setSelectedGarden(garden)
              }}
            >
              <div
                className="size-4 cursor-pointer rounded-full hover:opacity-80"
                style={{ backgroundColor: markerColor }}
              />
            </Marker>
          )
        })}

        {/* Popup for selected garden */}
        {selectedGarden && (
          <Popup
            longitude={selectedGarden.coordinates.lng}
            latitude={selectedGarden.coordinates.lat}
            onClose={() => setSelectedGarden(null)}
            closeButton={true}
            closeOnClick={false}
            className="custom-popup"
          >
            <GardenPopup
              garden={selectedGarden}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              selectedMonth={selectedMonth}
              selectedDay={selectedDay}
            />
          </Popup>
        )}
      </Map>
    </div>
  )
}
