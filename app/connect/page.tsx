import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export const metadata = {
  title: "Connect with Us | PlaySphere",
  description: "Stay in touch with PlaySphere. Join our Telegram channel, follow our Instagram, or drop us an email.",
};

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      {/* Hero Header */}
      <main className="flex-grow flex items-center justify-center py-20 px-6 relative overflow-hidden">
        {/* Abstract Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl w-full text-center relative z-10 space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Connect with <span className="text-lime-400">PlaySphere</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Have questions, feedback, or want to stay updated with slots and events? Join our community networks or drop us a message.
            </p>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Telegram Card */}
            <a
              href="https://t.me/PlaySphereNanded"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md hover:border-sky-500/50 hover:bg-zinc-900 transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] hover:-translate-y-1 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.41.52-.46-.01-1.36-.26-2.02-.48-.82-.27-1.47-.41-1.42-.87.03-.24.36-.49.99-.74 3.89-1.69 6.49-2.8 7.8-3.32 3.71-1.48 4.48-1.74 4.99-1.75.11 0 .36.03.52.16.14.11.18.27.2.39-.01.07.01.21 0 .28z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Telegram</h3>
                <p className="text-zinc-550 text-xs">Join PlaySphere Nanded for announcements and updates.</p>
              </div>
              <div className="inline-flex items-center text-xs font-bold text-sky-400 gap-1.5 group-hover:underline">
                Join Channel ↗
              </div>
            </a>

            {/* Instagram Card */}
            <a
              href="https://www.instagram.com/playsphere.in?igsh=MWJoamUwOWZqa28ybQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md hover:border-pink-500/50 hover:bg-zinc-900 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:-translate-y-1 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Instagram</h3>
                <p className="text-zinc-550 text-xs">Follow us for court highlights, photos, and news.</p>
              </div>
              <div className="inline-flex items-center text-xs font-bold text-pink-400 gap-1.5 group-hover:underline">
                Follow Page ↗
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:playspherenanded@gmail.com"
              className="group block p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md hover:border-lime-400/50 hover:bg-zinc-900 transition-all duration-300 hover:shadow-[0_0_30px_rgba(163,230,53,0.1)] hover:-translate-y-1 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-lime-400/10 text-lime-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Email Us</h3>
                <p className="text-zinc-550 text-xs">Direct support: playspherenanded@gmail.com</p>
              </div>
              <div className="inline-flex items-center text-xs font-bold text-lime-400 gap-1.5 group-hover:underline">
                Send Mail ↗
              </div>
            </a>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
