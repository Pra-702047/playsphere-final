"use client";

import { useEffect, useState } from "react";

export default function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register Service Worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);

          // Handle Update Notification (Step 9)
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true);
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  const updateApp = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      });
    }
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl p-4 rounded-xl flex items-center gap-4 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="flex-1">
        <p className="text-white text-sm font-semibold">New version available!</p>
        <p className="text-zinc-400 text-xs">Update now to get the latest features.</p>
      </div>
      <button
        onClick={updateApp}
        className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-black text-sm font-bold rounded-lg transition-colors"
      >
        Update Now
      </button>
    </div>
  );
}
