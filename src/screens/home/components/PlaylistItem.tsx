import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { ContextMenuView } from 'react-native-ios-context-menu';
import CoverArt from '@/components/CoverArt';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDownload } from '@/contexts/DownloadContext';
import { usePlaying } from '@/contexts/PlayingContext';
import { useNavigation } from '@react-navigation/native';
import { useLibrary } from '@/contexts/LibraryContext';

interface ItemProps {
    id: string;
    title: string;
    subtext: string;
    cover: string;

    isGridView: boolean;
    isDarkMode: boolean;
    gridWidth: number;
}

const PlaylistItem: React.FC<ItemProps> = ({
    id,
    title,
    subtext,
    cover,
    isGridView,
    isDarkMode,
    gridWidth
}) => {
    const {
        downloadPlaylistById,
        isPlaylistDownloaded,
        isDownloadingPlaylist,
    } = useDownload();

    const navigation = useNavigation();

    const { getPlaylist} = useLibrary();

    const { playSongInCollection } = usePlaying();

    const [isLoading, setIsLoading] = useState(false);

    const isDownloaded = isPlaylistDownloaded(id);
    const isDownloading = isDownloadingPlaylist(id);

    const handlePlay = useCallback(
        async (shuffle: boolean) => {
            const playlist = await getPlaylist(id);
            if (!playlist || playlist.songs.length === 0) return;

            playSongInCollection(playlist.songs[0], playlist, shuffle);
        },
        [id]
    );

    const handleDownload = async () => {
        if (isDownloaded || isDownloading || isLoading) return;
        setIsLoading(true);
        try {
            await downloadPlaylistById(id);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigation = () => {
        navigation.navigate('playlistView', { id: id });
    }

    const coverArt = (
        <CoverArt
            source={cover ?? null}
            size={isGridView ? undefined : 50}
            isGrid={isGridView}
        />
    );

    const content = (
        <TouchableOpacity
            onPress={handleNavigation}
            style={isGridView ? [styles.gridItemContainer, { width: gridWidth }] : styles.itemContainer}
            activeOpacity={0.9}
        >
            {isGridView ? (
                <View style={{ width: '100%' }}>{coverArt}</View>
            ) : (
                coverArt
            )}

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
        </TouchableOpacity>
    );

    const getMenuItems = () => {
        const items: any[] = [];

        items.push({
            actionKey: 'download',
            actionTitle: isDownloading
                ? 'Downloading...'
                : isDownloaded
                    ? 'Downloaded'
                    : 'Download',
            icon: {
                type: 'IMAGE_SYSTEM',
                imageValue: {
                    systemName: isDownloading
                        ? 'hourglass'
                        : isDownloaded
                            ? 'checkmark.circle'
                            : 'arrow.down.circle',
                },
            },
            attributes: isDownloaded || isDownloading ? ['disabled'] : [],
            state: isDownloading || isLoading ? 'on' : 'off',
        });

        items.unshift(
            {
                actionKey: 'play',
                actionTitle: 'Play',
                icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: { systemName: 'play.fill' },
                },
            },
            {
                actionKey: 'shuffle',
                actionTitle: 'Shuffle',
                icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: { systemName: 'shuffle' },
                },
            },
            {
                actionKey: 'go-to',
                actionTitle: 'Go to Playlist',
                icon: {
                    type: 'IMAGE_SYSTEM',
                    imageValue: { systemName: 'music.note.list' },
                },
            },
        );

        return items;
    };

    const menuTitle = title || 'Options';

    if (Platform.OS === 'ios') {
        return (
            <ContextMenuView
                style={{ borderRadius: 8 }}
                previewConfig={{ previewType: 'none' }}
                menuConfig={{
                    menuTitle,
                    menuItems: getMenuItems(),
                }}
                onPressMenuItem={({ nativeEvent }) => {
                    if (nativeEvent.actionKey === 'play') handlePlay(false);
                    if (nativeEvent.actionKey === 'shuffle') handlePlay(true);
                    if (nativeEvent.actionKey === 'go-to') handleNavigation();
                    if (nativeEvent.actionKey === 'download') handleDownload();
                }}
            >
                {content}
            </ContextMenuView>
        );
    }

    return content;
};

export default PlaylistItem;

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    gridItemContainer: {
        marginVertical: 8,
        marginHorizontal: 8,
        alignItems: 'flex-start',
    },
    gridTextContainer: {
        marginTop: 4,
        width: '100%',
    },
    textContainer: {
        flex: 1,
        marginLeft: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
    },
    titleDark: {
        color: '#ccc',
    },
    subtext: {
        fontSize: 14,
        color: '#666',
    },
    subtextDark: {
        color: '#aaa',
    },
});