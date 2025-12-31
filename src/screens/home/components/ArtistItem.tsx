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
import { usePlaying } from '@/contexts/PlayingContext';
import { useNavigation } from '@react-navigation/native';
import { useLibrary } from '@/contexts/LibraryContext';
import { Song } from '@/types';

interface ItemProps {
    id: string;
    name: string;
    subtext: string;
    cover: string;

    isGridView: boolean;
    isDarkMode: boolean;
    gridWidth: number;
}

const ArtistItem: React.FC<ItemProps> = ({
    id,
    name,
    subtext,
    cover,
    isGridView,
    isDarkMode,
    gridWidth
}) => {

    const navigation = useNavigation();

    const { getArtist, getAlbums } = useLibrary();

    const { playSongInCollection } = usePlaying();

    const handlePlay = useCallback(
        async (shuffle: boolean) => {
            const artist = await getArtist(id);
            if (!artist) return;

            const albumIds = [
                ...artist.ownedAlbums.map(a => a.id)
            ];

            if (albumIds.length === 0) return;

            const albums = await getAlbums(albumIds);

            const songs: Song[] = albums.flatMap(a => a.songs ?? []);
            if (songs.length === 0) return;

            playSongInCollection(
                songs[0],
                {
                    id: artist.id,
                    title: artist.name,
                    artist: {
                        id: artist.id,
                        cover: artist.cover,
                        name: artist.name,
                        subtext: "Artist"
                    },
                    cover: artist.cover,
                    subtext: "Playlist",
                    userPlayCount: 0,
                    songs,
                },
                shuffle
            );
        },
        [id]
    );

    const handleNavigation = () => {
        navigation.navigate('artistView', { id: id });
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
                    {name}
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

    const menuTitle = name || 'Options';

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
                }}
            >
                {content}
            </ContextMenuView>
        );
    }

    return content;
};

export default ArtistItem;

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