import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import type { TemperatureUnit } from '@/utils/format';

type UnitToggleProps = {
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
};

const UNIT_OPTIONS: { value: TemperatureUnit; label: string; accessibilityLabel: string }[] = [
  { value: 'celsius', label: '°C', accessibilityLabel: 'Celsius' },
  { value: 'fahrenheit', label: '°F', accessibilityLabel: 'Fahrenheit' },
];

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup" accessibilityLabel="Temperature unit">
      {UNIT_OPTIONS.map((option, index) => {
        const isSelected = unit === option.value;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              index > 0 && styles.optionDivider,
              isSelected && styles.optionSelected,
            ]}
            onPress={() => onUnitChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.accessibilityLabel}
            accessibilityState={{ checked: isSelected }}
            hitSlop={8}>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.toggleBorder,
    borderRadius: Radius.small,
  },
  option: {
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  optionDivider: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.toggleBorder,
  },
  optionSelected: {
    backgroundColor: Colors.accent,
  },
  optionText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: Colors.white,
  },
});
