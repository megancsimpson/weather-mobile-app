import { jsonResponse, makeWeather, mockFetch } from '@/test-utils/fixtures';

type WeatherApi = typeof import('@/utils/weather-api');

/** The API key is read when the module loads, so load a fresh copy per test. */
function loadWeatherApi(apiKey: string | undefined): WeatherApi {
  if (apiKey === undefined) {
    delete process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  } else {
    process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = apiKey;
  }

  let weatherApi!: WeatherApi;
  jest.isolateModules(() => {
    weatherApi = require('@/utils/weather-api');
  });
  return weatherApi;
}

function requestedUrl(fetchMock: jest.Mock, call = 0): URL {
  return new URL(fetchMock.mock.calls[call][0]);
}

const originalApiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

afterEach(() => {
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = originalApiKey;
});

describe('weather API', () => {
  it('searches by city name with metric units and the API key', async () => {
    const fetchMock = mockFetch();
    const { fetchWeatherByCity } = loadWeatherApi('test-key');

    const weather = await fetchWeatherByCity('Revelstoke,CA');

    expect(weather.name).toBe('Revelstoke');
    const url = requestedUrl(fetchMock);
    expect(url.origin + url.pathname).toBe('https://api.openweathermap.org/data/2.5/weather');
    expect(url.searchParams.get('q')).toBe('Revelstoke,CA');
    expect(url.searchParams.get('units')).toBe('metric');
    expect(url.searchParams.get('appid')).toBe('test-key');
  });

  it('encodes city names with spaces and accents', async () => {
    const fetchMock = mockFetch();
    const { fetchWeatherByCity } = loadWeatherApi('test-key');

    await fetchWeatherByCity('São Paulo,BR');

    expect(requestedUrl(fetchMock).searchParams.get('q')).toBe('São Paulo,BR');
  });

  it('requests current weather and forecast by coordinates', async () => {
    const fetchMock = mockFetch();
    const { fetchForecast, fetchWeatherByCoordinates } = loadWeatherApi('test-key');
    const coordinates = { latitude: 49.28, longitude: -123.12 };

    await fetchWeatherByCoordinates(coordinates);
    await fetchForecast(coordinates);

    const weatherUrl = requestedUrl(fetchMock, 0);
    expect(weatherUrl.pathname).toBe('/data/2.5/weather');
    expect(weatherUrl.searchParams.get('lat')).toBe('49.28');
    expect(weatherUrl.searchParams.get('lon')).toBe('-123.12');

    const forecastUrl = requestedUrl(fetchMock, 1);
    expect(forecastUrl.pathname).toBe('/data/2.5/forecast');
    expect(forecastUrl.searchParams.get('lat')).toBe('49.28');
  });

  it('throws CityNotFoundError for a 404', async () => {
    mockFetch({ weather: () => jsonResponse({ message: 'city not found' }, 404) });
    const { CityNotFoundError, fetchWeatherByCity } = loadWeatherApi('test-key');

    await expect(fetchWeatherByCity('Nowhere')).rejects.toBeInstanceOf(CityNotFoundError);
  });

  it('throws a general error for other failed responses', async () => {
    mockFetch({ weather: () => jsonResponse({}, 401) });
    const { CityNotFoundError, fetchWeatherByCity } = loadWeatherApi('test-key');

    const request = fetchWeatherByCity('Revelstoke');
    await expect(request).rejects.toThrow('status 401');
    await expect(request).rejects.not.toBeInstanceOf(CityNotFoundError);
  });

  it('throws MissingApiKeyError without calling the API when no key is set', async () => {
    const fetchMock = mockFetch();
    const { MissingApiKeyError, fetchWeatherByCity } = loadWeatherApi(undefined);

    await expect(fetchWeatherByCity('Revelstoke')).rejects.toBeInstanceOf(MissingApiKeyError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('builds the OpenWeatherMap icon URL', () => {
    const { getWeatherIconUrl } = loadWeatherApi('test-key');

    expect(getWeatherIconUrl(makeWeather().weather[0].icon)).toBe(
      'https://openweathermap.org/img/wn/03d@2x.png'
    );
  });
});
