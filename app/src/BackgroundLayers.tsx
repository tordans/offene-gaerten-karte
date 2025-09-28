import { parseAsStringEnum, useQueryState } from 'nuqs'
import { Layer, Source } from 'react-map-gl/maplibre'
import { BACKGROUND_OPTIONS } from './constants'

// Brandenburg aerial imagery configuration
const BRANDENBURG_AERIAL = {
  id: 'brandenburg-dop20',
  name: 'Brandenburg GeoBasis-DE/LGB (latest) / DOP20c',
  tiles:
    'https://isk.geobasis-bb.de/mapproxy/dop20c/service/wms?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&LAYERS=bebb_dop20c&STYLES=&crs=EPSG:3857&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}',
  maxzoom: 20,
  minzoom: 0,
  tileSize: 512,
  attribution:
    'GeoBasis-DE/LGB / BB-BE DOP20c, dl-de/by-2-0; Geoportal Berlin / DOP20, dl-de/by-2-0',
}

// Layer visibility utility
const layerVisibility = (visible: boolean) => ({
  visibility: visible ? ('visible' as const) : ('none' as const),
})

export default function BackgroundLayers() {
  const [background] = useQueryState(
    'background',
    parseAsStringEnum(Object.values(BACKGROUND_OPTIONS)).withDefault('standard'),
  )

  // Brandenburg aerial imagery source and layer
  const brandenburgSourceId = 'brandenburg-aerial-tiles'
  const brandenburgLayerId = 'brandenburg-aerial-layer'

  // Check if aerial imagery should be visible
  const isAerialVisible = background === 'aerial'

  return (
    <>
      {/* Brandenburg Aerial Imagery Source and Layer */}
      <Source
        id={brandenburgSourceId}
        type="raster"
        tiles={[BRANDENBURG_AERIAL.tiles]}
        attribution={BRANDENBURG_AERIAL.attribution}
        maxzoom={BRANDENBURG_AERIAL.maxzoom}
        minzoom={BRANDENBURG_AERIAL.minzoom}
        tileSize={BRANDENBURG_AERIAL.tileSize}
      />
      <Layer
        id={brandenburgLayerId}
        type="raster"
        source={brandenburgSourceId}
        layout={layerVisibility(isAerialVisible)}
      />
    </>
  )
}
