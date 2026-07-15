export type PropertyCoordinates = {
  latitude: number;
  longitude: number;
};

export type PropertyMapProps = {
  coordinates?: PropertyCoordinates | null;
  editable?: boolean;
  height?: number;
  onCoordinatesChange?: (coordinates: PropertyCoordinates) => void;
  onMapError?: () => void;
};

export const GHANA_CENTER: PropertyCoordinates = {
  latitude: 7.9465,
  longitude: -1.0232,
};

// Keep the style definition in the app so MapLibre only has to load map tiles.
// Some native builds fail silently while resolving a remote vector style (and
// leave only the map background visible). Raster OSM tiles are supported by
// both MapLibre Native and MapLibre GL in the Expo Go WebView fallback.
export const OPEN_FREE_MAP_STYLE = {
  version: 8 as const,
  sources: {
    openStreetMap: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "open-street-map",
      type: "raster" as const,
      source: "openStreetMap",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};
