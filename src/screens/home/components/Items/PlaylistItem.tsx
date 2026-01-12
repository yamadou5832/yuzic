import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Appearance,
    Pressable,
} from 'react-native';
import { useDownload } from '@/contexts/DownloadContext';
import { usePlaying } from '@/contexts/PlayingContext';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/api';
import { QueryKeys } from '@/enums/queryKeys';
import { useSelector } from 'react-redux';
import { selectFavoritesPlaylist } from '@/utils/redux/selectors/selectFavoritesPlaylist';
import { MediaImage } from '@/components/MediaImage';
import { CoverSource, Playlist } from '@/types';
import { FAVORITES_ID } from '@/constants/favorites';
import ContextMenuModal, {
    ContextMenuAction,
} from '@/components/ContextMenuModal';

interface ItemProps {
    id: string;
    title: string;
    subtext: string;
    cover: CoverSource;
    isGridView: boolean;
    gridWidth: number;
}

const PlaylistItem: React.FC<ItemProps> = ({
    id,
    title,
    subtext,
    cover,
    isGridView,
    gridWidth,
}) => {
    const {
        downloadPlaylistById,
        isPlaylistDownloaded,
        isDownloadingPlaylist,
    } = useDownload();

    const isDarkMode = Appearance.getColorScheme() === 'dark';
    const navigation = useNavigation<any>();
    const queryClient = useQueryClient();
    const api = useApi();
    const { playSongInCollection } = usePlaying();

    const favorites = useSelector(selectFavoritesPlaylist);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isDownloaded = isPlaylistDownloaded(id);
    const isDownloading = isDownloadingPlaylist(id);

    const handleNavigation = useCallback(() => {
        navigation.navigate('playlistView', { id });
    }, [navigation, id]);

    const handlePlay = useCallback(
        async (shuffle: boolean) => {
            let playlist: Playlist | null = null;

            if (id === FAVORITES_ID) {
                if (!favorites || !favorites.songs?.length) return;

                playlist = {
                    id: FAVORITES_ID,
                    title: favorites.title ?? 'Favorites',
                    cover: { kind: "special", name: "heart"},
                    subtext: 'Playlist',
                    songs: favorites.songs
                };
            } else {
                playlist = await queryClient.fetchQuery({
                    queryKey: [QueryKeys.Playlist, id],
                    queryFn: () => api.playlists.get(id),
                    staleTime: 2 * 60 * 1000,
                });
            }

            if (!playlist || !playlist.songs.length) return;

            playSongInCollection(playlist.songs[0], playlist, shuffle);
        },
        [id, favorites, api, queryClient, playSongInCollection]
    );

    const handleDownload = useCallback(async () => {
        if (isDownloaded || isDownloading || isLoading) return;
        setIsLoading(true);
        try {
            await downloadPlaylistById(id);
        } finally {
            setIsLoading(false);
        }
    }, [id, isDownloaded, isDownloading, isLoading, downloadPlaylistById]);

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
                label: 'Go to Playlist',
                icon: 'list',
                dividerBefore: true,
                onPress: handleNavigation,
            },
            {
                id: 'download',
                label: isDownloading
                    ? 'Downloading…'
                    : isDownloaded
                        ? 'Downloaded'
                        : 'Download',
                icon: isDownloaded ? 'checkmark-circle' : 'arrow-down-circle',
                disabled: isDownloaded || isDownloading,
                onPress: handleDownload,
            },
        ],
        [
            handlePlay,
            handleNavigation,
            handleDownload,
            isDownloaded,
            isDownloading,
        ]
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
                        {title}
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

export default PlaylistItem;

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