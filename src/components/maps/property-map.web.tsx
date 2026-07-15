import maplibregl, { type Map as MapLibreMap, type Marker as MapLibreMarker } from "maplibre-gl";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import { colors, radius, shadows } from "@/components/ui/design-system";
import { GHANA_CENTER, OPEN_FREE_MAP_STYLE, type PropertyMapProps } from "./property-map.types";

export function PropertyMap({ coordinates, editable = false, height = 260, onCoordinatesChange, onMapError }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const lastMapCenterRef = useRef<string | null>(null);
  const initialCoordinatesRef = useRef(coordinates);
  const callbackRef = useRef(onCoordinatesChange);
  const errorCallbackRef = useRef(onMapError);
  callbackRef.current = onCoordinatesChange;
  errorCallbackRef.current = onMapError;
  const coordinateLatitude = coordinates?.latitude;
  const coordinateLongitude = coordinates?.longitude;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initialCoordinates = initialCoordinatesRef.current;
    const center = initialCoordinates ?? GHANA_CENTER;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPEN_FREE_MAP_STYLE,
      center: [center.longitude, center.latitude],
      zoom: initialCoordinates ? 16 : 6,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
    });
    mapRef.current = map;
    map.touchZoomRotate.disableRotation();
    let loaded = false;
    map.once("load", () => {
      loaded = true;
    });
    map.on("error", () => {
      if (!loaded) errorCallbackRef.current?.();
    });
    map.on("dragend", () => {
      if (!editable) return;
      const next = map.getCenter();
      lastMapCenterRef.current = `${next.lat}:${next.lng}`;
      callbackRef.current?.({ latitude: next.lat, longitude: next.lng });
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [editable]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || coordinateLatitude === undefined || coordinateLongitude === undefined) return;
    const key = `${coordinateLatitude}:${coordinateLongitude}`;
    if (lastMapCenterRef.current !== key) {
      map.easeTo({ center: [coordinateLongitude, coordinateLatitude], zoom: 16, duration: 500 });
    }

    if (editable) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      const element = document.createElement("div");
      Object.assign(element.style, {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        border: "4px solid white",
        background: colors.primary,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.28)",
      });
      markerRef.current = new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([coordinateLongitude, coordinateLatitude]).addTo(map);
    } else {
      markerRef.current.setLngLat([coordinateLongitude, coordinateLatitude]);
    }
  }, [coordinateLatitude, coordinateLongitude, editable]);

  return (
    <View style={{ height, overflow: "hidden", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {editable ? (
        <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -12, marginTop: -24, alignItems: "center" }}>
          <View style={{ height: 30, width: 30, borderRadius: 15, borderWidth: 5, borderColor: "#fff", backgroundColor: colors.primary, ...shadows.md }} />
          <View style={{ height: 10, width: 4, backgroundColor: colors.primary }} />
        </View>
      ) : null}

      <View style={{ position: "absolute", left: 10, top: 10, gap: 8 }}>
        <MapControl label="Zoom in" onPress={() => mapRef.current?.zoomIn()}><Plus color={colors.primary} size={19} /></MapControl>
        <MapControl label="Zoom out" onPress={() => mapRef.current?.zoomOut()}><Minus color={colors.primary} size={19} /></MapControl>
      </View>

      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={{ position: "absolute", bottom: 6, left: 8, borderRadius: 5, background: "rgba(255,255,255,0.9)", color: colors.primary, fontSize: 10, padding: "3px 5px", textDecoration: "none" }}>
        © OpenStreetMap · OpenFreeMap
      </a>
    </View>
  );
}

function MapControl({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ height: 38, width: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.surface, ...shadows.sm }}>
      {children}
    </Pressable>
  );
}
