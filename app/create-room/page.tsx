"use client";

import { useState } from "react";
import { createRoom } from "./actions";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (username.trim().length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    setError("");

    try {
      const data = await createRoom(username);

      sessionStorage.setItem("gameToken", data.token);
      sessionStorage.setItem("currentGameData", JSON.stringify(data.game));
      sessionStorage.setItem("currentPlayerID", data.player.id);

      router.push(`/room?code=${data.game.joinCode}`);
    } catch (e) {
      console.error(e);
      setError("Failed to create room. Try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 👈 impede reload da página
    await handleCreate();
  };

  return (
    <main className="flex flex-col items-center pt-12 gap-8 px-6">
      <h1 className="text-3xl font-bold">Criar Partida</h1>

      <div className="w-full max-w-md bg-white shadow-md p-6 rounded-lg">
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 font-semibold mb-2">
            Seu nome
          </label>

          <input
            type="text"
            placeholder="Digite seu username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            autoFocus
          />

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Criar Sala
          </button>
        </form>
      </div>
    </main>
  );
}