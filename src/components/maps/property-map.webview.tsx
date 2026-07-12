import { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { colors, radius } from "@/components/ui/design-system";
import { GHANA_CENTER, OPEN_FREE_MAP_STYLE, type PropertyMapProps } from "./property-map.types";

function createMapHtml(latitude: number, longitude: number, editable: boolean) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css" rel="stylesheet" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; overflow: hidden; }
      body { background: #e7f2ff; }
      #pin { position: absolute; left: 50%; top: 50%; z-index: 5; width: 30px; height: 30px; margin: -30px 0 0 -15px; border: 5px solid #fff; border-radius: 50%; background: ${colors.primary}; box-sizing: border-box; box-shadow: 0 4px 12px rgba(15,23,42,.35); pointer-events: none; }
      #pin:after { content: ''; position: absolute; width: 4px; height: 10px; left: 8px; top: 22px; background: ${colors.primary}; }
      .maplibregl-ctrl-attrib { font-size: 10px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    ${editable ? '<div id="pin"></div>' : ''}
    <script src="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js"></script>
    <script>
      const map = new maplibregl.Map({
        container: 'map',
        style: ${JSON.stringify(OPEN_FREE_MAP_STYLE)},
        center: [${longitude}, ${latitude}],
        zoom: ${latitude === GHANA_CENTER.latitude && longitude === GHANA_CENTER.longitude ? 6 : 16},
        dragRotate: false,
        pitchWithRotate: false
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
      ${editable ? `map.on('dragend', () => { const center = map.getCenter(); window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'coordinates', latitude: center.lat, longitude: center.lng })); });` : `new maplibregl.Marker({ color: '${colors.primary}' }).setLngLat([${longitude}, ${latitude}]).addTo(map);`}
      map.on('error', (event) => {
        if (!map.loaded()) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
      });
      window.setPropertyCenter = (nextLongitude, nextLatitude) => map.easeTo({ center: [nextLongitude, nextLatitude], zoom: 16, duration: 450 });
    </script>
  </body>
</html>`;
}

export function PropertyMapWebView({ coordinates, editable = false, height = 260, onCoordinatesChange, onMapError }: PropertyMapProps) {
  const webViewRef = useRef<WebView>(null);
  const lastMapCoordinatesRef = useRef<string | null>(null);
  const initialCoordinatesRef = useRef(coordinates ?? GHANA_CENTER);
  const initialCoordinates = initialCoordinatesRef.current;
  const html = useMemo(
    () => createMapHtml(initialCoordinates.latitude, initialCoordinates.longitude, editable),
    [editable, initialCoordinates.latitude, initialCoordinates.longitude],
  );

  useEffect(() => {
    if (!coordinates) return;
    const key = `${coordinates.latitude}:${coordinates.longitude}`;
    if (lastMapCoordinatesRef.current === key) return;
    webViewRef.current?.injectJavaScript(`window.setPropertyCenter && window.setPropertyCenter(${coordinates.longitude}, ${coordinates.latitude}); true;`);
  }, [coordinates]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; latitude?: number; longitude?: number };
      if (message.type === "error") {
        onMapError?.();
        return;
      }
      if (message.type !== "coordinates" || !Number.isFinite(message.latitude) || !Number.isFinite(message.longitude)) return;
      const latitude = message.latitude!;
      const longitude = message.longitude!;
      lastMapCoordinatesRef.current = `${latitude}:${longitude}`;
      onCoordinatesChange?.({ latitude, longitude });
    } catch {
      // Ignore messages not emitted by the embedded map.
    }
  };

  return (
    <View style={{ height, overflow: "hidden", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceBlue }}>
      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: "https://finderz.app" }}
        originWhitelist={["https://*", "http://*"]}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        onMessage={handleMessage}
        onError={onMapError}
        onHttpError={onMapError}
        style={{ flex: 1, backgroundColor: colors.surfaceBlue }}
      />
    </View>
  );
}
