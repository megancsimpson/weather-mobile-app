import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type StatusMessageProps = {
  message: string;
  variant?: 'info' | 'loading' | 'error';
};

/** A dashed panel used for empty, loading, and error states. */
export function StatusMessage({ message, variant = 'info' }: StatusMessageProps) {
  const isError = variant === 'error';

  return (
    <View
      style={[styles.panel, isError && styles.panelError]}
      // Read the panel as one element, so screen readers announce errors as an alert.
      accessible
      accessibilityRole={isError ? 'alert' : 'text'}
      accessibilityLiveRegion="polite">
      {variant === 'loading' && <ActivityIndicator color={Colors.accent} />}
      <Text style={[styles.message, isError && styles.messageError]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    backgroundColor: Colors.panel,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#b7d7e8',
    borderRadius: Radius.small,
  },
  panelError: {
    backgroundColor: Colors.errorBackground,
    borderColor: Colors.errorBorder,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  messageError: {
    color: Colors.error,
  },
});
