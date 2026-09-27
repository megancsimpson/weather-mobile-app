import { useRef } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { LoadingState } from '@/hooks/use-weather';

type SearchBarProps = {
  city: string;
  country: string;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
  onSearch: () => void;
  onUseLocation: () => void;
  loadingState: LoadingState;
};

export function SearchBar({
  city,
  country,
  onCityChange,
  onCountryChange,
  onSearch,
  onUseLocation,
  loadingState,
}: SearchBarProps) {
  const countryInput = useRef<TextInput>(null);
  const isBusy = loadingState !== 'idle';

  function handleSearch() {
    Keyboard.dismiss();
    onSearch();
  }

  function handleUseLocation() {
    Keyboard.dismiss();
    onUseLocation();
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={onCityChange}
        placeholder="Enter a city name"
        placeholderTextColor={Colors.placeholder}
        accessibilityLabel="City name"
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="addressCity"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => countryInput.current?.focus()}
      />

      <View>
        <Text style={styles.label}>Country (optional)</Text>
        <TextInput
          ref={countryInput}
          style={styles.input}
          value={country}
          onChangeText={onCountryChange}
          placeholder="Canada, United Kingdom, or CA"
          placeholderTextColor={Colors.placeholder}
          accessibilityLabel="Country, optional"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="countryName"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Text style={styles.hint}>Enter a country name or two-letter code.</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
          isBusy && styles.buttonDisabled,
        ]}
        onPress={handleSearch}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityState={{ disabled: isBusy, busy: loadingState === 'city' }}>
        {loadingState === 'city' ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Search</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.secondaryButton,
          pressed && styles.secondaryButtonPressed,
          isBusy && styles.buttonDisabled,
        ]}
        onPress={handleUseLocation}
        disabled={isBusy}
        accessibilityRole="button"
        accessibilityHint="Asks for location permission, then shows the weather where you are"
        accessibilityState={{ disabled: isBusy, busy: loadingState === 'location' }}>
        {loadingState === 'location' ? (
          <ActivityIndicator color={Colors.accent} />
        ) : (
          <Text style={styles.secondaryButtonText}>📍 Use my location</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two + 2,
  },
  label: {
    marginBottom: Spacing.one,
    color: Colors.textMuted,
    fontSize: 13,
  },
  hint: {
    marginTop: Spacing.one,
    color: Colors.textSubtle,
    fontSize: 12,
  },
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.small,
  },
  // A tall minimum height keeps the buttons easy to tap (Apple and Android suggest 44–48pt).
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.small,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  primaryButtonPressed: {
    backgroundColor: Colors.accentPressed,
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: Fonts.serif,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.accent,
  },
  secondaryButtonPressed: {
    backgroundColor: Colors.panel,
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontFamily: Fonts.serif,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.72,
  },
});
