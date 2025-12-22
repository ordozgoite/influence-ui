import { ActionPayload } from "../room/schemas";
import { PlayerData } from "../create-room/schemas";

type PlayersById = Record<string, PlayerData>;

export function getActionText(
  action: ActionPayload
): string {
  const actor = action.actorPlayerNickname;
  const target = action.targetPlayerNickname ?? "Unknown player";

  switch (action.actionName) {
    case "income":
      return `${actor} takes income (+1 coin).`;

    case "foreign_aid":
      return `${actor} takes foreign aid (+2 coins).`;

    case "tax":
      return `${actor} claims Duke and takes tax (+3 coins).`;

    case "steal":
      return target
        ? `${actor} attempts to steal 2 coins from ${target}.`
        : `${actor} attempts to steal coins.`;

    case "assassinate":
      return target
        ? `${actor} attempts to assassinate ${target}.`
        : `${actor} attempts an assassination.`;

    case "exchange":
      return `${actor} attempts to exchange cards with the deck.`;

    case "coup":
      return target
        ? `${actor} launches a coup against ${target}.`
        : `${actor} launches a coup.`;

    default:
      return `${actor} performs an action.`;
  }
}