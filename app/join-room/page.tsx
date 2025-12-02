"use client";

import { useState } from "react";
import { joinRoom } from "./actions";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  // O estado 'username' já existia, mas vamos usá-lo explicitamente
  const [username, setUsername] = useState(""); 
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter(); 

  // Ajuste a submissão para ser assíncrona
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação básica
    if (code.trim().length !== 6) {
        setError("O código da sala deve ter 6 dígitos.");
        return;
    }
    if (username.trim().length < 3) {
        setError("O nome deve ter pelo menos 3 caracteres.");
        return;
    }

    setError(""); // Limpa erros anteriores

    try {
      // 2. Chama a action, passando o código e o username
      // Assumindo que 'joinRoom' é a Server Action que faz a requisição.
      // E que ela retorna a mesma estrutura { game, player, token }.
      const data = await joinRoom(code, username);

      // 3. Armazena o token e o game data no sessionStorage
      sessionStorage.setItem('gameToken', data.token);
      sessionStorage.setItem('currentGameData', JSON.stringify(data.game));
      
      // 4. Redireciona para a sala com o código na query
      router.push(`/room?code=${data.game.joinCode}`); 
    } catch (e) {
      console.error(e);
      setError("Falha ao entrar na sala. Tente o código e o nome novamente.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Entrar em uma sala</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "240px",
        }}
      >
        {/* Campo de Input para o Código da Sala */}
        <input
          type="text"
          placeholder="Código de 6 dígitos"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{
            padding: "12px",
            fontSize: "18px",
            textAlign: "center",
            letterSpacing: "4px",
          }}
        />

        {/* NOVO: Campo de Input para o Username/Nickname */}
        <input
          type="text"
          placeholder="Seu Nickname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            textAlign: "left",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        {/* Exibição de Erros */}
        {error && (
            <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
                {error}
            </p>
        )}

        {/* Botão de Submissão */}
        <button
          type="submit"
          style={{
            padding: "12px",
            fontSize: "18px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "black",
            color: "white",
          }}
        >
          Entrar
        </button>
      </form>
    </main>
  );
}