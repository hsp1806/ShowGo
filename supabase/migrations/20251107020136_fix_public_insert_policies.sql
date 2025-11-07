/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Update events table INSERT policy to allow public access
    - Update storage bucket policies to allow public uploads
  
  2. Reason
    - App doesn't have authentication implemented
    - Users need to create events and upload images without authentication
  
  3. Security Notes
    - These policies should be restricted once authentication is added
    - Currently anyone can create events and upload images
*/

-- Update events table INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;

CREATE POLICY "Anyone can insert events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Update storage policies for event-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;

CREATE POLICY "Anyone can upload event images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Anyone can update event images"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'event-images')
  WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Anyone can delete event images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'event-images');
