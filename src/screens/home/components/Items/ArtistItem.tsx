import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Appearance,
  Pressable,
} from 'react-native';
import { usePlaying } from '@/contexts/PlayingContext';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/api';
import { Song, CoverSource } from '@/types';
import { QueryKeys } from '@/enums/queryKeys';
import { MediaImage } from '@/components/MediaImage';
import ContextMenuModal, {
  ContextMenuAction,
} from '@/components/ContextMenuModal';
import { Ionicons } from '@expo/vector-icons';

interface ItemProps {
  id: string;
  name: string;
  subtext: string;
  cover: CoverSource;
  isGridView: boolean;
  gridWidth: number;
}

const ArtistItem: React.FC<ItemProps> = ({
  id,
  name,
  subtext,
  cover,
  isGridView,
  gridWidth,
}) => {
  const isDarkMode = Appearance.getColorScheme() === 'dark';
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const api = useApi();
  const { playSongInCollection } = usePlaying();

  const [menuVisible, setMenuVisible] = useState(false);

  const handleNavigation = useCallback(() => {
    navigation.navigate('artistView', { id });
  }, [navigation, id]);

  const handlePlay = useCallback(
    async (shuffle: boolean) => {
      const artist = await queryClient.fetchQuery({
        queryKey: [QueryKeys.Artist, id],
        queryFn: () => api.artists.get(id),
        staleTime: 10 * 60 * 1000,
      });

      if (!artist) return;

      const albumIds = artist.ownedAlbums.map(a => a.id);
      if (!albumIds.length) return;

      const albums = await Promise.all(
        albumIds.map(albumId =>
          queryClient.fetchQuery({
            queryKey: [QueryKeys.Album, albumId],
            queryFn: () => api.albums.get(albumId),
            staleTime: 5 * 60 * 1000,
          })
        )
      );

      const songs: Song[] = albums.flatMap(a => a?.songs ?? []);
      if (!songs.length) return;

      playSongInCollection(
        songs[0],
        {
          id: artist.id,
          title: artist.name,
          artist,
          cover: artist.cover,
          subtext: 'Artist',
          userPlayCount: 0,
          songs,
        },
        shuffle
      );
    },
    [id, api, queryClient, playSongInCollection]
  );

  const menuActions: ContextMenuAction[] = useMemo(
    () => [
      {
        id: 'play',
        label: 'Play',
        icon: 'play',
        primary: true,
        onPress: () => handlePlay(false),
      },
      {
        id: 'shuffle',
        label: 'Shuffle',
        icon: 'shuffle',
        onPress: () => handlePlay(true),
      },
      {
        id: 'navigate',
        label: 'Go to Artist',
        icon: 'person',
        dividerBefore: true,
        onPress: handleNavigation,
      },
    ],
    [handlePlay, handleNavigation]
  );

  return (
    <>
      <Pressable
        onPress={handleNavigation}
        onLongPress={() => setMenuVisible(true)}
        delayLongPress={300}
        style={({ pressed }) => [
          isGridView
            ? [styles.gridItemContainer, { width: gridWidth }]
            : styles.itemContainer,
          pressed && styles.pressed,
        ]}
      >
        <MediaImage
          cover={cover}
          size={isGridView ? 'grid' : 'thumb'}
          style={
            isGridView
              ? { width: gridWidth, aspectRatio: 1, borderRadius: 8 }
              : { width: 50, height: 50, borderRadius: 4, marginRight: 12 }
          }
        />

        <View style={isGridView ? styles.gridTextContainer : styles.textContainer}>
          <Text
            style={[styles.title, isDarkMode && styles.titleDark]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={[styles.subtext, isDarkMode && styles.subtextDark]}
            numberOfLines={1}
          >
            {subtext}
          </Text>
        </View>
      </Pressable>

      <ContextMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        actions={menuActions}
      />
    </>
  );
};

export default ArtistItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  gridItemContainer: {
    marginVertical: 8,
    marginHorizontal: 8,
    alignItems: 'flex-start',
    borderRadius: 14,
  },
  gridTextContainer: {
    marginTop: 4,
    width: '100%',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  titleDark: {
    color: '#e6e6e6',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
  subtextDark: {
    color: '#aaa',
  },
  pressed: {
    opacity: 0.9,
  },
});