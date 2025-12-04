"use client";

import { useEffect, useRef, useState } from "react";
import { GameData, PlayerData } from "../create-room/schemas";
import { randomUUID } from "crypto";
import InfluenceCard from "../components/InfluenceCard";
import { useRouter } from "next/navigation";

export default function RoomPage() {
  const router = useRouter();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentPlayerID, setCurrentPlayerID] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const storedGame = sessionStorage.getItem("currentGameData");
    const storedToken = sessionStorage.getItem("gameToken");
    const storedPlayerID = sessionStorage.getItem("currentPlayerID");

    if (!storedGame || !storedToken || !storedPlayerID) {
      router.replace("/lobby");
      return;
    }

    const parsedGame = JSON.parse(storedGame) as GameData;

    setGameData(parsedGame);
    setToken(storedToken);
    setCurrentPlayerID(storedPlayerID);

    const player = parsedGame.players.find(p => p.id === storedPlayerID);
    if (!player) {
      router.replace("/lobby");
      return;
    }
    setCurrentPlayer(player);
  }, [router]);

  useEffect(() => {
    if (!gameData || !token) return;
    if (wsRef.current) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/rooms/${gameData.gameID}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onmessage = (ev) => {
      const json = JSON.parse(ev.data);

      if (!json.state) return;

      const newState = json.state as GameData;
      setGameData(newState);

      const p = newState.players.find(p => p.id === currentPlayerID);
      if (p) setCurrentPlayer(p);
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => ws.close();
  }, [gameData, token, currentPlayerID]);

  if (!gameData || !token || !currentPlayerID || !currentPlayer) {
    return <div>Loading...</div>;
  }

  if (!gameData || !token || !currentPlayerID || !currentPlayer) {
    return <div>Loading...</div>;
  }

  return (
    <main className="h-screen w-full bg-gray-100 flex overflow-hidden">
      <div className="grid grid-cols-[35%_65%] w-full h-full">

        {/* COLUNA ESQUERDA – LISTA DE JOGADORES */}
        <aside className="bg-white border-r border-gray-200 p-3 flex flex-col gap-3 overflow-y-auto">
          {gameData.players.filter(p => p.id !== currentPlayerID).map((p) => (
            /* TODO: Exibir apenas os oponentes */
            <div
              key={p.id}
              className="flex flex-col gap-2 bg-gray-50 px-3 py-2 rounded-md shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-black">{p.nickname}</div>
                
                {/* moedas */}
                <div className="flex items-center gap-1 text-black font-bold">
                  <span className="text-xl">🪙</span>
                  <span>{p.coins}</span>
                </div>
              </div>

              {/* cartas */}
              <div className="flex gap-1">
                {p.influences.map((influence, i) => (
                  <InfluenceCard key={i} influence={influence} size="medium" />
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* COLUNA DIREITA */}
        <section className="flex flex-col p-4 gap-4">

          {/* MESA (DECK + RESERVA) */}
          <div className="flex flex-col justify-center items-center gap-8 bg-white p-8 rounded-xl shadow-lg flex-1">
            {/* DECK */}
            <InfluenceCard influence={{ role: "Deck", revealed: false }} size="medium" />

            {/* RESERVA */}
            <button className="active:scale-95 transition">
              <span className="text-4xl" style={{ fontSize: '4.5rem' }}>💰</span>
            </button>
          </div>

          {/* PAINEL DO JOGADOR */}
          <div className="flex flex-col bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-black mb-2 flex items-center justify-between">
              <span>{currentPlayer.nickname}</span>
              <div className="flex items-center gap-1 text-black font-bold">
                <span className="text-xl">🪙</span>
                <span>{currentPlayer.coins}</span>
              </div>
            </h2>

            {/* SUAS CARTAS */}
            <div className="flex gap-3">
              {currentPlayer.influences.map((influence, i) => (
                <InfluenceCard key={i} influence={influence} size="medium" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}