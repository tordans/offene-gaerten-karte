import { useMemo } from 'react';
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import { useQueryState, parseAsInteger } from 'nuqs';
import { useMapParam } from './stores/useMapParam';
import { useSelectedGarden, useSetSelectedGarden } from './stores/useSelectedGardenState';
import { useToggleFavorite, useIsFavorite } from './stores/useFavoritesState';
import type { Garden } from './types';
import BackgroundLayers from './BackgroundLayers';
import GardenPopup from './GardenPopup';

// Maptiler API key, only valid for `tordans.github.io`
// https://cloud.maptiler.com/account/keys/22a6bf6f-03b1-42b1-8f75-eccae2a6513f/settings
const MAP_TILER_API_KEY = 'EaBsqIr5D7rH2Vm2sjv7';
// Use MapTiler landscape style
const MAP_STYLE = `https://api.maptiler.com/maps/landscape/style.json?key=${MAP_TILER_API_KEY}`;

type MapComponentProps = {
  gardens: Garden[];
};

export default function MapComponent({ gardens }: MapComponentProps) {
  const [selectedMonth] = useQueryState('month', parseAsInteger);
  const [selectedDay] = useQueryState('day', parseAsInteger);
  const isFavorite = useIsFavorite();
  const toggleFavorite = useToggleFavorite();
  // Calculate filtered gardens
  const filteredGardens = useMemo(() => {
    return selectedMonth
      ? gardens.filter(garden =>
          garden.dates.some(date =>
            date.month === selectedMonth &&
            (selectedDay === null || date.day === selectedDay)
          )
        )
      : gardens;
  }, [gardens, selectedMonth, selectedDay]);
  const { viewState, setViewState, onMoveEnd } = useMapParam();
  const selectedGarden = useSelectedGarden(gardens);
  const setSelectedGarden = useSetSelectedGarden();

  return (
    <div className="flex-1 relative">
      <Map
        id="gardenMap"
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        onMoveEnd={onMoveEnd}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
      >
        <BackgroundLayers />

        {/* Markers for filtered gardens */}
        {filteredGardens.map((garden) => (
          <Marker
            key={garden.id}
            longitude={garden.coordinates.lng}
            latitude={garden.coordinates.lat}
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelectedGarden(garden);
            }}
          >
            <div
              className={`w-4 h-4 rounded-full cursor-pointer ${
                isFavorite(garden.id)
                  ? 'bg-blue-600'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
              style={isFavorite(garden.id) ? { backgroundColor: '#0000f2' } : {}}
            />
          </Marker>
        ))}

        {/* Popup for selected garden */}
        {selectedGarden && (
          <Popup
            longitude={selectedGarden.coordinates.lng}
            latitude={selectedGarden.coordinates.lat}
            onClose={() => setSelectedGarden(null)}
            closeButton={false}
            closeOnClick={false}
            className="custom-popup"
          >
            <GardenPopup
              garden={selectedGarden}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          </Popup>
        )}
      </Map>
    </div>
  );
}
