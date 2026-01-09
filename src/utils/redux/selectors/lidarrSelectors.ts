import { RootState } from '@/utils/redux/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectLidarrServerUrl = (s: RootState) => s.lidarr.serverUrl;
export const selectLidarrApiKey = (s: RootState) => s.lidarr.apiKey;
export const selectLidarrAuthenticated = (s: RootState) => s.lidarr.isAuthenticated;

export const selectLidarrConfig = createSelector(
  [selectLidarrServerUrl, selectLidarrApiKey],
  (serverUrl, apiKey) => ({
    serverUrl,
    apiKey,
  })
);
