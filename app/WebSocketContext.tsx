"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface WSContextValue {
  ws: WebSocket | null;
  connect: (url: string) => void;
}

const WSContext = createContext<WSContextValue>({
  ws: null,
  connect: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [ws, setWS] = useState<WebSocket | null>(null);

  function connect(url: string) {
    // Evita reconectar indevidamente
    if (wsRef.current) return;

    console.log("🔌 [GLOBAL WS] Connecting to:", url);
    const socket = new WebSocket(url);

    wsRef.current = socket;
    setWS(socket);

    socket.onopen = () => console.log("🌐 [GLOBAL WS] Connected!");
    socket.onclose = () => {
      console.log("💤 [GLOBAL WS] Closed");
      wsRef.current = null;
      setWS(null);
    };
    socket.onerror = (e) => console.error("❌ [GLOBAL WS] Error:", e);
  }

  return (
    <WSContext.Provider value={{ ws, connect }}>
      {children}
    </WSContext.Provider>
  );
}

export function useWS() {
  return useContext(WSContext);
}