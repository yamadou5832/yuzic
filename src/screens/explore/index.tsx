import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { useTheme } from '@/hooks/useTheme'
import MediaTile from './components/MediaTile'
import LoaderCard from './components/LoaderCard'
import {
  ExternalArtistBase,
  ExternalAlbumBase,
} from '@/types'
import {
  selectExploreArtists,
  selectExploreAlbums,
} from '@/utils/redux/selectors/exploreSelectors'

const H_PADDING = 16
const VISIBLE_ITEMS = 2.5
const ARTIST_TARGET = 12
const ALBUM_TARGET = 12

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
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
  const navigation = useNavigation()

  const artistPool = useSelector(selectExploreArtists)
  const albumPool = useSelector(selectExploreAlbums)

  const [visibleArtists, setVisibleArtists] =
    useState<ExternalArtistBase[]>([])
  const [visibleAlbums, setVisibleAlbums] =
    useState<ExternalAlbumBase[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const takeSnapshot = useCallback(() => {
    setVisibleArtists(
      shuffle(artistPool).slice(0, ARTIST_TARGET)
    )
    setVisibleAlbums(
      shuffle(albumPool).slice(0, ALBUM_TARGET)
    )
  }, [artistPool, albumPool])

  if (!initialized && artistPool.length && albumPool.length) {
    takeSnapshot()
    setInitialized(true)
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    takeSnapshot()
    setRefreshing(false)
  }, [takeSnapshot])

  const screenWidth = Dimensions.get('window').width
  const gridGap = 12

  const gridItemWidth =
    (screenWidth - H_PADDING * 2 - gridGap * 2) /
    VISIBLE_ITEMS

  const tileHeight =
    gridItemWidth + 8 + 14 + 4 + 12

  const artistsReady =
    visibleArtists.length >= ARTIST_TARGET
  const albumsReady =
    visibleAlbums.length >= ALBUM_TARGET

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
        {!artistsReady ? (
          <View style={styles.rowLoaderWrapper}>
            <LoaderCard
              width={screenWidth - H_PADDING * 2}
              height={tileHeight}
              radius={14}
            />
          </View>
        ) : (
          <FlashList
            horizontal
            data={visibleArtists}
            keyExtractor={item => item.id}
            estimatedItemSize={gridItemWidth}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: H_PADDING,
            }}
            ItemSeparatorComponent={() => (
              <View style={{ width: gridGap }} />
            )}
            renderItem={({ item }) => (
              <MediaTile
                cover={item.cover}
                title={item.name}
                subtitle={item.subtext}
                size={gridItemWidth}
                radius={gridItemWidth / 2}
                onPress={() =>
                  navigation.navigate('artistView', {
                    id: item.id,
                  })
                }
              />
            )}
          />
        )}
      </Section>

      <Section
        title="Albums You Might Like"
        isDarkMode={isDarkMode}
      >
        {!albumsReady ? (
          <View style={styles.rowLoaderWrapper}>
            <LoaderCard
              width={screenWidth - H_PADDING * 2}
              height={tileHeight}
              radius={14}
            />
          </View>
        ) : (
          <FlashList
            horizontal
            data={visibleAlbums}
            keyExtractor={item => item.id}
            estimatedItemSize={gridItemWidth}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: H_PADDING,
            }}
            ItemSeparatorComponent={() => (
              <View style={{ width: gridGap }} />
            )}
            renderItem={({ item }) => (
              <MediaTile
                cover={item.cover}
                title={item.title}
                subtitle={item.subtext}
                size={gridItemWidth}
                radius={14}
                onPress={() =>
                  navigation.navigate(
                    'externalAlbumView',
                    {
                      albumId: item.id,
                    }
                  )
                }
              />
            )}
          />
        )}
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
  rowLoaderWrapper: {
    paddingHorizontal: H_PADDING,
  },
})