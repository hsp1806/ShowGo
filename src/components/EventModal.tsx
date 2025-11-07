import { X, MapPin, Calendar, Clock, Trash2, Edit, Check, UserMinus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  organizer: string | null;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  user: User | null;
  onSignUpClick?: () => void;
}

export default function EventModal({ event, isOpen, onClose, onEdit, onDelete, user, onSignUpClick }: EventModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isTogglingAttendance, setIsTogglingAttendance] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const isOrganizer = user && event && event.organizer === user.id;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && event) {
      fetchAttendeeCount();
      if (user) {
        checkAttendanceStatus();
      }
    }
  }, [isOpen, event?.id, user?.id]);

  const fetchAttendeeCount = async () => {
    if (!event) return;

    try {
      const { count, error } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);

      if (error) throw error;
      setAttendeeCount(count || 0);
    } catch (err) {
      console.error('Error fetching attendee count:', err);
    }
  };

  const checkAttendanceStatus = async () => {
    if (!event || !user) return;

    try {
      setIsLoadingAttendance(true);
      const { data, error } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsAttending(!!data);
    } catch (err) {
      console.error('Error checking attendance:', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const handleAttend = async () => {
    if (!event || !user) return;

    setIsTogglingAttendance(true);

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: event.id, user_id: user.id }]);

      if (error) throw error;
      setIsAttending(true);
      await fetchAttendeeCount();
    } catch (err) {
      console.error('Error attending event:', err);
      alert(err instanceof Error ? err.message : 'Failed to attend event');
    } finally {
      setIsTogglingAttendance(false);
    }
  };

  const handleLeave = async () => {
    if (!event || !user) return;

    setIsTogglingAttendance(true);

    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', user.id);

      if (error) throw error;
      setIsAttending(false);
      await fetchAttendeeCount();
    } catch (err) {
      console.error('Error leaving event:', err);
      alert(err instanceof Error ? err.message : 'Failed to leave event');
    } finally {
      setIsTogglingAttendance(false);
    }
  };

  if (!isOpen || !event) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#0a0a0f] rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 md:h-96 overflow-hidden rounded-t-2xl">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-4 py-1.5 bg-purple-600/90 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-3 border border-purple-500/50">
              {event.category}
            </span>
            <h2 id="modal-title" className="text-3xl md:text-4xl font-bold mb-2">
              {event.name}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-400">About This Event</h3>
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Event Details</h3>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-400 mb-0.5">Date</div>
                  <div className="text-white font-medium">{event.date}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-400 mb-0.5">Time</div>
                  <div className="text-white font-medium">{event.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-400 mb-0.5">Attendees</div>
                  <div className="text-white font-medium">{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Location</h3>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium mb-0.5">{event.venue}</div>
                  <div className="text-gray-400 text-sm">{event.location}</div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-3">
            {!user && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignUpClick?.();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all duration-300 border border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
              >
                Join to Attend
              </button>
            )}
            {user && (
              <>
                {!isAttending && (
                <button
                  type="button"
                  onClick={handleAttend}
                  disabled={isTogglingAttendance || isLoadingAttendance}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all duration-300 border border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTogglingAttendance ? 'Updating...' : 'Attend'}
                </button>
              )}
              {isAttending && (
                <>
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-500/20 text-green-300 rounded-lg font-medium border border-green-500/50 cursor-default"
                  >
                    <Check className="w-4 h-4" />
                    Attending
                  </button>
                  <button
                    type="button"
                    onClick={handleLeave}
                    disabled={isTogglingAttendance}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg font-medium transition-all duration-300 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserMinus className="w-4 h-4" />
                    {isTogglingAttendance ? 'Leaving...' : 'Leave Event'}
                  </button>
                </>
              )}
                {isOrganizer && isAttending && (
                  <div className="w-full"></div>
                )}
                {isOrganizer && (
                  <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg font-medium transition-all duration-300 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg font-medium transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
