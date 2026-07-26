"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import TurfCard from "./TurfCard";

type Turf = {
  id: string;
  name: string;
  location: string;
  price: number;
  imageUrl: string;
  description?: string;
  isVerified?: boolean;
  avgRating?: number;
  ratingCount?: number;
};

export default function TurfList({ initialTurfs }: { initialTurfs: Turf[] }) {
  const [turfs, setTurfs] = useState<Turf[]>(initialTurfs);

  if (turfs.length === 0) {
    return (
      <p className="text-center text-gray-400">
        No turfs found.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {turfs.map((turf) => (
        <TurfCard
          key={turf.id}
          id={turf.id}
          name={turf.name}
          location={turf.location}
          price={turf.price}
          imageUrl={turf.imageUrl}
          isVerified={turf.isVerified}
          avgRating={turf.avgRating}
          ratingCount={turf.ratingCount}
        />
      ))}
    </div>
  );
}