import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { UnitToggle } from '@/components/unit-toggle';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { capitalize, formatLocalTime, formatTemperature, TemperatureUnit } from '@/utils/format';
import { CurrentWeatherData, getWeatherIconUrl } from '@/utils/weather-api';

type CurrentWeatherProps = {
  weather: CurrentWeatherData;
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
};

export function CurrentWeather({ weather, unit, onUnitChange }: CurrentWeatherProps) {
  const condition = weather.weather[0];

  const details = [
    { label: 'Feels like', value: formatTemperature(weather.main.feels_like, unit) },
    { label: 'Humidity', value: `${weather.main.humidity}%` },
    { label: 'Wind speed', value: `${weather.wind.speed} m/s` },
  ];

  return (
    <View style={styles.panel} accessibilityLabel="Current weather">
      <UnitToggle unit={unit} onUnitChange={onUnitChange} />

      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.city} accessibilityRole="header">
            {weather.name}, {weather.sys.country}
          </Text>
          <Text style={styles.description}>{capitalize(condition.description)}</Text>
        </View>
        <Image
          source={getWeatherIconUrl(condition.icon)}
          style={styles.icon}
          accessibilityLabel={condition.description}
        />
      </View>

      <Text style={styles.temperature}>{formatTemperature(weather.main.temp, unit)}</Text>

      <View style={styles.details}>
        {details.map((detail) => (
          <View key={detail.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={styles.detailValue}>{detail.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.updated}>
        Updated {formatLocalTime(weather.dt, weather.timezone)} local time · Pull down to refresh
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.four - 4,
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.panelBorder,
    borderRadius: Radius.small,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  headingText: {
    flex: 1,
  },
  city: {
    color: Colors.text,
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    marginTop: Spacing.one,
    color: Colors.textMuted,
    fontSize: 15,
  },
  icon: {
    width: 72,
    height: 72,
    marginVertical: -10,
  },
  temperature: {
    marginVertical: Spacing.three,
    color: Colors.accent,
    fontFamily: Fonts.serif,
    fontSize: 52,
    fontWeight: '700',
  },
  details: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Colors.panelBorder,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: Spacing.two,
  },
  detailLabel: {
    color: Colors.textSubtle,
    fontSize: 14,
  },
  detailValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  updated: {
    marginTop: Spacing.three,
    color: Colors.textSubtle,
    fontSize: 12,
  },
});
