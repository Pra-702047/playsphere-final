"use client";

import { auth } from "@/firebase/auth";

export default function WelcomeCard() {
  const user = auth.currentUser;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-lime-500 via-lime-400 to-green-500 rounded-2xl p-8 text-black shadow-xl">

      <h2 className="text-4xl font-bold mb-2">
        👋 Welcome Back,
      </h2>

      <h1 className="text-3xl font-extrabold">
        {user?.displayName || "Player"}
      </h1>

      <p className="mt-4 text-lg font-medium">
        {today}
      </p>

      <p className="mt-3 text-lg">
        Ready to play today? ⚽🏏🏸
      </p>

    </div>
  );
}