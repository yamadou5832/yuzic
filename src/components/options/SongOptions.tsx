import React, { forwardRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { Song } from '@/types';
import { usePlaying } from '@/contexts/PlayingContext';
import { MediaImage } from '@/components/MediaImage';
import { toast } from '@backpackapp-io/react-native-toast';
import { useTheme } from '@/hooks/useTheme';
import { ListEnd, ListStart, PlusCircle, Radio } from 'lucide-react-native';
import { useStarredSongs, useStarSong, useUnstarSong } from '@/hooks/starred';

type SongOptionsProps = {
  selectedSong: Song;
  onAddToPlaylist: () => void;
};

function formatDuration(seconds: string): string {
  const n = parseInt(seconds, 10);
  if (isNaN(n)) return seconds;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(value: string): string {
  if (!value) return value;
  if (/^\d{4}$/.test(value.trim())) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const year = d.getFullYear();
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}, ${year}`;
}

const SongOptions = forwardRef<
  React.ElementRef<typeof BottomSheetModal>,
  SongOptionsProps
>(({ selectedSong, onAddToPlaylist }, ref) => {
    const { isDarkMode } = useTheme();
    const themeStyles = isDarkMode ? stylesDark : stylesLight;

    const snapPoints = useMemo(() => ['55%', '90%'], []);

    const { currentSong, addToQueue, playNext, playSimilar } = usePlaying();

    const { songs: starredSongs } = useStarredSongs();
    const starSong = useStarSong();
    const unstarSong = useUnstarSong();

    const isStarred = starredSongs.some(
      s => s.id === selectedSong.id
    );

    const close = () => {
      (ref as any)?.current?.dismiss();
    };

    const toggleFavorite = async () => {
      try {
        if (isStarred) {
          await unstarSong.mutateAsync(selectedSong.id);
          toast.success(`${selectedSong.title} removed from favorites.`);
        } else {
          await starSong.mutateAsync(selectedSong.id);
          toast.success(`${selectedSong.title} added to favorites.`);
        }
      } catch {
        toast.error('Failed to update favorites.');
      } finally {
        close();
      }
    };

    const handleAddToEndQueue = async () => {
      if (!currentSong) {
        toast.error('Nothing is currently playing.');
        return;
      }

      if (selectedSong.id === currentSong.id) {
        toast.error(`${selectedSong.title} is already playing.`);
        return;
      }

      try {
        await addToQueue(selectedSong);
        toast.success(`${selectedSong.title} added to queue.`);
      } catch {
        toast.error('Failed to add to queue.');
      } finally {
        close();
      }
    };

    const handleAddToQueue = async () => {
      if (!currentSong) {
        toast.error('Nothing is currently playing.');
        return;
      }

      if (selectedSong.id === currentSong.id) {
        toast.error(`${selectedSong.title} is already playing.`);
        return;
      }

      try {
        await playNext(selectedSong);
        toast.success(`${selectedSong.title} will play next.`);
      } catch {
        toast.error('Failed to queue song next.');
      } finally {
        close();
      }
    };

    const handleAddToPlaylist = () => {
      close();
      requestAnimationFrame(onAddToPlaylist);
    };

    const handleInstantMix = async () => {
      try {
        await playSimilar(selectedSong);
      } catch {
        toast.error('Failed to start instant mix');
      } finally {
        close();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        handleIndicatorStyle={{
          backgroundColor: isDarkMode ? '#555' : '#ccc',
        }}
        backgroundStyle={[
          styles.sheetBackground,
          themeStyles.sheetBackground,
        ]}
        stackBehavior='push'
      >
        <BottomSheetScrollView
          style={themeStyles.sheetBackground}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.header}>
            <MediaImage
              cover={selectedSong.cover}
              size="grid"
              style={styles.cover}
            />
            <View style={styles.headerText}>
              <Text
                style={[styles.title, themeStyles.title]}
                numberOfLines={1}
              >
                {selectedSong.title}
              </Text>
              <Text
                style={[styles.artist, themeStyles.artist]}
                numberOfLines={1}
              >
                {selectedSong.artist || 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.option}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isStarred ? 'heart' : 'heart-outline'}
              size={26}
              color="#ff3b30"
            />
            <Text
              style={[styles.optionText, themeStyles.optionText]}
            >
              {isStarred ? 'Unfavorite' : 'Favorite'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={handleAddToQueue}
          >
            <ListStart
              size={26}
              color={themeStyles.icon.color}
            />
            <Text
              style={[styles.optionText, themeStyles.optionText]}
            >
              Add to Queue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={handleAddToEndQueue}
          >
            <ListEnd
              size={26}
              color={themeStyles.icon.color}
            />
            <Text
              style={[styles.optionText, themeStyles.optionText]}
            >
              Add to End
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={handleAddToPlaylist}
          >
            <PlusCircle
              size={26}
              color={themeStyles.icon.color}
            />
            <Text
              style={[styles.optionText, themeStyles.optionText]}
            >
              Add to Playlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={handleInstantMix}
          >
            <Radio
              size={26}
              color={themeStyles.icon.color}
            />
            <Text
              style={[styles.optionText, themeStyles.optionText]}
            >
              Instant Mix
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={[styles.sectionLabel, themeStyles.artist]}>Media</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, themeStyles.artist]}>Duration</Text>
            <Text style={[styles.infoValue, themeStyles.title]}>
              {formatDuration(selectedSong.duration)}
            </Text>
          </View>
          {selectedSong.bitrate != null && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, themeStyles.artist]}>Bitrate</Text>
              <Text style={[styles.infoValue, themeStyles.title]}>{selectedSong.bitrate} kbps</Text>
            </View>
          )}
          {selectedSong.sampleRate != null && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, themeStyles.artist]}>Sample rate</Text>
              <Text style={[styles.infoValue, themeStyles.title]}>{selectedSong.sampleRate} Hz</Text>
            </View>
          )}
          {selectedSong.bitsPerSample != null && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, themeStyles.artist]}>Bits per sample</Text>
              <Text style={[styles.infoValue, themeStyles.title]}>{selectedSong.bitsPerSample}</Text>
            </View>
          )}
          {selectedSong.mimeType && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, themeStyles.artist]}>Format</Text>
              <Text style={[styles.infoValue, themeStyles.title]} numberOfLines={1}>{selectedSong.mimeType}</Text>
            </View>
          )}

          {(selectedSong.disc != null || selectedSong.trackNumber != null) && (
            <>
              <Text style={[styles.sectionLabel, themeStyles.artist, styles.sectionLabelSpaced]}>Track</Text>
              {selectedSong.disc != null && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>Disc</Text>
                  <Text style={[styles.infoValue, themeStyles.title]}>{selectedSong.disc}</Text>
                </View>
              )}
              {selectedSong.trackNumber != null && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>Track</Text>
                  <Text style={[styles.infoValue, themeStyles.title]}>{selectedSong.trackNumber}</Text>
                </View>
              )}
            </>
          )}

          {(selectedSong.dateReleased || selectedSong.dateAdded) && (
            <>
              <Text style={[styles.sectionLabel, themeStyles.artist, styles.sectionLabelSpaced]}>Dates</Text>
              {selectedSong.dateReleased && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>Released</Text>
                  <Text style={[styles.infoValue, themeStyles.title]}>{formatDate(selectedSong.dateReleased)}</Text>
                </View>
              )}
              {selectedSong.dateAdded && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>Date added</Text>
                  <Text style={[styles.infoValue, themeStyles.title]} numberOfLines={1}>{formatDate(selectedSong.dateAdded)}</Text>
                </View>
              )}
            </>
          )}

          {(selectedSong.bpm != null || selectedSong.genres?.length || selectedSong.filePath) && (
            <>
              <Text style={[styles.sectionLabel, themeStyles.artist, styles.sectionLabelSpaced]}>Other</Text>
              {selectedSong.bpm != null && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>BPM</Text>
                  <Text style={[styles.infoValue, themeStyles.title]}>{selectedSong.bpm}</Text>
                </View>
              )}
              {selectedSong.genres?.length ? (
                <View style={styles.genreRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>Genres</Text>
                  <View style={styles.genreList}>
                    {selectedSong.genres.map((g, i) => (
                      <View key={`${g}-${i}`} style={[styles.genreChip, themeStyles.genreChip]}>
                        <Text style={[styles.genreChipText, themeStyles.title]}>{g}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
              {selectedSong.filePath ? (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, themeStyles.artist]}>File path</Text>
                  <Text style={[styles.infoValue, themeStyles.title]} numberOfLines={2}>
                    {selectedSong.filePath}
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default SongOptions;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#444',
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabelSpaced: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '500', marginLeft: 12, flex: 1, textAlign: 'right' },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  genreList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 12,
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
  },
  genreChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

const stylesLight = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#F2F2F7',
  },
  title: {
    color: '#000',
  },
  artist: {
    color: '#666',
  },
  optionText: {
    color: '#000',
  },
  icon: {
    color: '#000',
  },
  genreChip: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});

const stylesDark = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#222',
  },
  title: {
    color: '#fff',
  },
  artist: {
    color: '#aaa',
  },
  optionText: {
    color: '#fff',
  },
  icon: {
    color: '#999',
  },
  genreChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});