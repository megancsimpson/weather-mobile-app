import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrentWeather } from '@/components/current-weather';
import { Footer } from '@/components/footer';
import { Forecast } from '@/components/forecast';
import { SearchBar } from '@/components/search-bar';
import { SkyBackground, WeatherBadge } from '@/components/sky-background';
import { StatusMessage } from '@/components/status-message';
import { Colors, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { LoadingState, useWeather } from '@/hooks/use-weather';
import type { TemperatureUnit } from '@/utils/format';

const LOADING_MESSAGES: Partial<Record<LoadingState, string>> = {
  city: 'Finding the latest weather...',
  location: 'Finding your location...',
};

export default function WeatherScreen() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const {
    weather,
    forecast,
    loadingState,
    error,
    isForecastLoading,
    forecastError,
    searchByCity,
    searchByCurrentLocation,
    refresh,
  } = useWeather();

  // Pull-to-refresh keeps the current results on screen, so it has no loading message.
  const loadingMessage = LOADING_MESSAGES[loadingState];
  const isSearching = loadingMessage !== undefined;

  return (
    <View style={styles.screen}>
      <SkyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          // Lets buttons respond on the first tap while the keyboard is open.
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          // iOS: scrolls the focused input above the keyboard.
          automaticallyAdjustKeyboardInsets
          refreshControl={
            weather ? (
              <RefreshControl
                refreshing={loadingState === 'refresh'}
                onRefresh={refresh}
                tintColor={Colors.accent}
                colors={[Colors.accent]}
              />
            ) : undefined
          }>
          <View style={styles.card}>
            <WeatherBadge />
            <Text style={styles.eyebrow}>Your daily outlook</Text>
            <Text style={styles.title} accessibilityRole="header">
              Weather Forecast
            </Text>
            <Text style={styles.intro}>
              Search any city, or use your location, to see current conditions and the forecast.
            </Text>

            <SearchBar
              city={city}
              country={country}
              onCityChange={setCity}
              onCountryChange={setCountry}
              onSearch={() => searchByCity(city, country)}
              onUseLocation={searchByCurrentLocation}
              loadingState={loadingState}
            />

            <View style={styles.results}>
              {isSearching && <StatusMessage variant="loading" message={loadingMessage} />}

              {!isSearching && error !== '' && <StatusMessage variant="error" message={error} />}

              {!isSearching && error === '' && !weather && (
                <StatusMessage message="Search for a city or use your location to view the weather." />
              )}

              {!isSearching && weather && (
                <>
                  <CurrentWeather weather={weather} unit={unit} onUnitChange={setUnit} />
                  <Forecast
                    forecast={forecast}
                    timezone={weather.timezone}
                    unit={unit}
                    isLoading={isForecastLoading}
                    error={forecastError}
                  />
                </>
              )}
            </View>
          </View>

          <Footer />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.sky,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  card: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: Radius.large,
    shadowColor: '#1a5278',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  eyebrow: {
    marginBottom: Spacing.two,
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.heading,
    fontFamily: Fonts.serif,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  intro: {
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  results: {
    marginTop: Spacing.five,
  },
});
