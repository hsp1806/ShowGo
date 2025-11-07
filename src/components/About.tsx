import { Music, Users, Zap } from 'lucide-react';

export default function About() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">About ShowGo</h2>
          <p className="text-xl text-gray-400 mx-auto">
            Connecting music lovers with unforgettable live experiences. Discover emerging artists, attend iconic performances, and be part of a vibrant music community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <Music className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Discover Live Music</h3>
            <p className="text-gray-400">
              Browse thousands of events across all genres. From intimate venues to massive festivals, find the perfect show for you.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <Users className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Connect With Fans</h3>
            <p className="text-gray-400">
              Join a community of passionate music enthusiasts. Share reviews, find friends with similar tastes, and build lasting connections.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <Zap className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
            <p className="text-gray-400">
              Get personalized notifications for events you care about. Never miss your favorite artist or the hottest show in your city.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-12">
          <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            ShowGo exists to transform how people discover and experience live music. We believe every concert is a moment of connection—between artists and audiences, between music lovers, and with music itself. Our platform makes it effortless to find your next favorite show and join thousands of others who share your passion.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Whether you're a hardcore festival-goer, a casual concert-goer, or someone just getting into live music, ShowGo is your gateway to amazing experiences. We're here to amplify the magic of live performances and help you never miss a beat.
          </p>
        </div>
      </div>
    </section>
  );
}
