"use server";

import { InfluenceData, InfluenceSchema } from "../create-room/schemas";
import { z } from "zod";

const GetPlayerInfluencesResponseSchema = z.array(InfluenceSchema).max(2);

export async function getPlayerInfluences(gameID: string, sessionToken: string): Promise<InfluenceData[]> {
  console.log("🔍 Getting player influences for game:", gameID);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  console.log("🔍 Base URL:", baseUrl);

  const res = await fetch(`${baseUrl}/games/${gameID}/player/influences`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${sessionToken}`
    },
    cache: "no-store",
  });

  const json = await res.json();

  console.log("🔍 JSON response:", json);

  const parsed = GetPlayerInfluencesResponseSchema.safeParse(json);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    throw new Error("Unexpected response format from API.");
  }

  return parsed.data;
}