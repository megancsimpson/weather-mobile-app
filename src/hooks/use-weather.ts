import { useRef, useState } from 'react';

import { getCountryCode } from '@/utils/countries';
import { getDailyForecast } from '@/utils/format';
import { getCurrentCoordinates } from '@/utils/location';
import {
  CityNotFoundError,
  Coordinates,
  CurrentWeatherData,
  fetchForecast,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  ForecastEntry,
  MissingApiKeyError,
} from '@/utils/weather-api';

/** What the app is currently waiting on, so each button can show its own spinner. */
export type LoadingState = 'idle' | 'city' | 'location' | 'refresh';

const GENERIC_ERROR = 'Weather is unavailable right now. Please try again in a moment.';
const MISSING_KEY_ERROR =
  'No OpenWeatherMap API key found. Add EXPO_PUBLIC_OPENWEATHER_API_KEY to your .env file and restart Expo.';

const LOCATION_ERRORS = {
  denied:
    'Location permission is off. Allow location access in Settings, or search for a city instead.',
  'services-disabled': 'Location services are turned off. Turn them on in Settings and try again.',
  unavailable: 'We could not find your location. Please try again, or search for a city instead.',
} as const;

export function useWeather() {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastEntry[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState('');
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');

  // Each request gets an id so a slow, older response can't overwrite a newer one
  // (for example, tapping "Use my location" and then searching for a city).
  const latestRequestId = useRef(0);

  function startRequest(nextLoadingState: LoadingState, clearResults: boolean) {
    latestRequestId.current += 1;
    setLoadingState(nextLoadingState);
    setError('');

    if (clearResults) {
      setWeather(null);
      setForecast([]);
      setForecastError('');
    }

    return latestRequestId.current;
  }

  function isLatest(requestId: number) {
    return requestId === latestRequestId.current;
  }

  async function loadForecast(requestId: number, coordinates: Coordinates) {
    setIsForecastLoading(true);
    setForecastError('');

    try {
      const forecastData = await fetchForecast(coordinates);
      if (isLatest(requestId)) {
        setForecast(getDailyForecast(forecastData.list, forecastData.city.timezone));
      }
    } catch {
      if (isLatest(requestId)) {
        setForecastError('The five-day forecast is unavailable right now. Please try again later.');
      }
    } finally {
      if (isLatest(requestId)) {
        setIsForecastLoading(false);
      }
    }
  }

  /** Shows the new current weather, then loads the forecast for the same place. */
  async function showWeather(requestId: number, weatherData: CurrentWeatherData) {
    if (!isLatest(requestId)) return;

    setWeather(weatherData);
    setLoadingState('idle');
    await loadForecast(requestId, {
      latitude: weatherData.coord.lat,
      longitude: weatherData.coord.lon,
    });
  }

  function showError(requestId: number, message: string) {
    if (!isLatest(requestId)) return;

    setError(message);
    setLoadingState('idle');
  }

  async function searchByCity(city: string, country: string) {
    const cityName = city.trim();
    const countryName = country.trim();

    if (!cityName) {
      showError(startRequest('idle', true), 'Enter a city name to see its weather.');
      return;
    }

    const countryCode = countryName ? getCountryCode(countryName) : '';

    if (countryName && !countryCode) {
      showError(
        startRequest('idle', true),
        'We do not recognize that country. Try a two-letter country code instead.'
      );
      return;
    }

    const requestId = startRequest('city', true);
    const location = countryCode ? `${cityName},${countryCode}` : cityName;

    try {
      await showWeather(requestId, await fetchWeatherByCity(location));
    } catch (requestError) {
      if (requestError instanceof CityNotFoundError) {
        showError(
          requestId,
          countryName
            ? `We could not find "${cityName}" in ${countryName}. Check the country, or leave it blank to search by city only.`
            : `We could not find "${cityName}". Check the spelling and try again.`
        );
      } else {
        showError(requestId, getErrorMessage(requestError));
      }
    }
  }

  async function searchByCurrentLocation() {
    const requestId = startRequest('location', true);
    const location = await getCurrentCoordinates();

    if (location.status !== 'granted') {
      showError(requestId, LOCATION_ERRORS[location.status]);
      return;
    }

    try {
      await showWeather(requestId, await fetchWeatherByCoordinates(location.coordinates));
    } catch (requestError) {
      showError(requestId, getErrorMessage(requestError));
    }
  }

  /** Pull-to-refresh: reloads the place already on screen and keeps it visible meanwhile. */
  async function refresh() {
    if (!weather) return;

    const requestId = startRequest('refresh', false);

    try {
      await showWeather(
        requestId,
        await fetchWeatherByCoordinates({
          latitude: weather.coord.lat,
          longitude: weather.coord.lon,
        })
      );
    } catch (requestError) {
      showError(requestId, getErrorMessage(requestError));
    }
  }

  return {
    weather,
    forecast,
    loadingState,
    error,
    isForecastLoading,
    forecastError,
    searchByCity,
    searchByCurrentLocation,
    refresh,
  };
}

function getErrorMessage(requestError: unknown): string {
  return requestError instanceof MissingApiKeyError ? MISSING_KEY_ERROR : GENERIC_ERROR;
}
