import { Platform } from 'react-native';

// Colours carried over from the web version of the app.
export const Colors = {
  sky: '#a8dbf2',
  skyDeep: '#4a9cd0',
  sun: '#ffe58b',
  card: 'rgba(255, 255, 255, 0.9)',
  panel: '#edf7fb',
  panelBorder: '#c8e2ef',
  inputBorder: '#b9d4e5',
  heading: '#12314a',
  text: '#173d59',
  textMuted: '#527083',
  textSubtle: '#628093',
  placeholder: '#829cac',
  accent: '#167dbc',
  accentLight: '#287db3',
  accentPressed: '#0d669e',
  toggleBorder: '#9fc9df',
  error: '#a24d40',
  errorBackground: '#fff2ef',
  errorBorder: '#e8beb5',
  footer: 'rgba(16, 93, 143, 0.55)',
  footerText: '#eaf8ff',
  white: '#ffffff',
} as const;

export const Fonts = {
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
};

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
} as const;

export const Radius = {
  small: 6,
  large: 12,
} as const;

export const MaxContentWidth = 600;
