"use client";

import { useEffect, useState } from "react";
import { ActionPayload } from "../room/schemas";
import { getActionText } from "./ActionText";

type ActionModalProps = {
  isOpen: boolean;
  action: ActionPayload;
  onContest?: () => void;
  onBlock?: (role: string) => void;
  onPermit?: () => void;
  onClose?: () => void;
};

export default function ActionModal({
  isOpen,
  action,
  onContest,
  onBlock,
  onPermit,
  onClose,
}: ActionModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  const {
    isImmediate,
    isContestable,
    blockableRoles,
    requiresTarget,
    targetPlayerId,
  } = action;

  const shouldShowPermit =
    !isImmediate && (isContestable || blockableRoles.length > 0);

  useEffect(() => {
    if (!isOpen || !isImmediate) return;

    setSecondsLeft(10);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      onClose?.();
    }, 10_000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen, isImmediate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg flex flex-col gap-4">
      <h2 className="text-lg font-bold text-black text-center">
        {getActionText(action)}
      </h2>

      {requiresTarget && targetPlayerId && (
        <p className="text-sm text-gray-600 text-center">
          Targeting player {targetPlayerId}
        </p>
      )}

      {isImmediate && (
        <p className="text-center text-sm text-gray-500">
          Resolving in {secondsLeft}s...
        </p>
      )}

      <div className="flex flex-col gap-2 mt-2">
        {/* CONTEST */}
        {isContestable && (
          <button
            onClick={onContest}
            className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white active:scale-95 transition"
          >
            Contest
          </button>
        )}

        {/* BLOCK */}
        {blockableRoles.map((role) => (
          <button
            key={role}
            onClick={() => onBlock?.(role)}
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white active:scale-95 transition"
          >
            Block as {role}
          </button>
        ))}

        {/* PERMIT */}
        {shouldShowPermit && (
          <button
            onClick={onPermit}
            className="w-full rounded-lg bg-gray-200 py-2 font-semibold text-gray-800 active:scale-95 transition"
          >
            Permit
          </button>
        )}
      </div>
    </div>
  );
}