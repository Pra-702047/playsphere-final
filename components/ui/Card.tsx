"use client";

import React from "react";
import { motion } from "framer-motion";

type CardProps = {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function Card({
  children,
  hoverable = false,
  className = "",
  onClick,
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable && !onClick ? { y: -4, borderColor: "rgba(163, 230, 53, 0.3)" } : {}}
      className={`bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md shadow-xl transition-colors duration-300 ${
        onClick ? "cursor-pointer hover:border-lime-500/30" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
