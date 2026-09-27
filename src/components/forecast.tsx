import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { StatusMessage } from '@/components/status-message';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { capitalize, formatTemperature, formatWeekday, TemperatureUnit } from '@/utils/format';
import { ForecastEntry, getWeatherIconUrl } from '@/utils/weather-api';

type ForecastProps = {
  forecast: ForecastEntry[];
  timezone: number;
  unit: TemperatureUnit;
  isLoading: boolean;
  error: string;
};

export function Forecast({ forecast, timezone, unit, isLoading, error }: ForecastProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        5-Day Forecast
      </Text>

      {isLoading && <StatusMessage variant="loading" message="Loading the five-day forecast..." />}

      {!isLoading && error !== '' && <StatusMessage variant="error" message={error} />}

      {!isLoading && error === '' && forecast.length > 0 && (
        // A vertical list reads better than a five-column grid on a phone screen.
        <View style={styles.list}>
          {forecast.map((day) => {
            const condition = day.weather[0];
            const weekday = formatWeekday(day.dt, timezone);
            const temperature = formatTemperature(day.main.temp, unit);

            return (
              <View
                key={day.dt}
                style={styles.row}
                accessible
                accessibilityLabel={`${weekday}: ${condition.description}, ${temperature}, humidity ${day.main.humidity}%`}>
                <Text style={styles.weekday}>{weekday}</Text>
                <Image source={getWeatherIconUrl(condition.icon)} style={styles.icon} />
                <View style={styles.summary}>
                  <Text style={styles.description}>{capitalize(condition.description)}</Text>
                  <Text style={styles.humidity}>Humidity {day.main.humidity}%</Text>
                </View>
                <Text style={styles.temperature}>{temperature}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.four,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: Colors.panelBorder,
  },
  title: {
    marginBottom: Spacing.three,
    color: Colors.text,
    fontFamily: Fonts.serif,
    fontSize: 21,
    fontWeight: '700',
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderColor: Colors.panelBorder,
    borderRadius: Radius.small,
  },
  weekday: {
    width: 40,
    color: Colors.text,
    fontFamily: Fonts.serif,
    fontSize: 15,
    fontWeight: '700',
  },
  icon: {
    width: 48,
    height: 48,
  },
  summary: {
    flex: 1,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  humidity: {
    marginTop: 2,
    color: Colors.textSubtle,
    fontSize: 12,
  },
  temperature: {
    color: Colors.accent,
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '700',
  },
});
