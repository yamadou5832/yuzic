import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-async-storage/async-storage';

import serverReducer from './slices/serverSlice';
import libraryReducer from './slices/librarySlice';
import genreReducer from './slices/genreSlice';
import statsReducer from './slices/statsSlice';
import libraryStatusReducer from './slices/libraryStatusSlice';
import lidarrReducer from './slices/lidarrSlice';
import userStatsReducer from './slices/userStatsSlice';

const serverPersistConfig = { key: 'server', storage };
const lidarrPersistConfig = { key: 'lidarr', storage };
const libraryPersistConfig = { key: 'library', storage };
const genrePersistConfig = { key: 'genre', storage };
const statsPersistConfig = { key: 'stats', storage };
const userStatsPersistConfig = { key: 'userStats', storage };

export const rootReducer = combineReducers({
    server: serverReducer,
    lidarr: lidarrReducer,
    library: libraryReducer,
    genre: genreReducer,
    stats: statsReducer,
    userStats: userStatsReducer,
    libraryStatus: libraryStatusReducer,
});

const persistedReducer = combineReducers({
    server: persistReducer(serverPersistConfig, serverReducer),
    lidarr: persistReducer(lidarrPersistConfig, lidarrReducer),
    library: persistReducer(libraryPersistConfig, libraryReducer),
    genre: persistReducer(genrePersistConfig, genreReducer),
    stats: persistReducer(statsPersistConfig, statsReducer),
    userStats: persistReducer(userStatsPersistConfig, userStatsReducer),
    libraryStatus: libraryStatusReducer,
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