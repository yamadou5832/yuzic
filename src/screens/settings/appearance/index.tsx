import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Appearance,
  Platform,
} from 'react-native';
import Header from '../components/Header';
import { ThemeColor } from './components/ThemeColor';
import { Columns } from './components/Columns';
import { ThemeModeSelector } from './components/ThemeModeSelector';
import { useTheme } from '@/hooks/useTheme';
import { PlayingBarActionSelector } from './components/PlayingBarActionSelector';
import { LanguageSelector } from './components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const AppearanceSettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode && styles.containerDark,
        Platform.OS === 'android' && { paddingTop: 24 },
      ]}
    >
      <Header title={t('settings.appearance.title')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LanguageSelector />
        <ThemeModeSelector />
        <ThemeColor />
        <PlayingBarActionSelector />
        <Columns />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppearanceSettings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  containerDark: { backgroundColor: '#000' },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
});