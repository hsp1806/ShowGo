/*
  # Create Event Attendees Table

  1. New Tables
    - `event_attendees`
      - `id` (uuid, primary key) - Unique identifier
      - `event_id` (integer, foreign key) - References events table
      - `user_id` (uuid, foreign key) - References auth.users
      - `created_at` (timestamptz) - When user registered attendance
      - Unique constraint on (event_id, user_id) to prevent duplicate attendance

  2. Security
    - Enable RLS on `event_attendees` table
    - Add policy for anyone to view attendees
    - Add policy for authenticated users to add themselves as attendees
    - Add policy for authenticated users to remove their own attendance
    
  3. Notes
    - This table creates a many-to-many relationship between users and events
    - Users can attend multiple events, events can have multiple attendees
*/

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view attendees
CREATE POLICY "Anyone can view event attendees"
  ON event_attendees FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can add themselves as attendees
CREATE POLICY "Users can add themselves as attendees"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own attendance
CREATE POLICY "Users can remove their own attendance"
  ON event_attendees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
