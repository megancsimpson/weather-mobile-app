import { render, screen, userEvent, within } from '@testing-library/react-native';
import { openBrowserAsync } from 'expo-web-browser';

import WeatherScreen from '@/app/index';
import { jsonResponse, makeWeather, mockFetch } from '@/test-utils/fixtures';
import { getCurrentCoordinates } from '@/utils/location';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('@/utils/location', () => ({ getCurrentCoordinates: jest.fn() }));

const mockedGetCurrentCoordinates = jest.mocked(getCurrentCoordinates);

beforeEach(() => {
  mockedGetCurrentCoordinates.mockReset();
});

async function renderScreen() {
  const user = userEvent.setup();
  await render(<WeatherScreen />);
  return user;
}

async function search(user: ReturnType<typeof userEvent.setup>, city: string, country = '') {
  if (city) await user.type(screen.getByLabelText('City name'), city);
  if (country) await user.type(screen.getByLabelText('Country, optional'), country);
  await user.press(screen.getByRole('button', { name: 'Search' }));
}

describe('WeatherScreen', () => {
  it('starts with instructions and no weather', async () => {
    await renderScreen();

    expect(screen.getByRole('header', { name: 'Weather Forecast' })).toBeOnTheScreen();
    expect(
      screen.getByText('Search for a city or use your location to view the weather.')
    ).toBeOnTheScreen();
    expect(screen.queryByText('5-Day Forecast')).not.toBeOnTheScreen();
  });

  it('shows current weather and the five-day forecast after a search', async () => {
    const fetchMock = mockFetch();
    const user = await renderScreen();

    await search(user, 'Revelstoke', 'Canada');

    expect(await screen.findByRole('header', { name: 'Revelstoke, CA' })).toBeOnTheScreen();
    expect(screen.getByText('19°C')).toBeOnTheScreen();
    expect(screen.getByText('Scattered clouds')).toBeOnTheScreen();
    expect(screen.getByText('17°C')).toBeOnTheScreen(); // feels like
    expect(screen.getByText('64%')).toBeOnTheScreen();
    expect(screen.getByText('3.1 m/s')).toBeOnTheScreen();
    expect(screen.getByText(/Updated 3:00 PM local time/)).toBeOnTheScreen();

    expect(await screen.findByText('Sun')).toBeOnTheScreen();
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu']) {
      expect(screen.getByText(day)).toBeOnTheScreen();
    }

    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('q')).toBe('Revelstoke,CA');
  });

  it('switches every temperature between Celsius and Fahrenheit', async () => {
    mockFetch();
    const user = await renderScreen();
    await search(user, 'Revelstoke');
    await screen.findByText('Sun');

    const celsius = screen.getByRole('radio', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('radio', { name: 'Fahrenheit' });
    expect(celsius).toBeChecked();

    await user.press(fahrenheit);

    expect(fahrenheit).toBeChecked();
    expect(celsius).not.toBeChecked();
    expect(screen.getByText('65°F')).toBeOnTheScreen();
    expect(screen.queryByText('19°C')).not.toBeOnTheScreen();
    expect(screen.queryAllByText(/\d°C$/)).toHaveLength(0); // no Celsius values left
  });

  it('asks for a city when the search is blank', async () => {
    const fetchMock = mockFetch();
    const user = await renderScreen();

    await search(user, '');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a city name to see its weather.'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a country it does not recognize without calling the API', async () => {
    const fetchMock = mockFetch();
    const user = await renderScreen();

    await search(user, 'Paris', 'Atlantis');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We do not recognize that country. Try a two-letter country code instead.'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('explains when a city cannot be found', async () => {
    mockFetch({ weather: () => jsonResponse({}, 404) });
    const user = await renderScreen();

    await search(user, 'Nowhereville');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not find "Nowhereville". Check the spelling and try again.'
    );
  });

  it('mentions the country when a city is not found there', async () => {
    mockFetch({ weather: () => jsonResponse({}, 404) });
    const user = await renderScreen();

    await search(user, 'Revelstoke', 'Japan');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /^We could not find "Revelstoke" in Japan\. Check the country/
    );
  });

  it('shows a friendly message when the weather service fails', async () => {
    mockFetch({ weather: () => Promise.reject(new TypeError('Network request failed')) });
    const user = await renderScreen();

    await search(user, 'Revelstoke');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Weather is unavailable right now. Please try again in a moment.'
    );
  });

  it('clears the old error when a new search succeeds', async () => {
    let attempt = 0;
    mockFetch({
      weather: () => {
        attempt += 1;
        return attempt === 1 ? jsonResponse({}, 404) : jsonResponse(makeWeather());
      },
    });
    const user = await renderScreen();

    await search(user, 'Revelstok');
    expect(await screen.findByRole('alert')).toBeOnTheScreen();

    await user.clear(screen.getByLabelText('City name'));
    await search(user, 'Revelstoke');

    expect(await screen.findByRole('header', { name: 'Revelstoke, CA' })).toBeOnTheScreen();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('shows the weather at the phone’s location', async () => {
    mockedGetCurrentCoordinates.mockResolvedValue({
      status: 'granted',
      coordinates: { latitude: 51, longitude: -118.2 },
    });
    const fetchMock = mockFetch();
    const user = await renderScreen();

    await user.press(screen.getByRole('button', { name: /Use my location/ }));

    expect(await screen.findByRole('header', { name: 'Revelstoke, CA' })).toBeOnTheScreen();
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('lat')).toBe('51');
    expect(url.searchParams.get('lon')).toBe('-118.2');
  });

  it.each([
    ['denied', /Location permission is off/],
    ['services-disabled', /Location services are turned off/],
    ['unavailable', /could not find your location/],
  ] as const)('explains a %s location result', async (status, message) => {
    mockedGetCurrentCoordinates.mockResolvedValue({ status });
    const fetchMock = mockFetch();
    const user = await renderScreen();

    await user.press(screen.getByRole('button', { name: /Use my location/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('opens footer links in the in-app browser', async () => {
    const user = await renderScreen();

    await user.press(screen.getByRole('link', { name: 'GitHub' }));

    expect(openBrowserAsync).toHaveBeenCalledWith(
      'https://github.com/megancsimpson/weather-mobile-app'
    );
  });

  it('describes each forecast day for screen readers', async () => {
    mockFetch();
    const user = await renderScreen();
    await search(user, 'Revelstoke');

    const monday = await screen.findByLabelText(/^Mon:/);
    expect(monday).toHaveAccessibleName(/light rain, \d+°C, humidity 80%/);
    expect(within(monday).getByText('Humidity 80%')).toBeOnTheScreen();
  });
});
