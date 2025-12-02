"use server";

import { CreateRoomResponseSchema } from "./schemas";

export async function createRoom(nickname: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${baseUrl}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
    cache: "no-store",
  });

  const json = await res.json();

  const parsed = CreateRoomResponseSchema.safeParse(json);

  console.log("JSON response:", json);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    throw new Error("Unexpected response format from API.");
  }

  return parsed.data;
}