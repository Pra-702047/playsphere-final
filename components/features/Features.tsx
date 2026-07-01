import EasyBooking from "./EasyBooking";
import LocalTournaments from "./LocalTournaments";
import SportsCommunity from "./SportsCommunity";

export default function Features() {
  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose
          <span className="text-lime-400">
            {" "}PlaySphere?
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <EasyBooking />
          <LocalTournaments />
          <SportsCommunity />
        </div>

      </div>
    </section>
  );
}