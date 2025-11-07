import SoundWave from './SoundWave';

interface HeroProps {
  onJoinClick: () => void;
}

export default function Hero({ onJoinClick }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          Discover Music Events
        </h1>

        <div className="mb-12">
          <SoundWave />
        </div>

        <button
          onClick={onJoinClick}
          className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
        >
          <span className="relative z-10">Join the movement</span>
          <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-all" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </section>
  );
}
