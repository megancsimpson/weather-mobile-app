import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useWeather } from '@/hooks/use-weather';
import { deferred, jsonResponse, makeWeather, mockFetch } from '@/test-utils/fixtures';
import { getCurrentCoordinates } from '@/utils/location';

jest.mock('@/utils/location', () => ({ getCurrentCoordinates: jest.fn() }));

const mockedGetCurrentCoordinates = jest.mocked(getCurrentCoordinates);

beforeEach(() => {
  mockedGetCurrentCoordinates.mockReset();
});

describe('useWeather', () => {
  it('loads current weather, then a five-day forecast for the same place', async () => {
    const fetchMock = mockFetch();
    const { result } = await renderHook(() => useWeather());

    await act(() => result.current.searchByCity('Revelstoke', 'Canada'));

    expect(result.current.weather?.name).toBe('Revelstoke');
    expect(result.current.forecast).toHaveLength(5);
    expect(result.current.loadingState).toBe('idle');
    expect(result.current.isForecastLoading).toBe(false);

    const forecastUrl = new URL(fetchMock.mock.calls[1][0]);
    expect(forecastUrl.searchParams.get('lat')).toBe('51');
    expect(forecastUrl.searchParams.get('lon')).toBe('-118.2');
  });

  it('keeps the current weather when only the forecast fails', async () => {
    mockFetch({ forecast: () => jsonResponse({}, 500) });
    const { result } = await renderHook(() => useWeather());

    await act(() => result.current.searchByCity('Revelstoke', ''));

    expect(result.current.weather?.name).toBe('Revelstoke');
    expect(result.current.error).toBe('');
    expect(result.current.forecastError).toMatch(/five-day forecast is unavailable/);
  });

  it('refreshes the place on screen without clearing it first', async () => {
    const refreshed = deferred<Response>();
    let weatherRequests = 0;
    const fetchMock = mockFetch({
      weather: () => {
        weatherRequests += 1;
        return weatherRequests === 1
          ? jsonResponse(makeWeather())
          : refreshed.promise;
      },
    });
    const { result } = await renderHook(() => useWeather());
    await act(() => result.current.searchByCity('Revelstoke', ''));

    let refreshDone!: Promise<void>;
    await act(async () => {
      refreshDone = result.current.refresh();
    });

    // While refreshing, the old weather stays visible.
    expect(result.current.loadingState).toBe('refresh');
    expect(result.current.weather?.main.temp).toBe(18.6);

    await act(async () => {
      refreshed.resolve(jsonResponse(makeWeather({ main: { temp: 21, feels_like: 20, humidity: 50 } })));
      await refreshDone;
    });

    expect(result.current.loadingState).toBe('idle');
    expect(result.current.weather?.main.temp).toBe(21);

    // The refresh looked up the same coordinates, not the city name.
    const refreshUrl = new URL(fetchMock.mock.calls[2][0]);
    expect(refreshUrl.searchParams.get('lat')).toBe('51');
    expect(refreshUrl.searchParams.has('q')).toBe(false);
  });

  it('ignores a slow location result that finishes after a newer city search', async () => {
    const slowLocation = deferred<Awaited<ReturnType<typeof getCurrentCoordinates>>>();
    mockedGetCurrentCoordinates.mockReturnValue(slowLocation.promise);
    mockFetch({
      weather: (url) =>
        jsonResponse(makeWeather({ name: url.searchParams.has('q') ? 'Vancouver' : 'Revelstoke' })),
    });
    const { result } = await renderHook(() => useWeather());

    let locationDone!: Promise<void>;
    await act(async () => {
      locationDone = result.current.searchByCurrentLocation();
    });
    await act(() => result.current.searchByCity('Vancouver', ''));
    expect(result.current.weather?.name).toBe('Vancouver');

    // The location lookup finishes last — it must not replace Vancouver.
    await act(async () => {
      slowLocation.resolve({ status: 'granted', coordinates: { latitude: 51, longitude: -118.2 } });
      await locationDone;
    });

    await waitFor(() => expect(result.current.forecast).toHaveLength(5));
    expect(result.current.weather?.name).toBe('Vancouver');
  });

  it('does nothing when refreshing with no weather on screen', async () => {
    const fetchMock = mockFetch();
    const { result } = await renderHook(() => useWeather());

    await act(() => result.current.refresh());

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
