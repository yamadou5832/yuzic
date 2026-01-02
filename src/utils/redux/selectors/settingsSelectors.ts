import { RootState } from '@/utils/redux/store';
import {
  AudioQuality,
  LibrarySortOrder,
  PromptHistoryEntry,
} from '@/utils/redux/slices/settingsSlice';

/* Base selector */
export const selectSettings = (state: RootState) => state.settings;

/* UI */
export const selectThemeColor = (state: RootState): string =>
  state.settings.themeColor;

export const selectGridColumns = (state: RootState): number =>
  state.settings.gridColumns;

export const selectIsGridView = (state: RootState): boolean =>
  state.settings.isGridView;

/* Library */
export const selectLibrarySortOrder = (
  state: RootState
): LibrarySortOrder =>
  state.settings.librarySortOrder;

/* Onboarding */
export const selectHasSeenGetStarted = (
  state: RootState
): boolean =>
  state.settings.hasSeenGetStarted;

/* Audio */
export const selectAudioQuality = (
  state: RootState
): AudioQuality =>
  state.settings.audioQuality;

/* AI */
export const selectOpenaiApiKey = (state: RootState): string =>
  state.settings.openaiApiKey;

export const selectAiButtonEnabled = (
  state: RootState
): boolean =>
  state.settings.aiButtonEnabled;

export const selectPromptHistory = (
  state: RootState
): PromptHistoryEntry[] =>
  state.settings.promptHistory;

/* Analytics */
export const selectAnalyticsEnabled = (
  state: RootState
): boolean =>
  state.settings.analyticsEnabled;