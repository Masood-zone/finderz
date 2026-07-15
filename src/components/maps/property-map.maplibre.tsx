import { Camera, Map, Marker, type CameraRef, type ViewStateChangeEvent } from "@maplibre/maplibre-react-native";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius, shadows } from "@/components/ui/design-system";
import { GHANA_CENTER, OPEN_FREE_MAP_STYLE, type PropertyMapProps } from "./property-map.types";

const DEFAULT_ZOOM = 6;
const PROPERTY_ZOOM = 16;

export function PropertyMap({ coordinates, editable = false, height = 260, onCoordinatesChange, onMapError }: PropertyMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const lastMapCenterRef = useRef<string | null>(null);
  const [zoom, setZoom] = useState(coordinates ? PROPERTY_ZOOM : DEFAULT_ZOOM);
  const center = coordinates ?? GHANA_CENTER;
  const coordinateLatitude = coordinates?.latitude;
  const coordinateLongitude = coordinates?.longitude;

  useEffect(() => {
    if (coordinateLatitude === undefined || coordinateLongitude === undefined) return;
    const key = `${coordinateLatitude}:${coordinateLongitude}`;
    if (lastMapCenterRef.current === key) return;
    cameraRef.current?.easeTo({ center: [coordinateLongitude, coordinateLatitude], zoom: PROPERTY_ZOOM, duration: 500 });
    setZoom(PROPERTY_ZOOM);
  }, [coordinateLatitude, coordinateLongitude]);

  const changeZoom = (delta: number) => {
    const next = Math.min(20, Math.max(4, zoom + delta));
    setZoom(next);
    cameraRef.current?.zoomTo(next, { duration: 200 });
  };

  const handleRegionChange = (event: { nativeEvent: ViewStateChangeEvent }) => {
    setZoom(event.nativeEvent.zoom);
    if (!editable || !event.nativeEvent.userInteraction) return;
    const [longitude, latitude] = event.nativeEvent.center;
    lastMapCenterRef.current = `${latitude}:${longitude}`;
    onCoordinatesChange?.({ latitude, longitude });
  };

  return (
    <View style={{ height, overflow: "hidden", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border }}>
      <Map
        mapStyle={OPEN_FREE_MAP_STYLE}
        style={{ flex: 1 }}
        attribution
        attributionPosition={{ bottom: 8, right: 8 }}
        logo={false}
        compass
        compassPosition={{ top: 10, right: 10 }}
        touchRotate={false}
        touchPitch={false}
        onRegionDidChange={handleRegionChange}
        onDidFailLoadingMap={onMapError}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: [center.longitude, center.latitude], zoom }}
          minZoom={4}
          maxZoom={20}
        />
        {!editable && coordinates ? (
          <Marker id="property-location" lngLat={[coordinates.longitude, coordinates.latitude]} anchor="bottom">
            <View style={{ height: 24, width: 24, borderRadius: 12, borderWidth: 4, borderColor: "#fff", backgroundColor: colors.primary, ...shadows.sm }} />
          </Marker>
        ) : null}
      </Map>

      {editable ? (
        <View pointerEvents="none" style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -12, marginTop: -24, alignItems: "center" }}>
          <View style={{ height: 30, width: 30, borderRadius: 15, borderWidth: 5, borderColor: "#fff", backgroundColor: colors.primary, ...shadows.md }} />
          <View style={{ height: 10, width: 4, backgroundColor: colors.primary }} />
        </View>
      ) : null}

      <View style={{ position: "absolute", left: 10, top: 10, gap: 8 }}>
        <MapControl label="Zoom in" onPress={() => changeZoom(1)}><Plus color={colors.primary} size={19} /></MapControl>
        <MapControl label="Zoom out" onPress={() => changeZoom(-1)}><Minus color={colors.primary} size={19} /></MapControl>
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => void Linking.openURL("https://www.openstreetmap.org/copyright")}
        style={{ position: "absolute", bottom: 6, left: 8, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 5, paddingVertical: 3 }}
      >
        <AppText style={{ color: colors.primary, fontSize: 9 }}>© OpenStreetMap · OpenFreeMap</AppText>
      </Pressable>
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
