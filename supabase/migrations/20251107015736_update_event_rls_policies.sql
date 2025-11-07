/*
  # Update RLS Policies for Events Table

  1. Changes
    - Update the UPDATE policy to allow public access
    - Update the DELETE policy to allow public access
  
  2. Reason
    - The app currently doesn't have authentication implemented
    - Users need to be able to edit and delete events without authentication
  
  3. Security Notes
    - These policies should be made more restrictive once authentication is implemented
    - Currently anyone can edit or delete any event
*/

DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;

CREATE POLICY "Anyone can update events"
  ON events
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete events"
  ON events
  FOR DELETE
  TO public
  USING (true);
