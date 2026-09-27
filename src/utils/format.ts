import type { ForecastEntry } from '@/utils/weather-api';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const temperature = unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
  const symbol = unit === 'fahrenheit' ? 'F' : 'C';

  return `${Math.round(temperature)}°${symbol}`;
}

/** Short weekday name ("Mon") in the searched city's local time. */
export function formatWeekday(timestamp: number, timezoneOffset: number): string {
  return new Date((timestamp + timezoneOffset) * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

/** Local time ("3:45 PM") in the searched city's local time. */
export function formatLocalTime(timestamp: number, timezoneOffset: number): string {
  return new Date((timestamp + timezoneOffset) * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The forecast API returns entries every three hours. Keep one entry per day,
 * choosing the one closest to midday in the city's local time.
 */
export function getDailyForecast(
  forecastList: ForecastEntry[],
  timezoneOffset: number
): ForecastEntry[] {
  const forecastsByDay: Record<string, { forecast: ForecastEntry; hoursFromNoon: number }> = {};

  forecastList.forEach((forecast) => {
    const localDate = new Date((forecast.dt + timezoneOffset) * 1000);
    const dayKey = localDate.toISOString().slice(0, 10);
    const hoursFromNoon = Math.abs(localDate.getUTCHours() - 12);

    if (!forecastsByDay[dayKey] || hoursFromNoon < forecastsByDay[dayKey].hoursFromNoon) {
      forecastsByDay[dayKey] = { forecast, hoursFromNoon };
    }
  });

  return Object.values(forecastsByDay)
    .slice(0, 5)
    .map(({ forecast }) => forecast);
}
