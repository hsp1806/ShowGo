/*
  # Add Short Description Column

  1. Changes
    - Add `short_description` column to events table for display on event cards
    - Keep full `description` for detailed modal view
    - Update existing events with concise short descriptions

  2. Notes
    - Short descriptions are 1-2 sentences for preview
    - Full descriptions remain 4-5 sentences for modal
*/

-- Add short_description column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE events ADD COLUMN short_description text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Update existing events with short descriptions
UPDATE events SET short_description = 'An electrifying night of rock music with epic performances.' WHERE title = 'Rock Concert';
UPDATE events SET short_description = 'Join us for a smooth and soulful evening of jazz tunes.' WHERE title = 'Jazz Night';
UPDATE events SET short_description = 'Get ready to dance to the hottest electronic beats in town.' WHERE title = 'Electronic Party';
UPDATE events SET short_description = 'Experience the best indie bands and emerging artists live.' WHERE title = 'Indie Showcase';
UPDATE events SET short_description = 'The biggest hip hop artists performing live on one stage.' WHERE title = 'Hip Hop Festival';
UPDATE events SET short_description = 'A night of heartfelt country music under the stars.' WHERE title = 'Country Music Night';
