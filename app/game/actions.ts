"use server";

import { GameData, GameSchema, InfluenceData, InfluenceSchema } from "../create-room/schemas";
import { z } from "zod";

const GetPlayerInfluencesResponseSchema = z.array(InfluenceSchema).max(2);

const DeclareActionRequestSchema = z.object({
  actionName: z.string(),
  targetPlayerID: z.string().optional(),
});

export type DeclareActionRequest = z.infer<typeof DeclareActionRequestSchema>;

export async function getPlayerInfluences(gameID: string, sessionToken: string): Promise<InfluenceData[]> {
  console.log("🔍 Getting player influences for game:", gameID);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${baseUrl}/games/${gameID}/player/influences`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${sessionToken}`
    },
    cache: "no-store",
  });

  const json = await res.json();

  const parsed = GetPlayerInfluencesResponseSchema.safeParse(json);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.format());
    throw new Error("Unexpected response format from API.");
  }

  return parsed.data;
}

export async function declareAction(
  gameID: string,
  action: DeclareActionRequest,
  sessionToken: string,
): Promise<GameData> {
  console.log("♟️ Declaring action:", action.actionName);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const requestBody = DeclareActionRequestSchema.safeParse(action);

  if (!requestBody.success) {
    console.error("Validation error:", requestBody.error.format());
    throw new Error("Unexpected response format from API.");
  }

  const res = await fetch(`${baseUrl}/games/${gameID}/actions/declare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${sessionToken}`
    },
    cache: "no-store",
    body: JSON.stringify(requestBody.data),
  });

  const json = await res.json();

  const parsedUpdatedGameState = GameSchema.safeParse(json);

  if (!parsedUpdatedGameState.success) {
    console.error("Validation error:", parsedUpdatedGameState.error.format());
    throw new Error("Unexpected response format from API.");
  }

  return parsedUpdatedGameState.data;
}