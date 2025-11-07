/*
  # Add Event Management Columns and Image Storage

  1. Schema Changes
    - Add columns to `events` table:
      - `title` (text, required) - Event title/name
      - `date` (text, required) - Event date display
      - `time` (text, required) - Event time display
      - `location` (text, required) - City and state location
      - `venue` (text, required) - Venue name
      - `organizer` (text, required) - Event organizer name
      - `description` (text, required) - Detailed event description (4-5 sentences)
      - `category` (text, required) - Music genre category
      - `image_url` (text, nullable) - URL to event image (external or Supabase storage)
      - `image_path` (text, nullable) - Storage path for uploaded images

  2. Storage
    - Create `event-images` storage bucket for user-uploaded images
    - Configure bucket to be publicly accessible for image display

  3. Security
    - RLS policies already enabled on events table
    - Add policies for authenticated users to manage events
    - Add storage policies for image uploads
*/

-- Add new columns to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'title'
  ) THEN
    ALTER TABLE events ADD COLUMN title text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'date'
  ) THEN
    ALTER TABLE events ADD COLUMN date text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'time'
  ) THEN
    ALTER TABLE events ADD COLUMN time text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location'
  ) THEN
    ALTER TABLE events ADD COLUMN location text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'venue'
  ) THEN
    ALTER TABLE events ADD COLUMN venue text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'organizer'
  ) THEN
    ALTER TABLE events ADD COLUMN organizer text NOT NULL DEFAULT 'ShowGo Events';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description'
  ) THEN
    ALTER TABLE events ADD COLUMN description text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'category'
  ) THEN
    ALTER TABLE events ADD COLUMN category text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE events ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'image_path'
  ) THEN
    ALTER TABLE events ADD COLUMN image_path text;
  END IF;
END $$;

-- Add RLS policies for events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Anyone can view events'
  ) THEN
    CREATE POLICY "Anyone can view events"
      ON events FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Authenticated users can insert events'
  ) THEN
    CREATE POLICY "Authenticated users can insert events"
      ON events FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Authenticated users can update events'
  ) THEN
    CREATE POLICY "Authenticated users can update events"
      ON events FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'events' AND policyname = 'Authenticated users can delete events'
  ) THEN
    CREATE POLICY "Authenticated users can delete events"
      ON events FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for event images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Anyone can view event images'
  ) THEN
    CREATE POLICY "Anyone can view event images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'event-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload event images'
  ) THEN
    CREATE POLICY "Authenticated users can upload event images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'event-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Authenticated users can update event images'
  ) THEN
    CREATE POLICY "Authenticated users can update event images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'event-images')
      WITH CHECK (bucket_id = 'event-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Authenticated users can delete event images'
  ) THEN
    CREATE POLICY "Authenticated users can delete event images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'event-images');
  END IF;
END $$;
