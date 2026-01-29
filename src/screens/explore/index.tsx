import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import ArtistsForYouSection from './components/ArtistsForYouSection'
import AlbumsForYouSection from './components/AlbumsForYouSection'
import { useSimilarArtists } from '@/features/explore/hooks/useSimilarArtists'
import { useSimilarArtistAlbums } from '@/features/explore/hooks/useSimilarArtistAlbums'

const H_PADDING = 16

function Section({
  title,
  children,
  isDarkMode,
}: {
  title: string
  children: React.ReactNode
  isDarkMode: boolean
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text
          numberOfLines={1}
          style={[
            styles.sectionTitle,
            isDarkMode && styles.sectionTitleDark,
          ]}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  )
}

export default function Explore() {
  const { isDarkMode } = useTheme()
  const [shuffleKey, setShuffleKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const artists = useSimilarArtists(shuffleKey)
  const albums = useSimilarArtistAlbums(shuffleKey)
  const isFetching = artists.isFetching || albums.isFetching

  useEffect(() => {
    if (!isFetching) setRefreshing(false)
  }, [isFetching])

  const onRefreshStart = useCallback(() => {
    setRefreshing(true)
    setShuffleKey((k) => k + 1)
  }, [])

  return (
    <ScrollView
      style={[
        styles.container,
        isDarkMode && styles.containerDark,
      ]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 150 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefreshStart}
          tintColor={isDarkMode ? '#fff' : '#000'}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Section title="Artists for You" isDarkMode={isDarkMode}>
        <ArtistsForYouSection
          data={artists.data}
          ready={artists.ready}
        />
      </Section>

      <Section title="Albums You Might Like" isDarkMode={isDarkMode}>
        <AlbumsForYouSection
          data={albums.data}
          ready={albums.ready}
        />
      </Section>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  content: {
    paddingTop: 12,
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: H_PADDING,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  sectionTitleDark: {
    color: '#fff',
  },
})