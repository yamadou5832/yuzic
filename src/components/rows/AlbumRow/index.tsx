import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import AlbumOptions from '@/components/options/AlbumOptions';
import ExternalAlbumOptions from '@/components/options/ExternalAlbumOptions';
import { selectThemeColor } from '@/utils/redux/selectors/settingsSelectors';
import { MediaImage } from '@/components/MediaImage';
import { useTheme } from '@/hooks/useTheme';
import { AlbumBase, ExternalAlbumBase } from '@/types';

type AlbumRowItem =
  | (AlbumBase & { source: 'owned' })
  | (ExternalAlbumBase & { source: 'external' });

type Props = {
  album: AlbumRowItem;
  artistName: string;
  onPress?: (album: AlbumRowItem) => void;
};

const AlbumRow: React.FC<Props> = ({ album, artistName, onPress }) => {
  const { isDarkMode } = useTheme();
  const themeColor = useSelector(selectThemeColor);

  const isExternal = album.source === 'external';

  return (
    <View style={styles.wrapper}>
      <View style={styles.albumItem}>
        <TouchableOpacity
          style={styles.albumContent}
          disabled={isExternal}
          onPress={() => onPress?.(album)}
        >
          <MediaImage
            cover={album.cover}
            size="grid"
            style={styles.cover}
          />

          <View style={styles.albumTextContainer}>
            <Text
              numberOfLines={1}
              style={[
                styles.albumTitle,
                isDarkMode && styles.albumTitleDark,
              ]}
            >
              {album.title}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.albumSubtext,
                isDarkMode && styles.albumSubtextDark,
              ]}
            >
              {album.subtext}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.optionsContainer}>
          {!isExternal && (
            <MaterialIcons
              name="check-circle"
              size={20}
              color={themeColor}
              style={{ marginRight: 8 }}
            />
          )}

          {isExternal ? (
            <ExternalAlbumOptions
              selectedAlbumTitle={album.title}
              selectedAlbumArtist={artistName}
            />
          ) : (
            <AlbumOptions selectedAlbumId={album.id} />
          )}
        </View>
      </View>
    </View>
  );
};

export default AlbumRow;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 6,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  albumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  albumTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  albumTitleDark: {
    color: '#fff',
  },
  albumSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  albumSubtextDark: {
    color: '#aaa',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});