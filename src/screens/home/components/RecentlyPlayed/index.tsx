import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import {
  selectAlbumLastPlayedAt,
  selectArtistLastPlayedAt,
} from '@/utils/redux/selectors/statsSelectors';
import { useAlbums } from '@/hooks/albums';
import { useArtists } from '@/hooks/artists';
import { useTheme } from '@/hooks/useTheme';
import AlbumItem from '../Items/AlbumItem';
import ArtistItem from '../Items/ArtistItem';

const FLASHLIST_PADDING = 16; // LibraryContent contentContainerStyle paddingHorizontal: 8
const CONTAINER_PADDING = 16; // RecentlyPlayed paddingHorizontal: 8
const GAP = 8;
const ITEM_MARGIN = 4; // AlbumItem/ArtistItem have marginHorizontal: 4

type FilterValue = 'all' | 'albums' | 'artists' | 'playlists';

type Props = {
  activeFilter: FilterValue;
};

export default function RecentlyPlayed({ activeFilter }: Props) {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const availableWidth = width - FLASHLIST_PADDING - CONTAINER_PADDING - GAP;
  const slotWidth = availableWidth / 2;
  const gridWidth = slotWidth - ITEM_MARGIN * 2; // account for item margins
  const albumLastPlayedAt = useSelector(selectAlbumLastPlayedAt);
  const artistLastPlayedAt = useSelector(selectArtistLastPlayedAt);
  const { albums } = useAlbums();
  const { artists } = useArtists();

  const recentlyPlayed = useMemo(() => {
    if (activeFilter === 'playlists') return []; // no playlist playback tracking

    const entries: { id: string; timestamp: number; type: 'Album' | 'Artist' }[] = [];

    if (activeFilter === 'all' || activeFilter === 'albums') {
      Object.entries(albumLastPlayedAt).forEach(([id, timestamp]) => {
        if (timestamp > 0) entries.push({ id, timestamp, type: 'Album' });
      });
    }
    if (activeFilter === 'all' || activeFilter === 'artists') {
      Object.entries(artistLastPlayedAt).forEach(([id, timestamp]) => {
        if (timestamp > 0) entries.push({ id, timestamp, type: 'Artist' });
      });
    }

    entries.sort((a, b) => b.timestamp - a.timestamp);
    return entries.slice(0, 2);
  }, [albumLastPlayedAt, artistLastPlayedAt, activeFilter]);

  const itemsToRender = useMemo(() => {
    return recentlyPlayed
      .map((entry) => {
        if (entry.type === 'Album') {
          const album = albums.find((a) => a.id === entry.id);
          if (!album) return null;
          return {
            type: 'Album' as const,
            id: album.id,
            title: album.title,
            subtext: album.subtext,
            cover: album.cover,
          };
        }
        const artist = artists.find((a) => a.id === entry.id);
        if (!artist) return null;
        return {
          type: 'Artist' as const,
          id: artist.id,
          name: artist.name,
          subtext: artist.subtext,
          cover: artist.cover,
        };
      })
      .filter(Boolean);
  }, [recentlyPlayed, albums, artists]);

  if (itemsToRender.length === 0) return null;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        Recently played
      </Text>
      <View style={styles.row}>
        {itemsToRender.map((item) =>
          item.type === 'Album' ? (
            <View key={`album-${item.id}`} style={[styles.item, { width: slotWidth }]}>
              <AlbumItem
                id={item.id}
                title={item.title}
                subtext={item.subtext}
                cover={item.cover}
                isGridView
                gridWidth={gridWidth}
              />
            </View>
          ) : (
            <View key={`artist-${item.id}`} style={[styles.item, { width: slotWidth }]}>
              <ArtistItem
                id={item.id}
                name={item.name}
                subtext={item.subtext}
                cover={item.cover}
                isGridView
                gridWidth={gridWidth}
              />
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D1D6',
  },
  containerDark: {
    borderBottomColor: '#1C1C1E',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleDark: {
    color: '#888',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    minWidth: 0,
  },
});
