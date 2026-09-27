import * as Location from 'expo-location';

import type { Coordinates } from '@/utils/weather-api';

type LocationResult =
  | { status: 'granted'; coordinates: Coordinates }
  | { status: 'denied' | 'services-disabled' | 'unavailable' };

/**
 * Asks for foreground location permission, then reads the device's position.
 * Uses the last known position when it is recent, because that returns
 * instantly, and falls back to a fresh GPS reading otherwise.
 */
export async function getCurrentCoordinates(): Promise<LocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    return { status: 'denied' };
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    return { status: 'services-disabled' };
  }

  try {
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

    return {
      status: 'granted',
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch {
    return { status: 'unavailable' };
  }
}
