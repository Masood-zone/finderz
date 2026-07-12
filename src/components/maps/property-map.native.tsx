import Constants from "expo-constants";
import type { PropertyMapProps } from "./property-map.types";
import { PropertyMapWebView } from "./property-map.webview";

type PropertyMapComponent = (props: PropertyMapProps) => React.JSX.Element;

const PropertyMapImplementation: PropertyMapComponent = Constants.appOwnership === "expo"
  ? PropertyMapWebView
  // The native module must not be evaluated inside Expo Go.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  : require("./property-map.maplibre").PropertyMap;

export function PropertyMap(props: PropertyMapProps) {
  return <PropertyMapImplementation {...props} />;
}
