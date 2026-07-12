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

export const OPEN_FREE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
