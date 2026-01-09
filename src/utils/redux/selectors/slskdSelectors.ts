import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/utils/redux/store';

export const selectSlskdServerUrl = (s: RootState) => s.slskd.serverUrl;
export const selectSlskdApiKey = (s: RootState) => s.slskd.apiKey;
export const selectSlskdAuthenticated = (s: RootState) => s.slskd.isAuthenticated;

export const selectSlskdConfig = createSelector(
  [selectSlskdServerUrl, selectSlskdApiKey],
  (serverUrl, apiKey) => ({
    serverUrl,
    apiKey,
  })
);