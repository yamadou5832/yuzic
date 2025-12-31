import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Appearance,
} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';

export const AiButtonToggle: React.FC = () => {
  const { aiButtonEnabled, setAiButtonEnabled, themeColor } = useSettings();
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  return (
    <View style={[styles.section, isDarkMode && styles.sectionDark]}>
      <View style={styles.row}>
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          Text-to-Music button
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAiButtonEnabled(!aiButtonEnabled)}
          style={[
            styles.switch,
            {
              backgroundColor: aiButtonEnabled
                ? themeColor
                : isDarkMode
                ? '#333'
                : '#ddd',
            },
          ]}
        >
          <View
            style={[
              styles.thumb,
              {
                backgroundColor: '#fff',
                transform: [
                  { translateX: aiButtonEnabled ? 18 : 2 },
                ],
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionDark: {
    backgroundColor: '#111',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
    paddingRight: 12,
  },
  labelDark: {
    color: '#aaa',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginLeft: 2,
    elevation: 2,
  },
});