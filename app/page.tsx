// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "32px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>COUP</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <button
          style={buttonStyle}
          onClick={() => router.push("/create-room")}
        >
          Criar Sala
        </button>

        <button
          style={buttonStyle}
          onClick={() => router.push("/join-room")}
        >
          Entrar em Uma Sala
        </button>
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "12px 20px",
  fontSize: "18px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "black",
  color: "white",
};