import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Server } from "@/types";

interface ServersState {
  servers: Server[];
  activeServerId: string | null;
}

const initialState: ServersState = {
  servers: [],
  activeServerId: null,
};

export const serversSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    addServer: (state, action: PayloadAction<Server>) => {
      state.servers.push(action.payload);
    },

    updateServer: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Server> }>
    ) => {
      const server = state.servers.find(s => s.id === action.payload.id);
      if (server) {
        Object.assign(server, action.payload.patch);
      }
    },

    removeServer: (state, action: PayloadAction<string>) => {
      state.servers = state.servers.filter(s => s.id !== action.payload);
      if (state.activeServerId === action.payload) {
        state.activeServerId = null;
      }
    },

    setActiveServer: (state, action: PayloadAction<string | null>) => {
      state.activeServerId = action.payload;
    },

    disconnect: (state) => {
      state.activeServerId = null;
    },
  },
});

export const {
  addServer,
  updateServer,
  removeServer,
  setActiveServer,
  disconnect,
} = serversSlice.actions;

export default serversSlice.reducer;