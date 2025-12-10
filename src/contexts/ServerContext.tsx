// contexts/ServerContext.tsx
import React, { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utils/redux/store";
import {
  setServerType,
  setServerUrl,
  setUsername,
  setPassword,
  setToken,
  disconnect,
  ServerType
} from "@/utils/redux/slices/serverSlice";

export interface ServerContextType {
  serverType: 'navidrome' | 'jellyfin' | 'none';
  serverUrl: string;
  username: string;
  password: string;
  token: string | null;
  isAuthenticated: boolean;

  setServerType: (t: ServerType) => void;
  setServerUrl: (url: string) => void;
  setUsername: (val: string) => void;
  setPassword: (val: string) => void;
  setToken: (val: string | null) => void;

  disconnect: () => void;
}

interface ServerProviderProps {
  children: React.ReactNode;
}

const ServerContext = createContext<ServerContextType>(null as any);

export const useServer = () => useContext(ServerContext);

export const ServerProvider = ({ children }: ServerProviderProps) => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.server);

  const value: ServerContextType = {
    serverType: state?.type ?? 'none',
    serverUrl: state?.serverUrl ?? '',
    username: state?.username ?? '',
    password: state?.password ?? '',
    token: state?.token ?? null,
    isAuthenticated: state?.isAuthenticated ?? false,

    setServerType: (t) => dispatch(setServerType(t)),
    setServerUrl: (url) => dispatch(setServerUrl(url)),
    setUsername: (u) => dispatch(setUsername(u)),
    setPassword: (p) => dispatch(setPassword(p)),
    setToken: (t) => dispatch(setToken(t)),

    disconnect: () => dispatch(disconnect())
  };

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
};

export { ServerContext };