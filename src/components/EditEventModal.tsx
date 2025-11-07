import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  image: string;
  organizer: string;
}

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
}

export default function EditEventModal({ event, isOpen, onClose, onEventUpdated }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    organizer: '',
    description: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      const parseDateToInput = (dateString: string): string => {
        const months: { [key: string]: string } = {
          January: '01', February: '02', March: '03', April: '04',
          May: '05', June: '06', July: '07', August: '08',
          September: '09', October: '10', November: '11', December: '12'
        };

        const parts = dateString.split(' ');
        if (parts.length === 2) {
          const month = months[parts[0]];
          const day = parts[1].padStart(2, '0');
          const year = new Date().getFullYear();
          return `${year}-${month}-${day}`;
        }
        return '';
      };

      const parseTimeToInput = (timeString: string): string => {
        const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = match[2];
          const period = match[3].toUpperCase();

          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }

          return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        return '';
      };

      setFormData({
        title: event.name,
        date: parseDateToInput(event.date),
        time: parseTimeToInput(event.time),
        location: event.location,
        venue: event.venue,
        organizer: event.organizer,
        description: event.description,
        category: event.category,
      });
      setImagePreview(event.image);
      setImageFile(null);
    }
  }, [event, isOpen]);

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

  if (!isOpen || !event) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(event.image);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | null = null;
      let imagePath: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
        imagePath = filePath;
      }

      const formattedDate = formatDate(formData.date);
      const formattedTime = formatTime(formData.time);

      const updateData: any = {
        title: formData.title,
        date: formattedDate,
        time: formattedTime,
        location: formData.location,
        venue: formData.venue,
        organizer: formData.organizer,
        description: formData.description,
        short_description: formData.description.split('.')[0] + '.',
        category: formData.category,
      };

      if (imageUrl && imagePath) {
        updateData.image_url = imageUrl;
        updateData.image_path = imagePath;
      }

      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', event.id);

      if (updateError) {
        throw new Error(`Failed to update event: ${updateError.message}`);
      }

      onEventUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Rock', 'Jazz', 'Electronic', 'Indie', 'Hip Hop', 'Country'];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-event-title"
    >
      <div className="relative w-full max-w-3xl bg-[#0a0a0f] rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 z-10 bg-[#0a0a0f] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 id="edit-event-title" className="text-2xl font-bold">
            Edit Event
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                placeholder="e.g., Summer Rock Festival"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
              >
                <option value="" className="bg-[#0a0a0f]">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0a0a0f]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors [color-scheme:dark]"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-300 mb-2">
                Venue <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                placeholder="e.g., Madison Square Garden"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>

          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-300 mb-2">
              Organizer <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors"
              placeholder="e.g., ShowGo Events"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Image
            </label>
            <div className="relative">
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={imagePreview || ''}
                  alt="Event preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Change Image
                  </label>
                  {imageFile && (
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {imageFile.name}
                    </span>
                  )}
                </div>
                {imageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors resize-none"
              placeholder="Provide a detailed description of your event (4-5 sentences recommended)"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-all duration-300 border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
