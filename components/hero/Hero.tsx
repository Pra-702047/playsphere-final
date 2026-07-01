import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-5xl mx-auto text-center">

        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Find Sports Turfs
          <span className="text-lime-400"> Near You</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Book Football, Cricket, Badminton and Box Cricket
          grounds instantly. Connect with players and
          discover local tournaments through PlaySphere.
        </p>

        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/turfs"
            className="bg-lime-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-lime-400 transition"
          >
            Book Now
          </Link>

          <Link
            href="/turfs"
            className="border border-lime-500 text-lime-400 px-8 py-3 rounded-lg hover:bg-lime-500 hover:text-black transition"
          >
            Explore Turfs
          </Link>
        </div>

        <div className="mt-16">
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            ⚽ Football • 🏏 Cricket • 🏸 Badminton
          </p>
        </div>

      </div>
    </section>
  );
}