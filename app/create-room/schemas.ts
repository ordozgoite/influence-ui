import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  coins: z.number(),
  alive: z.boolean(),
  influences: z.array(z.any()),
});

export const GameSchema = z.object({
  gameID: z.string(),
  joinCode: z.string(),
  started: z.boolean(),
  adminID: z.string(),
  finished: z.boolean(),
  turnIndex: z.number(),
  players: z.array(PlayerSchema),
  deckLength: z.number(),
});

export const CreateRoomResponseSchema = z.object({
  game: GameSchema,
  player: PlayerSchema,
  token: z.string(),
});

export const JoinRoomResponseSchema = CreateRoomResponseSchema;

export type GameData = z.infer<typeof GameSchema>;
export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;