import { MapPin, Calendar, Clock, Users } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  image: string;
  organizer: string;
  attendeeCount?: number;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
}

export default function EventCard({ event, onViewDetails }: EventCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
      <div className="flex flex-col md:flex-row md:h-64">
        <div className="md:w-64 h-48 md:h-64 relative overflow-hidden flex-shrink-0">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/50" />
        </div>

        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-bold group-hover:text-purple-400 transition-colors">
              {event.name}
            </h3>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
              {event.category}
            </span>
          </div>

          <p className="text-gray-400 mb-4 leading-relaxed line-clamp-2">{event.shortDescription}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-auto">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <div className="text-gray-300">{event.location}</div>
                <div className="text-gray-500 text-xs">{event.venue}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-gray-300">{event.date}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-gray-300">{event.time}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => onViewDetails(event)}
              className="flex-1 px-6 py-2.5 bg-white/5 hover:bg-purple-600 rounded-lg text-sm font-medium transition-all duration-300 border border-white/10 hover:border-purple-500/50"
            >
              View Details
            </button>
            {event.attendeeCount !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 font-medium">{event.attendeeCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
