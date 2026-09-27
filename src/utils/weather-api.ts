const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Expo inlines EXPO_PUBLIC_ variables from .env at build time.
// This must stay a direct `process.env.EXPO_PUBLIC_...` reference for that to work.
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

type WeatherCondition = {
  description: string;
  icon: string;
};

export type CurrentWeatherData = {
  dt: number;
  name: string;
  timezone: number;
  coord: { lat: number; lon: number };
  sys: { country: string };
  weather: WeatherCondition[];
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
};

export type ForecastEntry = {
  dt: number;
  weather: WeatherCondition[];
  main: { temp: number; humidity: number };
};

type ForecastResponse = {
  list: ForecastEntry[];
  city: { timezone: number };
};

export type Coordinates = { latitude: number; longitude: number };

/** Thrown when OpenWeatherMap cannot find the requested city. */
export class CityNotFoundError extends Error {}

/** Thrown when the app was started without an API key in .env. */
export class MissingApiKeyError extends Error {}

async function request<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!API_KEY) {
    throw new MissingApiKeyError('EXPO_PUBLIC_OPENWEATHER_API_KEY is not set');
  }

  const query = new URLSearchParams({ ...params, units: 'metric', appid: API_KEY });
  const response = await fetch(`${API_BASE_URL}/${path}?${query}`);

  if (response.status === 404) {
    throw new CityNotFoundError('City not found');
  }

  if (!response.ok) {
    throw new Error(`OpenWeatherMap request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** Looks up current weather by city, e.g. "Revelstoke" or "Revelstoke,CA". */
export function fetchWeatherByCity(location: string): Promise<CurrentWeatherData> {
  return request<CurrentWeatherData>('weather', { q: location });
}

export function fetchWeatherByCoordinates({
  latitude,
  longitude,
}: Coordinates): Promise<CurrentWeatherData> {
  return request<CurrentWeatherData>('weather', {
    lat: String(latitude),
    lon: String(longitude),
  });
}

export function fetchForecast({ latitude, longitude }: Coordinates): Promise<ForecastResponse> {
  return request<ForecastResponse>('forecast', {
    lat: String(latitude),
    lon: String(longitude),
  });
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
