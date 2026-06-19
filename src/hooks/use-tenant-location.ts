import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import type { TenantFilters } from "@/types/tenant";

type TenantLocationState = {
  isLoading: boolean;
  granted: boolean;
  label: string | null;
  filters: Pick<TenantFilters, "latitude" | "longitude" | "radiusKm" | "city" | "region" | "area">;
};

function getLabel(address: Location.LocationGeocodedAddress | null) {
  if (!address) return null;
  const city = address.city ?? address.subregion;
  if (city && address.region) return `${city}, ${address.region}`;
  return city ?? address.region ?? null;
}

export function useTenantLocation(): TenantLocationState {
  const [state, setState] = useState<TenantLocationState>({
    isLoading: true,
    granted: false,
    label: null,
    filters: {},
  });

  useEffect(() => {
    let mounted = true;

    async function resolveLocation() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;

        if (permission.status !== "granted") {
          setState({ isLoading: false, granted: false, label: null, filters: {} });
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [address] = await Location.reverseGeocodeAsync(position.coords);
        if (!mounted) return;

        setState({
          isLoading: false,
          granted: true,
          label: getLabel(address ?? null),
          filters: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radiusKm: 25,
            city: address?.city ?? address?.subregion ?? undefined,
            region: address?.region ?? undefined,
          },
        });
      } catch {
        if (mounted) {
          setState({ isLoading: false, granted: false, label: null, filters: {} });
        }
      }
    }

    void resolveLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => state, [state]);
}
