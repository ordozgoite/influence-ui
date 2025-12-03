"use client";

import { useState } from "react";
import { PlayerData } from "../create-room/schemas";
import { randomUUID } from "crypto";
import InfluenceCard from "../components/InfluenceCard";

export default function RoomPage() {
  const [players, setPlayers] = useState<PlayerData[]>([
    { id: "1", nickname: "ordozgoite", coins: 2, alive: true, influences: [
      { role: "Contessa", revealed: false }, 
      { role: "Contessa", revealed: false }
    ] },
    { id: "2", nickname: "amanda", coins: 2, alive: true, influences: [
      { revealed: false }, 
      { revealed: false }
    ] },
    { id: "3", nickname: "ch3to", coins: 2, alive: true, influences: [
      { role: "Contessa", revealed: true }, 
      { revealed: false }
    ] },
    { id: "4", nickname: "marcelasso", coins: 2, alive: true, influences: [
      { revealed: false }, 
      { revealed: false }] },

  ]);

  const currentPlayer = players[0];

  return (
    <main className="h-screen w-full bg-gray-100 flex overflow-hidden">
      <div className="grid grid-cols-[35%_65%] w-full h-full">

        {/* COLUNA ESQUERDA – LISTA DE JOGADORES */}
        <aside className="bg-white border-r border-gray-200 p-3 flex flex-col gap-3 overflow-y-auto">
          {players.map((p) => (
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