"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Stash the event so it can be triggered later via the button.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Hide the app-provided install promotion
      setIsInstallable(false);
      setIsInstalled(true);
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      console.log("PWA was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable || isInstalled) {
    return null; // Don't render anything if not installable or already installed
  }

  return (
    <button
      onClick={handleInstallClick}
      className="hidden md:flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-600 text-black text-sm font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_15px_rgba(163,255,18,0.3)]"
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  );
}
