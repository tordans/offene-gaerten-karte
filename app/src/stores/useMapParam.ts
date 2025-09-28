import { createParser, useQueryState } from 'nuqs';
import { useState, useEffect } from 'react';

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

// Round numbers for URL to maintain 6 decimal places (shorter for URL)
const roundForURL = (num: number, decimals: number = 6): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
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
    const roundedZoom = Math.round(zoom * 10) / 10; // Round to 1 decimal for zoom
    const roundedLat = roundForURL(lat, 6); // 6 decimal places for lat
    const roundedLng = roundForURL(lng, 6); // 6 decimal places for lng
    return `${roundedZoom}/${roundedLat}/${roundedLng}`;
  },
}).withOptions({ history: 'replace' }).withDefault(DEFAULT_MAP_PARAM);

export function useMapParam() {
  const [mapParam, setMapParam] = useQueryState('map', mapParamParser);

  // Internal state for smooth map interaction
  const [internalViewState, setInternalViewState] = useState({
    longitude: mapParam.lng,
    latitude: mapParam.lat,
    zoom: mapParam.zoom
  });

  // Update internal state when URL changes (but not on first render)
  useEffect(() => {
    setInternalViewState({
      longitude: mapParam.lng,
      latitude: mapParam.lat,
      zoom: mapParam.zoom
    });
  }, [mapParam.lng, mapParam.lat, mapParam.zoom]);

  const setViewState = (newViewState: { longitude: number; latitude: number; zoom: number }) => {
    // Update internal state immediately for smooth interaction
    setInternalViewState(newViewState);
  };

  const onMoveEnd = () => {
    // Update URL when user stops moving the map
    setMapParam({
      zoom: internalViewState.zoom,
      lat: internalViewState.latitude,
      lng: internalViewState.longitude
    });
  };

  return {
    viewState: internalViewState,
    setViewState,
    onMoveEnd
  };
}
