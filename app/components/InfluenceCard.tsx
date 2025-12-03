import { InfluenceData } from "../create-room/schemas";

interface InfluenceCardProps {
  influence: InfluenceData;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "w-4 h-6",
  medium: "w-24 h-36",
  large: "w-32 h-48",
};

export default function InfluenceCard({ influence, size = "medium" }: InfluenceCardProps) {
  const isRevealed = influence.revealed;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-xl shadow-md
        flex items-center justify-center
        bg-indigo-700
        transition-colors
      `}
    >
        <span
          className={`
            text-white font-semibold text-center px-2
            ${size === "small" ? "text-xs" : size === "medium" ? "text-sm" : "text-base"}
            ${isRevealed ? "opacity-60 text-black" : "text-white"}
          `}
        >
          {influence.role || "?"}
        </span>
    </div>
  );
}

