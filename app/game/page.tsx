"use client";

import { useEffect, useRef, useState } from "react";
import { GameData, InfluenceData } from "../create-room/schemas";
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

  const [isMoneyMenuOpen, setIsMoneyMenuOpen] = useState(false);
  const [isDeckMenuOpen, setIsDeckMenuOpen] = useState(false);

  // ✅ menu único por jogador (substitui stealMenuPlayerID)
  const [playerMenuOpenID, setPlayerMenuOpenID] = useState<string | null>(null);

  const { ws } = useWS();

  // (Opcional) refs para fechar menus ao clicar fora
  const moneyMenuRef = useRef<HTMLDivElement | null>(null);
  const deckMenuRef = useRef<HTMLDivElement | null>(null);
  const playersMenuRef = useRef<HTMLDivElement | null>(null);

  const closeAllMenus = () => {
    setIsMoneyMenuOpen(false);
    setIsDeckMenuOpen(false);
    setPlayerMenuOpenID(null);
  };

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

    console.log("🔍 Stored player ID:", storedPlayerID);
  }, [router]);

  // ✅ Fechar menus ao clicar fora
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;

      const clickedMoney =
        moneyMenuRef.current && moneyMenuRef.current.contains(target);

      const clickedDeck =
        deckMenuRef.current && deckMenuRef.current.contains(target);

      const clickedPlayers =
        playersMenuRef.current && playersMenuRef.current.contains(target);

      // se clicou em nenhum dos “containers”, fecha
      if (!clickedMoney && !clickedDeck && !clickedPlayers) {
        closeAllMenus();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (ev) => {
      console.log("📩 WS message (GAME):", ev.data);
      const json = JSON.parse(ev.data);

      const parsed = WebSocketEventSchema.safeParse(json);

      if (!parsed.success) {
        console.log("❌ Error: Event received without corresponding schema:", parsed.error);
        return;
      }

      console.log("✅ Parsed event:", parsed);

      switch (parsed.data.eventType) {
        case "action_declared":
          setGameData(parsed.data.state);

          // importante: currentPlayerID pode estar null em closures antigas
          const actorId = parsed.data.payload.actionPayload.actorPlayerId;
          const myId = currentPlayerID;

          console.log("🔍 Actor player ID:", actorId);
          console.log("🔍 Current player ID:", myId);

          if (myId && actorId !== myId) {
            setActiveAction(parsed.data.payload.actionPayload);
          }
          break;

        case "player_influences_updated":
          setCurrentPlayerInfluences(parsed.data.payload.influences);
          break;
      }
    };
  }, [ws, currentPlayerID]);

  useEffect(() => {
    if (!gameData || !token || !currentPlayerID) return;

    const fetchInfluences = async () => {
      try {
        const influences = await getPlayerInfluences(gameData.gameID, token);
        setCurrentPlayerInfluences(influences);
      } catch (err) {
        console.error("❌ Failed to fetch player influences:", err);
      }
    };

    fetchInfluences();
  }, [gameData, token, currentPlayerID]);

  if (!gameData || !token || !currentPlayerID) {
    return <div>Loading...</div>;
  }

  const sendAction = async (actionName: string, targetPlayerID?: string) => {
    try {
      console.log(`♟️ Sending ${actionName} action...`);

      // fecha menus quando dispara ação
      closeAllMenus();

      const updatedGameState = await declareAction(
        gameData.gameID,
        { actionName, targetPlayerID },
        token
      );

      setGameData(updatedGameState);
    } catch (error) {
      console.error(error);
    }
  };

  const currentTurnPlayerID = gameData.players[gameData.turnIndex]?.id;

  return (
    <main className="h-screen w-full bg-gray-100 flex overflow-hidden">
      <div className="grid grid-cols-[35%_65%] w-full h-full">
        {/* COLUNA ESQUERDA – LISTA DE JOGADORES */}
        <aside
          ref={playersMenuRef}
          className="bg-white border-r border-gray-200 p-3 flex flex-col gap-3 overflow-y-auto"
        >
          {gameData.players
            .filter((p) => p.id !== currentPlayerID)
            .map((p) => (
              <div key={p.id} className="relative">
                {/* ✅ CARD INTEIRO CLICÁVEL */}
                <button
                  onClick={() => {
                    // fecha outros menus
                    setIsDeckMenuOpen(false);
                    setIsMoneyMenuOpen(false);

                    // alterna menu do jogador
                    setPlayerMenuOpenID((prev) => (prev === p.id ? null : p.id));
                  }}
                  className="w-full text-left flex flex-col gap-2 bg-gray-50 px-3 py-2 rounded-md shadow-sm active:scale-[0.99] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">
                        {p.nickname}
                      </span>

                      {p.id === currentTurnPlayerID && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                          TURNO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-black font-bold">
                      <span className="text-xl">🪙</span>
                      <span>{p.coins}</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {p.influences.map((influence, i) => (
                      <InfluenceCard
                        key={i}
                        influence={influence}
                        size="medium"
                      />
                    ))}
                  </div>
                </button>

                {/* ✅ MENU DO JOGADOR: Steal / Assassinate / Coup */}
                {playerMenuOpenID === p.id && (
                  <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-gray-200 w-52 overflow-hidden z-30">
                    <button
                      onClick={() => sendAction("steal", p.id)}
                      className="w-full px-4 py-3 text-left text-black hover:bg-gray-100"
                    >
                      Steal (+2) [Captain]
                    </button>

                    <button
                      onClick={() => sendAction("assassinate", p.id)}
                      className="w-full px-4 py-3 text-left text-black hover:bg-gray-100"
                    >
                      Assassinate (−3) [Assassin]
                    </button>

                    <button
                      onClick={() => sendAction("coup", p.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 text-red-600 font-semibold"
                    >
                      Coup (−7)
                    </button>
                  </div>
                )}
              </div>
            ))}
        </aside>

        {/* COLUNA DIREITA */}
        <section className="flex flex-col p-4 gap-4">
          {/* MESA (DECK + RESERVA) */}
          <div className="flex flex-col justify-center items-center gap-8 bg-white p-8 rounded-xl shadow-lg flex-1">
            {/* DECK */}
            <div ref={deckMenuRef} className="relative">
              <button
                onClick={() => {
                  setIsDeckMenuOpen((prev) => !prev);
                  setIsMoneyMenuOpen(false);
                  setPlayerMenuOpenID(null);
                }}
                className="active:scale-95 transition"
              >
                <InfluenceCard
                  influence={{ role: "Deck", revealed: false }}
                  size="medium"
                />
              </button>

              {isDeckMenuOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 w-44 overflow-hidden z-20">
                  <button
                    onClick={() => sendAction("exchange")}
                    className="w-full px-4 py-3 text-left text-black hover:bg-gray-100"
                  >
                    Exchange [Ambassador]
                  </button>
                </div>
              )}
            </div>

            {/* RESERVA */}
            <div ref={moneyMenuRef} className="relative">
              <button
                onClick={() => {
                  setIsMoneyMenuOpen((prev) => !prev);
                  setPlayerMenuOpenID(null);
                  setIsDeckMenuOpen(false);
                }}
                className="active:scale-95 transition"
              >
                <span className="text-4xl" style={{ fontSize: "4.5rem" }}>
                  💰
                </span>
              </button>

              {isMoneyMenuOpen && (
                <div className="absolute top-full mt-2 right-1/2 translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 w-44 overflow-hidden z-20">
                  <button
                    onClick={() => sendAction("income")}
                    className="w-full px-4 py-3 text-left text-black hover:bg-gray-100"
                  >
                    Income (+1)
                  </button>

                  <button
                    onClick={() => sendAction("foreign_aid")}
                    className="w-full px-4 py-3 text-left text-black hover:bg-gray-100"
                  >
                    Foreign Aid (+2)
                  </button>

                  <button
                    onClick={() => sendAction("tax")}
                    className="w-full px-4 py-3 text-left text-black hover:bg-gray-100"
                  >
                    Tax (+3) [Duke]
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PAINEL DO JOGADOR */}
          <div className="flex flex-col bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-black mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-black">
                  {gameData.players.find((p) => p.id === currentPlayerID)?.nickname}
                </span>

                {currentPlayerID === currentTurnPlayerID && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                    TURNO
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-black font-bold">
                <span className="text-xl">🪙</span>
                <span>
                  {gameData.players.find((p) => p.id === currentPlayerID)?.coins}
                </span>
              </div>
            </h2>

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
              setActiveAction(null);
            }}
            onBlock={(role: string) => {
              console.log("🛑 Block action as:", role);
              setActiveAction(null);
            }}
          />
        </div>
      )}
    </main>
  );
}