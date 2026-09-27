import type { CurrentWeatherData, ForecastEntry } from '@/utils/weather-api';

// Monday 2026-09-28 00:00:00 UTC
export const MONDAY_MIDNIGHT_UTC = Date.UTC(2026, 8, 28) / 1000;

const PACIFIC_DAYLIGHT_OFFSET = -7 * 60 * 60;

export function makeWeather(overrides: Partial<CurrentWeatherData> = {}): CurrentWeatherData {
  return {
    dt: MONDAY_MIDNIGHT_UTC + 22 * 60 * 60, // 3:00 PM Pacific
    name: 'Revelstoke',
    timezone: PACIFIC_DAYLIGHT_OFFSET,
    coord: { lat: 51, lon: -118.2 },
    sys: { country: 'CA' },
    weather: [{ description: 'scattered clouds', icon: '03d' }],
    main: { temp: 18.6, feels_like: 17.2, humidity: 64 },
    wind: { speed: 3.1 },
    ...overrides,
  };
}

/**
 * Builds a forecast the way OpenWeatherMap returns it: one entry every three
 * hours for five days (40 entries). Each entry's temperature is its hour of the
 * day in UTC, which makes it easy to check which entry was picked.
 */
export function makeForecastList(start = MONDAY_MIDNIGHT_UTC): ForecastEntry[] {
  return Array.from({ length: 40 }, (_, index) => {
    const dt = start + index * 3 * 60 * 60;

    return {
      dt,
      weather: [{ description: 'light rain', icon: '10d' }],
      main: { temp: new Date(dt * 1000).getUTCHours(), humidity: 80 },
    };
  });
}

export function makeForecastResponse(timezone = PACIFIC_DAYLIGHT_OFFSET) {
  return { list: makeForecastList(), city: { timezone } };
}

export function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

type RouteHandler = (url: URL) => Response | Promise<Response>;

/**
 * Replaces the global fetch with a mock that answers /weather and /forecast
 * requests. Defaults to a successful Revelstoke response for both.
 */
export function mockFetch(
  handlers: { weather?: RouteHandler; forecast?: RouteHandler } = {}
): jest.Mock {
  const weatherHandler = handlers.weather ?? (() => jsonResponse(makeWeather()));
  const forecastHandler = handlers.forecast ?? (() => jsonResponse(makeForecastResponse()));

  const fetchMock = jest.fn(async (input: string) => {
    const url = new URL(input);
    if (url.pathname.endsWith('/weather')) return weatherHandler(url);
    if (url.pathname.endsWith('/forecast')) return forecastHandler(url);
    throw new Error(`Unexpected request: ${input}`);
  });

  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

/** A promise you can resolve later, used to control the order responses arrive in. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}
