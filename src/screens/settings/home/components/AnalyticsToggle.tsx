import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Appearance,
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';

export const AnalyticsToggle: React.FC = () => {
  const { analyticsEnabled, setAnalyticsEnabled, themeColor } = useSettings();
  const isDark = Appearance.getColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.text}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Anonymous analytics
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Helps improve the app
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setAnalyticsEnabled(!analyticsEnabled)}
        style={[
          styles.switch,
          {
            backgroundColor: analyticsEnabled
              ? themeColor
              : isDark
              ? '#333'
              : '#ddd',
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            analyticsEnabled && styles.thumbActive,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },

  text: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  titleDark: {
    color: '#aaa',
  },
  subtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  subtitleDark: {
    color: '#888',
  },

  switch: {
    width: 44,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#fff',
    transform: [{ translateX: 2 }],
  },
  thumbActive: {
    transform: [{ translateX: 20 }],
  },
});