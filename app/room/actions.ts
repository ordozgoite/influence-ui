"use server";

import { GameSchema } from "../create-room/schemas";

export async function startGame(gameID: string, sessionToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${baseUrl}/rooms/${gameID}/start`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${sessionToken}` 
    },
    cache: "no-store",
  });

  const json = await res.json();

  const parsed = GameSchema.safeParse(json);

  console.log("JSON response:", json);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    throw new Error("Unexpected response format from API.");
  }

  return parsed.data;
}