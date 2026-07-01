import Link from "next/link";

type TurfCardProps = {
  id: string;
  name: string;
  location: string;
  price: number;
  imageUrl?: string;
  isVerified?: boolean;
  avgRating?: number;
  ratingCount?: number;
};

export default function TurfCard({
  id,
  name,
  location,
  price,
  imageUrl,
  isVerified,
  avgRating,
  ratingCount,
}: TurfCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-lime-400 transition relative">
      {/* Verification Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            isVerified
              ? "bg-lime-500 text-black shadow-md shadow-lime-500/10"
              : "bg-zinc-800/90 text-zinc-400 border border-zinc-700 backdrop-blur-xs"
          }`}
        >
          {isVerified ? "✓ Verified" : "⚠️ Unverified"}
        </span>
      </div>

      {imageUrl ? (
        <div
          className="h-52 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="h-52 bg-zinc-800 flex items-center justify-center">
          <span className="text-gray-500">
            Turf Image
          </span>
        </div>
      )}

      <div className="p-5">
        <h2 className="text-xl font-bold text-white">
          {name}
        </h2>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-400 text-sm">
            📍 {location}
          </span>
          {avgRating !== undefined && avgRating > 0 && (
            <>
              <span className="text-zinc-700 text-xs">•</span>
              <span className="text-xs text-lime-400 font-extrabold flex items-center gap-0.5">
                ⭐ {avgRating} ({ratingCount || 0})
              </span>
            </>
          )}
        </div>

        <p className="text-lime-400 font-semibold mt-3">
          ₹{price}/hour
        </p>

        <Link href={`/turfs/${id}`}>
          <button className="w-full mt-4 bg-lime-500 text-black font-semibold py-2 rounded-lg hover:bg-lime-400 cursor-pointer">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}