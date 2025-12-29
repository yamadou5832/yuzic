import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-async-storage/async-storage';

import serversReducer from './slices/serversSlice';
import libraryReducer from './slices/librarySlice';
import lidarrReducer from './slices/lidarrSlice';

const serversPersistConfig = { key: 'servers', storage };
const lidarrPersistConfig = { key: 'lidarr', storage };
const libraryPersistConfig = { key: 'library', storage };

export const rootReducer = combineReducers({
    servers: serversReducer,
    lidarr: lidarrReducer,
    library: libraryReducer,
});

const persistedReducer = combineReducers({
    servers: persistReducer(serversPersistConfig, serversReducer),
    lidarr: persistReducer(lidarrPersistConfig, lidarrReducer),
    library: persistReducer(libraryPersistConfig, libraryReducer)
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