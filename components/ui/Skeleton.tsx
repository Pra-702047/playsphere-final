import React from "react";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
};

export default function Skeleton({
  className = "",
  variant = "rectangular",
}: SkeletonProps) {
  const getShape = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full rounded";
      case "circular":
        return "h-12 w-12 rounded-full";
      case "rectangular":
      default:
        return "h-32 w-full rounded-xl";
    }
  };

  return (
    <div
      className={`animate-pulse bg-zinc-800/60 border border-zinc-700/30 ${getShape()} ${className}`}
    />
  );
}
