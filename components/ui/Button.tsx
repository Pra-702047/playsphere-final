"use client";

import React from "react";
import { motion } from "framer-motion";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const getStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-lime-500 hover:bg-lime-400 text-black font-extrabold shadow-lg shadow-lime-500/10";
      case "secondary":
        return "bg-zinc-800 hover:bg-zinc-700 text-white font-semibold border border-zinc-700";
      case "outline":
        return "border border-lime-500 text-lime-400 hover:bg-lime-500 hover:text-black font-semibold";
      case "danger":
        return "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold";
      case "ghost":
        return "text-gray-400 hover:text-white transition";
      default:
        return "bg-lime-500 text-black";
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer ${getStyles()} ${className}`}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
