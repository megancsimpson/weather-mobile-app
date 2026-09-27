# Weather Forecast Mobile App

A React Native (Expo) weather app for iOS and Android. It shows live current weather and a five-day forecast from the OpenWeatherMap API. Search for any city, or tap **Use my location** to get the weather where you are.

This is the mobile version of my [Weather Forecast web app](https://github.com/megancsimpson/weather-forecast-app) (React + Vite), rebuilt with React Native components and mobile features.

## Features

- **Use my location**: asks for location permission, then shows the weather at your current GPS position
- Search by city, with an optional country (name or two-letter code, e.g. `Canada` or `CA`)
- Current weather: temperature, feels-like temperature, conditions with icon, humidity, wind speed, and last-updated time
- Five-day forecast, one row per day
- Celsius/Fahrenheit toggle
- **Pull down to refresh** the weather that's on screen
- Clear messages for a blank search, an unknown country, a city that can't be found, location permission turned off, and network or API errors

### Mobile-specific features and guidelines

| Feature | How it's used |
| --- | --- |
| Geolocation (`expo-location`) | Asks for "while using the app" permission only when you tap the button, then reads your position. It explains what to do if permission is denied or location services are off. |
| Pull-to-refresh (`RefreshControl`) | The standard mobile way to reload content, with no refresh button needed. |
| Keyboard handling | The **Next** key moves from city to country, and **Search** submits. Buttons work while the keyboard is open, and dragging the page closes the keyboard. |
| Safe areas | Content stays clear of the notch, Dynamic Island, and status bar. |
| Touch targets | Buttons are at least 50pt tall, and small controls have extra tap area (`hitSlop`). |
| Accessibility | Screen-reader labels, roles (header, button, radio, link, alert), and live error messages. |
| In-app browser (`expo-web-browser`) | Footer links open inside the app instead of switching to Safari/Chrome. |

## Technologies Used

- React Native 0.86 and Expo SDK 57
- Expo Router (file-based navigation)
- TypeScript
- expo-location, expo-image, expo-web-browser
- OpenWeatherMap API (Current Weather and 5 Day / 3 Hour Forecast)
- ESLint (`eslint-config-expo`)
- Jest (`jest-expo`) and React Native Testing Library

## Getting Started

### What you need

- [Node.js](https://nodejs.org/) (LTS version)
- A free [OpenWeatherMap API key](https://home.openweathermap.org/api_keys)
- The **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)), or an iOS Simulator / Android Emulator

### Install and run

1. Clone the repository and enter the folder.

   ```bash
   git clone https://github.com/megancsimpson/weather-mobile-app.git
   cd weather-mobile-app
   ```

2. Install the dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root by copying the example, then add your API key.

   ```bash
   cp .env.example .env
   ```

   ```env
   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
   ```

4. Start the development server.

   ```bash
   npx expo start
   ```

5. Open the app:
   - **On your phone:** scan the QR code in the terminal (with the Camera app on iOS or with Expo Go on Android). Your phone and computer must be on the same Wi-Fi network.
   - **In a simulator:** press `i` for the iOS Simulator or `a` for an Android Emulator.

The first time you tap **Use my location**, the app asks for location permission. Choose **Allow While Using App**.

> New OpenWeatherMap keys can take up to a couple of hours to start working. Until then, the app shows "Weather is unavailable right now."

## Available Scripts

```bash
npx expo start      # start the development server
npm test            # run the automated tests
npm run lint        # check the code with ESLint
npm run typecheck   # check TypeScript types
npm run ios         # start and open the iOS Simulator
npm run android     # start and open an Android Emulator
```

## Project Structure

```text
weather-mobile-app/
├── assets/images/           # App icon and splash screen images
├── src/
│   ├── __tests__/           # Automated tests (Jest + React Native Testing Library)
│   ├── app/                 # Screens (Expo Router: each file is a route)
│   │   ├── _layout.tsx      # Root layout: status bar and navigation stack
│   │   └── index.tsx        # Weather screen: puts the components together
│   ├── components/
│   │   ├── current-weather.tsx  # Current conditions panel
│   │   ├── footer.tsx           # Credits and links (open in an in-app browser)
│   │   ├── forecast.tsx         # Five-day forecast list
│   │   ├── search-bar.tsx       # City/country inputs, Search and Use my location buttons
│   │   ├── sky-background.tsx   # Decorative sun and clouds
│   │   ├── status-message.tsx   # Empty, loading, and error messages
│   │   └── unit-toggle.tsx      # °C/°F toggle
│   ├── constants/
│   │   └── theme.ts         # Colours, fonts, spacing
│   ├── test-utils/          # Test setup, sample API responses, and a fake fetch
│   ├── hooks/
│   │   └── use-weather.ts   # Weather state, search, location, and refresh logic
│   └── utils/
│       ├── countries.ts     # Country names and aliases to two-letter codes
│       ├── format.ts        # Temperature/date formatting and daily forecast selection
│       ├── location.ts      # Location permission and GPS position
│       └── weather-api.ts   # OpenWeatherMap requests and response types
├── .env.example             # Template for your API key (copy to .env)
├── app.json                 # Expo config: app name, icons, location permission text
└── package.json             # Dependencies and scripts
```

## Testing

```bash
npm test
```

The 49 tests use Jest and React Native Testing Library. They use a fake `fetch` and a fake location, so no API key, phone, or internet connection is needed.

| Test file | What it checks |
| --- | --- |
| `weather-screen.test.tsx` | The whole screen as a user would use it: searching, the °C/°F toggle, every error message, **Use my location**, and footer links |
| `use-weather.test.ts` | Pull-to-refresh keeps the weather on screen, the forecast can fail on its own, and a slow older request can't overwrite a newer one |
| `location.test.ts` | Location permission granted, denied, services off, and GPS failure |
| `weather-api.test.ts` | Request URLs, city-name encoding, 404 and other errors, and a missing API key |
| `format.test.ts` | °C/°F conversion, days and times in the city's time zone, and choosing one forecast per day |
| `countries.test.ts` | Country names, aliases, and two-letter codes |

## Development Notes

### Converting from React (web) to React Native

- **Components:** HTML elements became React Native components: `div` to `View`, `p`/`h1` to `Text`, `input` to `TextInput`, `button` to `Pressable`, `img` to `Image` (from `expo-image`, which caches the weather icons).
- **Styling:** React Native has no CSS files, class names, grid, or media queries. The styles in `App.css` were rewritten with `StyleSheet.create` and flexbox, and the colours moved into `constants/theme.ts` so every component uses the same palette. The CSS sun and clouds, which used `::before`/`::after`, are now overlapping rounded `View`s.
- **Forms:** there is no `<form onSubmit>` in React Native. The keyboard's return key and the buttons call the search function directly.
- **Environment variables:** `import.meta.env.VITE_...` (Vite) became `process.env.EXPO_PUBLIC_...` (Expo).
- **Structure:** the old `App.jsx` handled state, API calls, and layout in one file. That is now split into an API module (`weather-api.ts`), formatting helpers (`format.ts`), a custom hook (`use-weather.ts`), and a screen that only handles layout. The code is also converted to TypeScript, so API response shapes are checked.

### Design decisions

- **Layout for a phone:** the five-column forecast grid became a vertical list, which is easier to read on a narrow screen, and the current-weather details are stacked rows.
- **Location permission is requested only when needed.** The app asks when you tap **Use my location**, not at launch, which follows Apple's and Google's permission guidelines. It asks for "while in use" access only, never background access.
- **Fast location:** the app uses the phone's last known position if it's under 10 minutes old, which returns instantly, and only waits for a fresh GPS reading when needed.
- **Refresh keeps the weather on screen.** Pulling to refresh reloads the same place without clearing the screen, while a new search clears the old results.

### Challenges

- **Out-of-order responses:** if you tap **Use my location** and then quickly search for a city, the location request might finish last and overwrite the city result. Each request now gets an ID, and only the most recent request can update the screen.
- **Keyboard covering inputs:** on a phone, the keyboard can hide the fields and buttons. The page scrolls with the keyboard, taps work while it is open, and dragging the page closes it.
- **Country aliases:** writing the tests showed that `UK` was being sent as-is instead of as the ISO code `GB`, because the "any two letters" check ran before the names list. (OpenWeatherMap happens to accept `UK`, so searches still worked.) The names list is now checked first.
- **Different error cases:** location adds new ways to fail (permission denied, location services off, no GPS signal), and each one gets its own message explaining what to do.

### API key security

`EXPO_PUBLIC_` variables are built into the app, so anyone who has the app installed could extract the key. For a class project with a free-tier key this is acceptable. `.env` is kept out of Git. A public App Store release should call OpenWeatherMap through a small server that holds the key instead.

## Author

Megan Simpson
[LinkedIn](https://www.linkedin.com/in/megancsimpson/) · Revelstoke, BC, Canada
Software Development Student, Circuit Stream

Weather data provided by [OpenWeather](https://openweathermap.org/).
