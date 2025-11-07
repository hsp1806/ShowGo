/*
  # Fix Security and Performance Issues

  1. Performance Optimizations
    - Add indexes for foreign keys:
      - `event_attendees.user_id` - improves join performance with profiles/users
      - `events.organizer` - improves filtering by organizer
    
  2. RLS Policy Optimizations
    - Update policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth.uid() for each row, significantly improving query performance at scale
    - Affected policies:
      - profiles: "Users can view own profile"
      - profiles: "Users can update own profile"
      - event_attendees: "Users can add themselves as attendees"
      - event_attendees: "Users can remove their own attendance"
  
  3. Function Security
    - Fix search_path for `handle_new_user` function to prevent security vulnerabilities
    - Set explicit search_path to prevent malicious schema injection

  4. Notes
    - All changes are backward compatible
    - Policies maintain the same security model but with better performance
    - Indexes will improve query performance for common operations
*/

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer);

-- Drop and recreate profiles policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate event_attendees policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can add themselves as attendees" ON event_attendees;
CREATE POLICY "Users can add themselves as attendees"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove their own attendance" ON event_attendees;
CREATE POLICY "Users can remove their own attendance"
  ON event_attendees FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  RETURN new;
END;
$$;
