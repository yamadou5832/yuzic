import React, {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { useSelector } from 'react-redux'
import { useTheme } from '@/hooks/useTheme'
import {
  ExternalArtistBase,
  ExternalAlbumBase,
} from '@/types'
import {
  selectSimilarArtists,
} from '@/utils/redux/selectors/exploreSelectors'
import { useAppDispatch } from '@/utils/redux/hooks'
import { clearExploreNewData } from '@/utils/redux/slices/exploreSlice'
import ArtistsForYouSection from './components/ArtistsForYouSection'
import AlbumsForYouSection from './components/AlbumsForYouSection'
import NewAlbumsSection from './components/NewAlbumsSection'
import GenresForYouSection from './components/GenresForYouSection'

const H_PADDING = 16
const ARTIST_TARGET = 12
const ALBUM_TARGET = 12
const GENRE_TARGET = 12

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildAlbumSnapshot(
  entries: { albums: ExternalAlbumBase[] }[],
  target: number
): ExternalAlbumBase[] {
  const result: ExternalAlbumBase[] = []
  const shuffled = shuffle(entries)
  let index = 0

  while (result.length < target) {
    let added = false
    for (const entry of shuffled) {
      if (entry.albums[index]) {
        result.push(entry.albums[index])
        added = true
        if (result.length >= target) return result
      }
    }
    if (!added) break
    index++
  }

  return result
}

function buildNewAlbumSnapshot(
  entries: { albums: ExternalAlbumBase[] }[],
  target: number
): ExternalAlbumBase[] {
  const seen = new Set<string>()
  const all: ExternalAlbumBase[] = []

  for (const entry of entries) {
    for (const album of entry.albums) {
      if (!album.releaseDate) continue
      if (seen.has(album.id)) continue
      seen.add(album.id)
      all.push(album)
    }
  }

  all.sort((a, b) =>
    (b.releaseDate ?? '').localeCompare(
      a.releaseDate ?? ''
    )
  )

  return all.slice(0, target)
}

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
      <Text
        style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark,
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  )
}

export default function Explore() {
  const { isDarkMode } = useTheme()
  const dispatch = useAppDispatch()

  const similarArtists = useSelector(selectSimilarArtists)
  const genres = useSelector(
    (state: any) => state.explore.genres
  )

  const [artistSnapshot, setArtistSnapshot] =
    useState<ExternalArtistBase[]>([])
  const [albumSnapshot, setAlbumSnapshot] =
    useState<ExternalAlbumBase[]>([])
  const [newAlbumSnapshot, setNewAlbumSnapshot] =
    useState<ExternalAlbumBase[]>([])
  const [genreSnapshot, setGenreSnapshot] =
    useState<any[]>([])

  const [initialized, setInitialized] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(clearExploreNewData())
  }, [])

  useEffect(() => {
    if (initialized) return
    if (similarArtists.length < ARTIST_TARGET) return

    setArtistSnapshot(
      shuffle(
        similarArtists.map(e => e.artist)
      ).slice(0, ARTIST_TARGET)
    )

    setAlbumSnapshot(
      buildAlbumSnapshot(
        similarArtists,
        ALBUM_TARGET
      )
    )

    setNewAlbumSnapshot(
      buildNewAlbumSnapshot(
        similarArtists,
        ALBUM_TARGET
      )
    )

    setInitialized(true)
  }, [similarArtists, initialized])

  useEffect(() => {
    if (!genres.length) return

    const readyGenres = genres.filter(
      g => g.albums.length
    )

    if (!readyGenres.length) return

    setGenreSnapshot(
      shuffle(readyGenres).slice(0, GENRE_TARGET)
    )
  }, [genres])

  const onRefresh = useCallback(() => {
    setRefreshing(true)

    setArtistSnapshot(
      shuffle(
        similarArtists.map(e => e.artist)
      ).slice(0, ARTIST_TARGET)
    )

    setAlbumSnapshot(
      buildAlbumSnapshot(
        similarArtists,
        ALBUM_TARGET
      )
    )

    setNewAlbumSnapshot(
      buildNewAlbumSnapshot(
        similarArtists,
        ALBUM_TARGET
      )
    )

    const readyGenres = genres.filter(
      g => g.albums.length
    )

    setGenreSnapshot(
      shuffle(readyGenres).slice(0, GENRE_TARGET)
    )

    setRefreshing(false)
  }, [similarArtists, genres])

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
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#fff' : '#000'}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Section title="Artists for You" isDarkMode={isDarkMode}>
        <ArtistsForYouSection
          data={artistSnapshot}
          ready={artistSnapshot.length >= ARTIST_TARGET}
        />
      </Section>

      <Section title="Genres You Might Like" isDarkMode={isDarkMode}>
        <GenresForYouSection
          data={genreSnapshot}
          ready={genreSnapshot.length >= GENRE_TARGET}
        />
      </Section>

      <Section title="New Albums to Check Out" isDarkMode={isDarkMode}>
        <NewAlbumsSection
          data={newAlbumSnapshot}
          ready={newAlbumSnapshot.length >= ALBUM_TARGET}
        />
      </Section>

      <Section title="Albums You Might Like" isDarkMode={isDarkMode}>
        <AlbumsForYouSection
          data={albumSnapshot}
          ready={albumSnapshot.length >= ALBUM_TARGET}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    paddingHorizontal: H_PADDING,
  },
  sectionTitleDark: {
    color: '#fff',
  },
})