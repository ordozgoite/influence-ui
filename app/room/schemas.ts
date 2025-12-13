// [Log] WS message: – "{\"eventType\":\"player_joined\",\"gameID\":\"654380b6-3ba2-4f60-bf42-f0ba0c235bb0\",\"timestamp\":\"2025-12-03T01:36:34.454576Z\",\"state\":{\"gameID\":\"65…" (node_modules_next_dist_7a8122d0._.js, line 2288)
// "{\"eventType\":\"player_joined\",\"gameID\":\"654380b6-3ba2-4f60-bf42-f0ba0c235bb0\",\"timestamp\":\"2025-12-03T01:36:34.454576Z\",\"state\":{\"gameID\":\"654380b6-3ba2-4f60-bf42-f0ba0c235bb0\",\"joinCode\":\"968Z8B\",\"started\":false,\"adminID\":\"9a8f6e1d-199d-4c54-a430-5ebfeb934614\",\"finished\":false,\"turnIndex\":0,\"players\":[{\"id\":\"9a8f6e1d-199d-4c54-a430-5ebfeb934614\",\"nickname\":\"asdsaadasd\",\"coins\":2,\"alive\":true,\"influences\":[]},{\"id\":\"12e815d2-680a-45b8-9cab-b4be99310af8\",\"nickname\":\"Amanda\",\"coins\":2,\"alive\":true,\"influences\":[]}],\"deckLength\":0},\"payload\":{\"newPlayer\":{\"id\":\"12e815d2-680a-45b8-9cab-b4be99310af8\",\"nickname\":\"Amanda\",\"coins\":2,\"alive\":true,\"influences\":[]}}}"

import { z } from "zod";
import { GameSchema, InfluenceSchema, PlayerSchema } from "../create-room/schemas";

export const BaseEventSchema = z.object({
  eventType: z.string(),
  gameID: z.string(),
  timestamp: z.string(),
});

export const PlayerJoinedEventSchema = BaseEventSchema.extend({
  eventType: z.literal("player_joined"),
  state: GameSchema,
  payload: z.object({
    newPlayer: PlayerSchema,
  }),
});

export const GameStartedEventSchema = BaseEventSchema.extend({
  eventType: z.literal("game_started"),
  state: GameSchema,
});

export const PlayerInfluencesUpdatedEventSchema = BaseEventSchema.extend({
  eventType: z.literal("player_influences_updated"),
  payload: z.object({
    influences: z.array(InfluenceSchema),
  }),
});

export const WebSocketEventSchema = z.discriminatedUnion("eventType", [
  PlayerJoinedEventSchema,
  GameStartedEventSchema,
  PlayerInfluencesUpdatedEventSchema,
  // TODO: adicionar mais eventos aqui
]);

export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>;