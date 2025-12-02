"use client";

import { useEffect, useState } from "react";

export default function LobbyPage() {
  // MOCKS ------------------------
  const [roomCode] = useState("A1B2C3");

  const [players] = useState([
    { id: 1, name: "Victor", isHost: true },
    { id: 2, name: "Ana", isHost: false },
    { id: 3, name: "João", isHost: false },
  ]);

  const currentPlayerId = 1; // mock: Victor é o host
  const isHost = players.find((p) => p.id === currentPlayerId)?.isHost;

  // ------------------------------

  return (
    <main className="flex flex-col items-center pt-12 gap-6 px-6">
      <h1 className="text-4xl font-bold">Lobby da Sala</h1>

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
              <span className="text-black font-medium">{player.name}</span>

              {player.isHost && (
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