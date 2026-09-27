// Runs before each test file. The app reads the API key when weather-api.ts
// first loads, so a placeholder key has to be set before anything is imported.
process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = 'test-key';
