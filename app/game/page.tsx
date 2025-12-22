"use client";

import { useEffect, useRef, useState } from "react";
import { GameData, InfluenceData, PlayerData } from "../create-room/schemas";
import { randomUUID } from "crypto";
import InfluenceCard from "../components/InfluenceCard";
import { useRouter } from "next/navigation";
import { ActionPayload, WebSocketEventSchema } from "../room/schemas";
import { useWS } from "../WebSocketContext";
import { declareAction, getPlayerInfluences } from "./actions";
import ActionModal from "../components/ActionModal";

export default function GamePage() {
  const router = useRouter();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentPlayerID, setCurrentPlayerID] = useState<string | null>(null);
  const [currentPlayerInfluences, setCurrentPlayerInfluences] = useState<InfluenceData[]>([]);
  const [activeAction, setActiveAction] = useState<ActionPayload | null>(null);

  const { ws } = useWS();

  useEffect(() => {
    const storedGame = sessionStorage.getItem("currentGameData");
    const storedToken = sessionStorage.getItem("gameToken");
    const storedPlayerID = sessionStorage.getItem("currentPlayerID");


    if (!storedGame || !storedToken || !storedPlayerID) {
      router.replace("/room");
      return;
    }

    const parsedGame = JSON.parse(storedGame) as GameData;

    setGameData(parsedGame);
    setToken(storedToken);
    setCurrentPlayerID(storedPlayerID);
  }, [router]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (ev) => {
      console.log("📩 WS message (GAME):", ev.data);
      const json = JSON.parse(ev.data);
      console.log("🔍 JSON:", json);

      const parsed = WebSocketEventSchema.safeParse(json);

      if (!parsed.success) {
        console.log("❌ Error: Event received without corresponding schema:", parsed.error);
        return;
      }

      console.log("✅ Parsed event:", parsed);

      switch (parsed.data.eventType) {
        case "action_declared":
          console.log("✅ Action declared event:", parsed.data);

          setGameData(parsed.data.state);
          setActiveAction(parsed.data.payload.actionPayload);
          break;
        case "player_influences_updated":
          console.log("✅ Player influences updated event:", parsed.data);
          setCurrentPlayerInfluences(parsed.data.payload.influences);
          console.log("✅ Updated current player influences:", parsed.data.payload.influences);
          break;
      }
    };

  }, [ws]);

  useEffect(() => {
    console.log("Entrou no useEffect");
    if (!gameData || !token || !currentPlayerID) return;

    console.log("Passou do if");

    const fetchInfluences = async () => {
      try {
        const influences = await getPlayerInfluences(gameData.gameID, token);

        setCurrentPlayerInfluences(influences);

        console.log("✅ Updated current player influences:", influences);
      } catch (err) {
        console.error("❌ Failed to fetch player influences:", err);
      }
    };

    fetchInfluences();
  }, [gameData, token, currentPlayerID]);

  if (!gameData || !token || !currentPlayerID) {
    return <div>Loading...</div>;
  }

  const handleIncomeAction = async () => {
    try {
      console.log('💰 Income action');

      const updatedGameState = await declareAction(gameData.gameID, { actionName: "income" }, token);

      setGameData(updatedGameState);
      console.log('✅ Updated game data:', updatedGameState);
    } catch (error) {
      console.error(error);
    }
  };

  const currentTurnPlayerID =
    gameData.players[gameData.turnIndex]?.id;

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
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black">{p.nickname}</span>

                  {p.id === currentTurnPlayerID && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                      TURNO
                    </span>
                  )}
                </div>

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
            <button
              onClick={handleIncomeAction}
              className="active:scale-95 transition"
            >
              <span className="text-4xl" style={{ fontSize: '4.5rem' }}>
                💰
              </span>
            </button>
          </div>

          {/* PAINEL DO JOGADOR */}
          <div className="flex flex-col bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-black mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-black">{gameData.players.find(p => p.id === currentPlayerID)?.nickname}</span>
                {currentPlayerID === currentTurnPlayerID && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                    TURNO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-black font-bold">
                <span className="text-xl">🪙</span>
                <span>{gameData.players.find(p => p.id === currentPlayerID)?.coins}</span>
              </div>
            </h2>

            {/* SUAS CARTAS */}
            <div className="flex gap-3">
              {currentPlayerInfluences.length === 0 ? (
                <div className="text-gray-500">
                  <span className="text-sm">You don't have any influences yet</span>
                </div>
              ) : (
                currentPlayerInfluences.map((influence, i) => (
                  <InfluenceCard key={i} influence={influence} size="medium" />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
      {activeAction && (
        <div className="fixed top-4 right-4 z-50 w-[320px]">
          <ActionModal
            isOpen={true}
            action={activeAction}
            onClose={() => setActiveAction(null)}
            onContest={() => {
              console.log("⚔️ Contest action:", activeAction.id);
              // TODO: send contest action to server
              setActiveAction(null);
            }}
            onBlock={(role: string) => {
              console.log("🛑 Block action as:", role);
              // TODO: send block action to server
              setActiveAction(null);
            }}
          />
        </div>
      )}
    </main>
  );
}