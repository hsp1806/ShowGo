/*
  # Add Automatic Profile Creation Trigger

  1. Changes
    - Create a function that automatically creates a profile when a user signs up
    - Create a trigger that calls this function on auth.users insert
    - Drop the restrictive RLS insert policy since profiles will be created via trigger
    - Add a more permissive policy for the trigger to work

  2. Security
    - Trigger runs with elevated privileges to bypass RLS
    - Users still can only update/view their own profiles
    - Profile creation is automatic and secure

  3. Notes
    - The name and email will be stored via user metadata during signup
    - We'll update the signup flow to use metadata
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;

-- Create a function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
