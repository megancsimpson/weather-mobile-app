import * as Location from 'expo-location';

import { getCurrentCoordinates } from '@/utils/location';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockedLocation = jest.mocked(Location);

function position(latitude: number, longitude: number) {
  return { coords: { latitude, longitude } } as Location.LocationObject;
}

beforeEach(() => {
  jest.resetAllMocks();
  mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
    status: 'granted',
  } as Location.LocationPermissionResponse);
  mockedLocation.hasServicesEnabledAsync.mockResolvedValue(true);
});

describe('getCurrentCoordinates', () => {
  it('uses a recent last-known position when there is one', async () => {
    mockedLocation.getLastKnownPositionAsync.mockResolvedValue(position(51, -118.2));

    await expect(getCurrentCoordinates()).resolves.toEqual({
      status: 'granted',
      coordinates: { latitude: 51, longitude: -118.2 },
    });
    expect(mockedLocation.getLastKnownPositionAsync).toHaveBeenCalledWith({ maxAge: 600000 });
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('falls back to a fresh GPS reading', async () => {
    mockedLocation.getLastKnownPositionAsync.mockResolvedValue(null);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(49.28, -123.12));

    await expect(getCurrentCoordinates()).resolves.toEqual({
      status: 'granted',
      coordinates: { latitude: 49.28, longitude: -123.12 },
    });
  });

  it('reports denied permission without reading the position', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    } as Location.LocationPermissionResponse);

    await expect(getCurrentCoordinates()).resolves.toEqual({ status: 'denied' });
    expect(mockedLocation.getLastKnownPositionAsync).not.toHaveBeenCalled();
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('reports when location services are turned off', async () => {
    mockedLocation.hasServicesEnabledAsync.mockResolvedValue(false);

    await expect(getCurrentCoordinates()).resolves.toEqual({ status: 'services-disabled' });
  });

  it('reports unavailable when the GPS reading fails', async () => {
    mockedLocation.getLastKnownPositionAsync.mockResolvedValue(null);
    mockedLocation.getCurrentPositionAsync.mockRejectedValue(new Error('timeout'));

    await expect(getCurrentCoordinates()).resolves.toEqual({ status: 'unavailable' });
  });
});
