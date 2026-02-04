import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useArtist } from '@/hooks/artists';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

import ArtistContent from './components/Content';
import LoadingArtistContent from './components/Content/Loading';
import { track } from '@/utils/analytics/amplitude';

const ArtistScreen: React.FC = () => {
  const route = useRoute<any>();
  const { id } = route.params;

  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { artist, isLoading } = useArtist(id);

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen(isDarkMode)}>
        <LoadingArtistContent />
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.screen(isDarkMode)}>
        <Text style={styles.error(isDarkMode)}>
          {t('media.artistNotFound')}
        </Text>
      </SafeAreaView>
    );
  }

  track("artist screen", { name: artist.name })

  return (
    <SafeAreaView edges={['top']} style={styles.screen(isDarkMode)}>
      <ArtistContent artist={artist} />
    </SafeAreaView>
  );
};

export default ArtistScreen;

const styles = StyleSheet.create({
  screen: (isDark: boolean) => ({
    flex: 1,
    backgroundColor: isDark ? '#000' : '#fff',
  }),
  error: (isDark: boolean) => ({
    color: isDark ? '#fff' : '#000',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  }),
});