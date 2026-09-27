import { openBrowserAsync } from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

const LINKS = [
  { label: 'OpenWeather', url: 'https://openweathermap.org/' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/megancsimpson' },
  { label: 'GitHub', url: 'https://github.com/megancsimpson/weather-mobile-app' },
];

export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2026 Megan Simpson</Text>
      <Text style={styles.text}>Software Development Student</Text>
      <Text style={styles.text}>Built with React Native, Expo, and the OpenWeatherMap API</Text>

      <View style={styles.links}>
        {LINKS.map((link) => (
          <Pressable
            key={link.url}
            // Opens in an in-app browser so the user stays in the app.
            onPress={() => openBrowserAsync(link.url)}
            accessibilityRole="link"
            hitSlop={8}>
            {({ pressed }) => (
              <Text style={[styles.link, pressed && styles.linkPressed]}>{link.label}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: Spacing.one + 2,
    padding: Spacing.three,
    backgroundColor: Colors.footer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: Radius.small,
  },
  text: {
    color: Colors.footerText,
    fontSize: 13,
    lineHeight: 18,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  link: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  linkPressed: {
    color: Colors.sun,
  },
});
