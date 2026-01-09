import { createSlice } from '@reduxjs/toolkit';

interface SlskdState {
    serverUrl: string;
    apiKey: string;
    isAuthenticated: boolean;
}

const initialState: SlskdState = {
    serverUrl: '',
    apiKey: '',
    isAuthenticated: false,
};

const slskdSlice = createSlice({
    name: 'slskd',
    initialState,
    reducers: {
        setServerUrl(state, action) {
            state.serverUrl = action.payload;
        },
        setApiKey(state, action) {
            state.apiKey = action.payload;
        },
        setAuthenticated(state, action) {
            state.isAuthenticated = action.payload;
        },
        disconnect(state) {
            state.serverUrl = '';
            state.apiKey = '';
            state.isAuthenticated = false;
        },
    },
});

export const { setServerUrl, setApiKey, setAuthenticated, disconnect } = slskdSlice.actions;
export default slskdSlice.reducer;