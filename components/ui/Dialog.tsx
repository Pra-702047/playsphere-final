"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: DialogProps) {
  // Disable body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getMaxWidth = () => {
    switch (maxWidth) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-xl";
      case "md":
      default:
        return "max-w-md";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`w-full ${getMaxWidth()} bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-white mb-6 pr-6">
              {title}
            </h2>

            {/* Content */}
            <div className="text-zinc-300">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
