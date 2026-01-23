import { parseAsInteger, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { Map, Marker, Popup } from 'react-map-gl/maplibre'
import BackgroundLayers from './BackgroundLayers'
import GardenPopup from './GardenPopup'
import { useFavoritesOnly } from './stores/useFavoritesOnlyState'
import { useIsFavorite, useToggleFavorite } from './stores/useFavoritesState'
import { useMapParam } from './stores/useMapParam'
import { useSelectedGarden, useSetSelectedGarden } from './stores/useSelectedGardenState'
import type { Garden } from './types'

// Maptiler API key, only valid for `tordans.github.io`
// https://cloud.maptiler.com/account/keys/22a6bf6f-03b1-42b1-8f75-eccae2a6513f/settings
const MAP_TILER_API_KEY = 'EaBsqIr5D7rH2Vm2sjv7'
// Use MapTiler landscape style
const MAP_STYLE = `https://api.maptiler.com/maps/landscape/style.json?key=${MAP_TILER_API_KEY}`

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
        <BackgroundLayers />

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
            // Favorite gardens: bright blue if they match date filter, light blue if they don't
            markerColor = matchesDateFilter ? '#0000f2' : '#60a5fa' // light blue
          } else {
            // Non-favorite gardens: amber
            markerColor = '#f59e0b'
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
