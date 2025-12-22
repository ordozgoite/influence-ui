"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GameData } from "../create-room/schemas";
import { PlayerJoinedEventSchema, WebSocketEventSchema } from "./schemas";
import { startGame } from "./actions";
import { useWS } from "../WebSocketContext";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentPlayerID, setCurrentPlayerID] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!roomCode) return;

    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code", err);
    }
  };

  const { ws, connect } = useWS();

  const roomCode = searchParams.get("code");

  useEffect(() => {
    if (!roomCode) {
      router.replace("/lobby");
      return;
    }

    const storedToken = sessionStorage.getItem("gameToken");
    const storedGame = sessionStorage.getItem("currentGameData");
    const storedPlayerID = sessionStorage.getItem("currentPlayerID");

    if (!storedToken || !storedGame || !storedPlayerID) {
      router.replace("/create-room");
      return;
    }

    const parsedGame = JSON.parse(storedGame);

    if (parsedGame.joinCode !== roomCode) {
      console.error("Mismatched room code in storage and URL.");
      sessionStorage.removeItem("gameToken");
      sessionStorage.removeItem("currentGameData");
      sessionStorage.removeItem("currentPlayerID");
      router.replace("/create-room");
      return;
    }

    setToken(storedToken);
    setGameData(parsedGame);
    setCurrentPlayerID(storedPlayerID);
  }, [roomCode, router]);

  useEffect(() => {
    if (!gameData || !token) return;

    const url = `${process.env.NEXT_PUBLIC_WS_URL}/ws/rooms/${gameData.gameID}?token=${token}`;
    connect(url);
  }, [gameData, token]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (ev) => {
      console.log("📩 WS message (ROOM):", ev.data);

      const json = JSON.parse(ev.data);

      const parsed = WebSocketEventSchema.safeParse(json);

      if (!parsed.success) {
        console.warn("❌ Error: Event received without corresponding schema:", json);
        return;
      }

      console.log("✅ Parsed event:", parsed);

      switch (parsed.data.eventType) {
        case "player_joined":
          console.log("✅ Player joined event:", parsed.data);
          setGameData(parsed.data.state);
          break;
        case "game_started":
          if (!token || !currentPlayerID) return;
          console.log("✅ Game started event:", parsed.data);
          sessionStorage.setItem('gameToken', token);
          sessionStorage.setItem('currentGameData', JSON.stringify(parsed.data.state));
          console.log("⚠️ Current player ID que vai ser salvo:", currentPlayerID);
          sessionStorage.setItem('currentPlayerID', currentPlayerID);
          router.push(`/game`);
          break;
      }

    };

  }, [ws]);

  if (!gameData) {
    return (
      <main className="flex flex-col items-center pt-12 gap-6 px-6">
        <h1 className="text-4xl font-bold">Carregando Sala...</h1>
        <p>Aguarde um instante.</p>
      </main>
    );
  }

  const players = gameData.players;
  const isHost = gameData.adminID === currentPlayerID?.toString();

  const handleStartGame = async () => {
    if (!gameData?.gameID || !token) return;

    const data = await startGame(gameData.gameID, token);
    console.log("Game started:", data);
  };

  return (
    <main className="flex flex-col items-center pt-12 gap-6 px-6">
      <h1 className="text-4xl font-bold">Sala</h1>

      {/* Código da sala */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
        <p className="text-lg text-gray-600 mb-2">Código da sala:</p>

        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl text-black font-extrabold tracking-widest">
            {roomCode}
          </span>

          <button
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 active:scale-95 transition text-sm font-semibold"
            aria-label="Copiar código da sala"
          >
            {copied ? "✔ Copiado" : "📋 Copiar"}
          </button>
        </div>
      </div>

      {/* Lista de jogadores */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl text-black font-semibold mb-4">Jogadores</h2>

        <ul className="space-y-3">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded"
            >
              <span className="text-black font-medium">{player.nickname}</span>

              {player.id === gameData.adminID && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  Host
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Status */}
      <div className="text-gray-600">Aguardando jogadores entrarem...</div>

      {/* Botão Start (somente host) */}
      {isHost && (
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow-md"
          onClick={handleStartGame}
        >
          Iniciar Jogo
        </button>
      )}
    </main>
  );
}