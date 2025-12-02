"use client";

import { useState } from "react";

export default function JoinRoomPage() {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Código enviado: " + code);
    // Depois vamos chamar joinRoom() e navegar para a sala
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