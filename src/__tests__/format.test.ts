import { MONDAY_MIDNIGHT_UTC, makeForecastList } from '@/test-utils/fixtures';
import {
  capitalize,
  formatLocalTime,
  formatTemperature,
  formatWeekday,
  getDailyForecast,
} from '@/utils/format';

describe('formatTemperature', () => {
  it('rounds Celsius temperatures', () => {
    expect(formatTemperature(18.6, 'celsius')).toBe('19°C');
    expect(formatTemperature(-0.4, 'celsius')).toBe('0°C');
  });

  it('converts Celsius to Fahrenheit', () => {
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
    expect(formatTemperature(100, 'fahrenheit')).toBe('212°F');
    expect(formatTemperature(-40, 'fahrenheit')).toBe('-40°F');
    expect(formatTemperature(18.6, 'fahrenheit')).toBe('65°F');
  });
});

describe('formatWeekday and formatLocalTime', () => {
  it('uses the city’s time zone, not the phone’s', () => {
    // Monday 00:00 UTC is still Sunday afternoon in Vancouver (UTC-7)...
    expect(formatWeekday(MONDAY_MIDNIGHT_UTC, -7 * 3600)).toBe('Sun');
    expect(formatLocalTime(MONDAY_MIDNIGHT_UTC, -7 * 3600)).toBe('5:00 PM');
    // ...and already Monday morning in Tokyo (UTC+9).
    expect(formatWeekday(MONDAY_MIDNIGHT_UTC, 9 * 3600)).toBe('Mon');
    expect(formatLocalTime(MONDAY_MIDNIGHT_UTC, 9 * 3600)).toBe('9:00 AM');
  });
});

describe('capitalize', () => {
  it('uppercases the first letter only', () => {
    expect(capitalize('light rain')).toBe('Light rain');
    expect(capitalize('')).toBe('');
  });
});

describe('getDailyForecast', () => {
  it('returns five days, one entry per day', () => {
    const daily = getDailyForecast(makeForecastList(), 0);

    expect(daily).toHaveLength(5);
    const days = daily.map((entry) => new Date(entry.dt * 1000).getUTCDate());
    expect(new Set(days).size).toBe(5);
  });

  it('picks the entry closest to midday local time', () => {
    // In UTC, the entries are at 00, 03, ..., 21 — so 12:00 is available.
    const utcDaily = getDailyForecast(makeForecastList(), 0);
    expect(utcDaily.every((entry) => entry.main.temp === 12)).toBe(true);

    // In UTC+2, the 09:00 and 12:00 UTC entries fall at 11:00 and 14:00 local,
    // so 11:00 local (09:00 UTC) is the closest to noon.
    const plusTwoDaily = getDailyForecast(makeForecastList(), 2 * 3600);
    expect(plusTwoDaily.every((entry) => entry.main.temp === 9)).toBe(true);
  });

  it('groups entries by the city’s local date', () => {
    // At UTC-7, the first entries (Monday 00:00–06:00 UTC) belong to Sunday
    // local time, so Sunday is the first forecast day.
    const daily = getDailyForecast(makeForecastList(), -7 * 3600);

    expect(formatWeekday(daily[0].dt, -7 * 3600)).toBe('Sun');
    expect(daily.map((entry) => formatWeekday(entry.dt, -7 * 3600))).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
    ]);
  });

  it('returns an empty list for an empty forecast', () => {
    expect(getDailyForecast([], 0)).toEqual([]);
  });
});
