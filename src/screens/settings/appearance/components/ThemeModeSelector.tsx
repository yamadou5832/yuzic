import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Appearance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectThemeColor,
  selectThemeMode,
} from '@/utils/redux/selectors/settingsSelectors';
import { setThemeMode, ThemeMode } from '@/utils/redux/slices/settingsSlice';

export const ThemeModeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const themeColor = useSelector(selectThemeColor);
  const themeMode = useSelector(selectThemeMode) as ThemeMode;
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const options: {
    id: ThemeMode;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { id: 'light', label: 'Light', icon: 'sunny' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'System', icon: 'phone-portrait' },
  ];

  return (
    <View style={[styles.section, isDarkMode && styles.sectionDark]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          Theme
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
          Choose how the app looks
        </Text>
      </View>

      <View style={styles.row}>
        {options.map(option => {
          const active = themeMode === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => dispatch(setThemeMode(option.id))}
              style={[
                styles.modeButton,
                {
                  backgroundColor: active
                    ? themeColor
                    : isDarkMode
                    ? '#222'
                    : '#eee',
                  borderColor: isDarkMode ? '#444' : '#ccc',
                },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={active ? '#fff' : isDarkMode ? '#ccc' : '#000'}
              />
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: active ? '#fff' : isDarkMode ? '#ccc' : '#000',
                    fontWeight: active ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  sectionDark: {
    backgroundColor: '#111',
  },

  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  titleDark: {
    color: '#f2f2f2',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#555',
  },
  subtitleDark: {
    color: '#aaa',
  },

  row: {
    flexDirection: 'row',
    marginTop: 8,
  },

  modeButton: {
    width: 96,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeLabel: {
    marginTop: 6,
    fontSize: 12,
  },
});