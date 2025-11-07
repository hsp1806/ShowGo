/*
  # Fix Profiles Insert Policy

  1. Changes
    - Drop the existing restrictive insert policy
    - Add new insert policy that allows inserting during sign up
    - The new policy allows authenticated users OR users whose auth.uid() matches the id being inserted
    - This handles the edge case where a user is signing up and needs to create their profile

  2. Security
    - Still maintains security by checking that the id matches auth.uid()
    - Users can only create profiles for themselves
*/

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile during signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
