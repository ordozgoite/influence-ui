"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { GameData } from "../create-room/schemas";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const roomCode = searchParams.get('code');

  useEffect(() => {
    if (!roomCode) {
      router.replace('/lobby');
      return;
    }

    const storedToken = sessionStorage.getItem('gameToken');
    const storedGame = sessionStorage.getItem('currentGameData');

    if (storedToken && storedGame) {
      const parsedGame = JSON.parse(storedGame);

      if (parsedGame.joinCode !== roomCode) {
        console.error("Mismatched room code in storage and URL.");
        sessionStorage.removeItem('gameToken');
        sessionStorage.removeItem('currentGameData');
        router.replace('/create-room');
        return;
      }

      setToken(storedToken);
      setGameData(parsedGame);
    } else {
      router.replace('/create-room');
    }
  }, [roomCode, router]);

  if (!gameData) {
    return (
      <main className="flex flex-col items-center pt-12 gap-6 px-6">
        <h1 className="text-4xl font-bold">Carregando Sala...</h1>
        <p>Se demorar, verifique se você criou a sala corretamente.</p>
      </main>
    );  
  }

  const players = gameData.players;
  const currentPlayerId = gameData.adminID; // TODO: verificar se o player é o host
  const isHost = players.find((p) => p.id === currentPlayerId)?.id === currentPlayerId;

  return (
    <main className="flex flex-col items-center pt-12 gap-6 px-6">
      <h1 className="text-4xl font-bold">Sala</h1>

      {/* Código da sala */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
        <p className="text-lg text-gray-600">Código da sala:</p>
        <p className="text-3xl text-black font-extrabold tracking-widest">
          {roomCode}
        </p>
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
      <div className="text-gray-600">
        Aguardando jogadores entrarem...
      </div>

      {/* Botão Start - aparece só para o Host */}
      {isHost && (
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow-md"
        >
          Iniciar Jogo
        </button>
      )}
    </main>
  );
}