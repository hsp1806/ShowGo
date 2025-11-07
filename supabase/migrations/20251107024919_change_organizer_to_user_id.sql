/*
  # Change Organizer Column to Store User ID

  1. Changes
    - Drop the existing organizer column
    - Create a new organizer column as uuid
    - Set it as a foreign key referencing auth.users(id)
    - This allows us to automatically link events to their creators
    
  2. Notes
    - Existing organizer text data will be lost
    - Future events will store the creator's user ID
*/

-- Drop the existing organizer column
ALTER TABLE events DROP COLUMN IF EXISTS organizer;

-- Add new organizer column as uuid with foreign key to auth.users
ALTER TABLE events ADD COLUMN organizer uuid;

-- Add foreign key constraint to auth.users
ALTER TABLE events 
  ADD CONSTRAINT events_organizer_fkey 
  FOREIGN KEY (organizer) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;
