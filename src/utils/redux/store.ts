import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-async-storage/async-storage';

import serversReducer from './slices/serversSlice';
import libraryReducer from './slices/librarySlice';
import lidarrReducer from './slices/lidarrSlice';
import slskdReducer from './slices/slskdSlice';
import settingsReducer from './slices/settingsSlice';
import downloadsReducer from './slices/downloadsSlice';

const serversPersistConfig = { key: 'servers', storage };
const lidarrPersistConfig = { key: 'lidarr', storage };
const slskdPersistConfig = { key: 'slskd', storage };
const libraryPersistConfig = { key: 'library', storage };
const settingsPersistConfig = { key: 'settings', storage };
const downloadsPersistConfig = { key: 'downloads', storage };

export const rootReducer = combineReducers({
    servers: serversReducer,
    lidarr: lidarrReducer,
    slskd: slskdReducer,
    library: libraryReducer,
    settings: settingsReducer,
    downloads: downloadsReducer
});

const persistedReducer = combineReducers({
    servers: persistReducer(serversPersistConfig, serversReducer),
    lidarr: persistReducer(lidarrPersistConfig, lidarrReducer),
    slskd: persistReducer(slskdPersistConfig, slskdReducer),
    library: persistReducer(libraryPersistConfig, libraryReducer),
    settings: persistReducer(settingsPersistConfig, settingsReducer),
    downloads: persistReducer(downloadsPersistConfig, downloadsReducer)
});

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;