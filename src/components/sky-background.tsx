import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

/** A cloud built from overlapping rounded shapes, like the CSS clouds in the web version. */
function Cloud({ color, scale = 1 }: { color: string; scale?: number }) {
  return (
    <View style={[styles.cloud, { transform: [{ scale }] }]}>
      <View style={[styles.cloudBase, { backgroundColor: color }]} />
      <View style={[styles.cloudPuffLarge, { backgroundColor: color }]} />
      <View style={[styles.cloudPuffSmall, { backgroundColor: color }]} />
    </View>
  );
}

/** Decorative sun and clouds drawn behind the scrolling content. */
export function SkyBackground() {
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <View style={styles.lowerSky} />
      <View style={styles.sun} />
      <View style={styles.cloudTop}>
        <Cloud color="rgba(255, 255, 255, 0.45)" scale={0.7} />
      </View>
      <View style={styles.cloudBottom}>
        <Cloud color="rgba(255, 255, 255, 0.3)" scale={0.8} />
      </View>
    </View>
  );
}

/** The small sun-behind-cloud badge at the top of the card. */
export function WeatherBadge() {
  return (
    <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.badgeSun} />
      <View style={styles.badgeCloud}>
        <Cloud color="#54a9dc" scale={0.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lowerSky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
    backgroundColor: Colors.skyDeep,
    opacity: 0.35,
  },
  sun: {
    position: 'absolute',
    top: 40,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.sun,
    borderWidth: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cloudTop: {
    position: 'absolute',
    top: 120,
    left: -50,
  },
  cloudBottom: {
    position: 'absolute',
    bottom: 80,
    right: -30,
  },
  cloud: {
    width: 150,
    height: 70,
  },
  cloudBase: {
    position: 'absolute',
    bottom: 0,
    width: 150,
    height: 42,
    borderRadius: 21,
  },
  cloudPuffLarge: {
    position: 'absolute',
    bottom: 0,
    left: 25,
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  cloudPuffSmall: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  badge: {
    width: 90,
    height: 68,
    alignSelf: 'center',
    marginBottom: 16,
  },
  badgeSun: {
    position: 'absolute',
    top: 0,
    right: 7,
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#ffc943',
    borderWidth: 6,
    borderColor: '#fff1bd',
  },
  badgeCloud: {
    position: 'absolute',
    bottom: -17,
    left: -34,
  },
});
