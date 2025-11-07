import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';

interface ProfileProps {
  user: User;
  onCreateEventClick?: () => void;
}

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

type TabType = 'attending' | 'created';

export default function Profile({ user, onCreateEventClick }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('attending');
  const [createdEvents, setCreatedEvents] = useState<DisplayEvent[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<DisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string | null } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === 'created') {
      fetchCreatedEvents();
    } else if (activeTab === 'attending') {
      fetchAttendingEvents();
    }
  }, [user.id, activeTab]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAttendingEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          event_id,
          events (
            id,
            title,
            description,
            short_description,
            location,
            venue,
            date,
            time,
            category,
            image_url,
            organizer
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const displayEvents: DisplayEvent[] = (data || [])
        .filter((item: any) => item.events)
        .map((item: any) => ({
          id: item.events.id,
          name: item.events.title,
          description: item.events.description,
          shortDescription: item.events.short_description,
          location: item.events.location,
          venue: item.events.venue,
          date: item.events.date,
          time: item.events.time,
          category: item.events.category,
          image: item.events.image_url || '',
          organizer: item.events.organizer,
        }));

      setAttendingEvents(displayEvents);
    } catch (error) {
      console.error('Error fetching attending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*, event_attendees(count)')
        .eq('organizer', user.id)
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

      setCreatedEvents(displayEvents);
    } catch (error) {
      console.error('Error fetching created events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getJoinDate = () => {
    if (user.created_at) {
      const date = new Date(user.created_at);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'Recently';
  };

  const getInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0].toUpperCase() || 'U';
  };

  const handleEventClick = (event: DisplayEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    if (activeTab === 'created') {
      fetchCreatedEvents();
    } else if (activeTab === 'attending') {
      fetchAttendingEvents();
    }
  };

  const handleEventUpdate = () => {
    setIsEditModalOpen(false);
    if (activeTab === 'created') {
      fetchCreatedEvents();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl font-bold">
              {getInitials()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {userProfile?.name || 'User'}
              </h1>
              <p className="text-gray-400 mb-1">{user.email}</p>
              <p className="text-sm text-gray-500">Joined {getJoinDate()}</p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('attending')}
              className={`px-8 py-4 font-semibold text-lg transition-all duration-300 relative ${
                activeTab === 'attending'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Attending
              {activeTab === 'attending' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`px-8 py-4 font-semibold text-lg transition-all duration-300 relative ${
                activeTab === 'created'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Created
              {activeTab === 'created' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === 'attending' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading your events...</p>
                </div>
              ) : attendingEvents.length > 0 ? (
                <div className="space-y-4">
                  {attendingEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        <div className="w-full sm:w-48 h-32 flex-shrink-0">
                          <img
                            src={event.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400'}
                            alt={event.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-bold">{event.name}</h3>
                            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-full text-xs font-medium whitespace-nowrap">
                              {event.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {event.shortDescription}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
                    <p className="text-gray-400 mb-4">
                      You're not attending any events yet. Browse events and click "Attend" to join!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'created' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading your events...</p>
                </div>
              ) : createdEvents.length > 0 ? (
                <div className="space-y-4">
                  {createdEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        <div className="w-full sm:w-48 h-32 flex-shrink-0">
                          <img
                            src={event.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400'}
                            alt={event.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-bold">{event.name}</h3>
                            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-full text-xs font-medium whitespace-nowrap">
                              {event.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {event.shortDescription}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Events Created</h3>
                    <p className="text-gray-400 mb-6">
                      You haven't created any events yet. Start by creating your first event!
                    </p>
                    {onCreateEventClick && (
                      <button
                        onClick={onCreateEventClick}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                      >
                        <Plus className="w-5 h-5" />
                        Create Your First Event
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        user={user}
      />

      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleEventUpdate}
        />
      )}
    </div>
  );
}
