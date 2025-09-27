import { createParser, useQueryState } from 'nuqs';

type MapParam = {
  zoom: number;
  lat: number;
  lng: number;
};

const DEFAULT_MAP_PARAM: MapParam = {
  zoom: 8,
  lat: 52.5200, // Berlin center
  lng: 13.4050,
};

const mapParamParser = createParser({
  parse: (query: string) => {
    const parts = query.split('/');
    if (parts.length !== 3) return null;

    const zoom = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[2]);

    // Basic validation
    if (isNaN(zoom) || isNaN(lat) || isNaN(lng)) return null;
    if (zoom < 0 || zoom > 22) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;

    return { zoom, lat, lng } satisfies MapParam;
  },
  serialize: ({ zoom, lat, lng }: MapParam): string => {
    return `${zoom}/${lat}/${lng}`;
  },
}).withOptions({ history: 'replace' }).withDefault(DEFAULT_MAP_PARAM);

export function useMapParam() {
  const [mapParam, setMapParam] = useQueryState('map', mapParamParser);

  const viewState = {
    longitude: mapParam.lng,
    latitude: mapParam.lat,
    zoom: mapParam.zoom
  };

  const setViewState = (newViewState: { longitude: number; latitude: number; zoom: number }) => {
    setMapParam({
      zoom: newViewState.zoom,
      lat: newViewState.latitude,
      lng: newViewState.longitude
    });
  };

  return {
    viewState,
    setViewState
  };
}
