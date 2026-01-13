import React, {
  memo,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LyricsResult } from "@/api/types";

type Props = {
  lyrics: LyricsResult;
  width: number;
};

const BOTTOM_CONTROLS_HEIGHT = 120;

const Lyrics: React.FC<Props> = ({ lyrics, width }) => {
  const { position } = useProgress(250);
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<ScrollView>(null);

  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeLineY, setActiveLineY] = useState(0);
  const [activeLineHeight, setActiveLineHeight] = useState(0);

  const lines = useMemo(() => lyrics.lines, [lyrics]);

  const currentLineIndex = useMemo(() => {
    const timeMs = position * 1000;

    for (let i = lines.length - 1; i >= 0; i--) {
      if (timeMs >= lines[i].startMs) {
        return i;
      }
    }
    return 0;
  }, [position, lines]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setViewportHeight(e.nativeEvent.layout.height);
  };

  const onActiveLineLayout = (e: LayoutChangeEvent) => {
    setActiveLineY(e.nativeEvent.layout.y);
    setActiveLineHeight(e.nativeEvent.layout.height);
  };

  useEffect(() => {
    if (!scrollRef.current || viewportHeight === 0) return;

    const usableHeight =
      viewportHeight - BOTTOM_CONTROLS_HEIGHT;

    const visualCenterY = usableHeight / 2;

    const targetScrollY =
      activeLineY +
      activeLineHeight / 2 -
      visualCenterY;

    scrollRef.current.scrollTo({
      y: Math.max(0, targetScrollY),
      animated: true,
    });
  }, [activeLineY, activeLineHeight, viewportHeight]);

  return (
    <View
      style={[
        styles.container,
        {
          width,
          paddingTop: insets.top + 12,
        },
      ]}
      onLayout={onContainerLayout}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_CONTROLS_HEIGHT + insets.bottom },
        ]}
      >
        {lines.map((line, index) => {
          const isActive = index === currentLineIndex;

          return (
            <View
              key={index}
              onLayout={isActive ? onActiveLineLayout : undefined}
            >
              <Text
                style={[
                  styles.line,
                  isActive ? styles.activeLine : styles.inactiveLine,
                ]}
              >
                {line.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default memo(Lyrics);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: BOTTOM_CONTROLS_HEIGHT,
  },

  line: {
    textAlign: "center",
    marginVertical: 12,
    fontWeight: 700,
    fontSize: 26,
  },

  inactiveLine: {
    color: "#666",
    opacity: 0.6
  },

  activeLine: {
    color: "#fff",
    opacity: 1,
  },
});