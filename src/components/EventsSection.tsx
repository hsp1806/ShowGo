import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import EventCard from './EventCard';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import { supabase, Event } from '../lib/supabase';

const categories = ['All', 'Rock', 'Jazz', 'Electronic', 'Indie', 'Hip Hop', 'Country'];

interface DisplayEvent {
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
  organizer: string | null;
  attendeeCount?: number;
}

interface EventsSectionProps {
  refreshTrigger?: number;
  user: User | null;
  onSignUpClick?: () => void;
}

export default function EventsSection({ refreshTrigger, user, onSignUpClick }: EventsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, event_attendees(count)')
        .order('date', { ascending: true });

      if (error) throw error;

      const displayEvents: DisplayEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        name: event.title,
        description: event.description,
        shortDescription: event.short_description,
        location: event.location,
        venue: event.venue,
        date: event.date,
        time: event.time,
        category: event.category,
        image: event.image_url || '',
        organizer: event.organizer,
        attendeeCount: event.event_attendees?.[0]?.count || 0,
      }));

      setEvents(displayEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    selectedCategory === 'All' ? events : events.filter((event) => event.category === selectedCategory);

  const handleViewDetails = (event: typeof events[0]) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleEdit = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const handleEventUpdated = () => {
    fetchEvents();
  };

  const handleEventDeleted = () => {
    fetchEvents();
  };

  return (
    <section className="px-6 py-16 relative overflow-hidden">
      <div className="absolute inset-0 starfield"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Events</h2>
          <p className="text-gray-400">Discover live music events happening near you</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  selectedCategory === category
                    ? 'bg-purple-600 border-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-purple-500/50 hover:text-purple-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No events found for this category.</p>
            </div>
          )}
        </div>
      </div>

      <EventModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} onEdit={handleEdit} onDelete={handleEventDeleted} user={user} onSignUpClick={onSignUpClick} />
      <EditEventModal event={selectedEvent} isOpen={isEditModalOpen} onClose={handleCloseEditModal} onEventUpdated={handleEventUpdated} />
    </section>
  );
}
