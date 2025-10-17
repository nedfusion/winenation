/*
  # Fix Profile Insert Policy

  1. Changes
    - Add INSERT policy for profiles table to allow users to create their own profile
    - This fixes the "Database error saving new user" issue in SuperAdminSetup

  2. Security
    - Users can only insert their own profile (auth.uid() = id)
    - Prevents users from creating profiles for other users
*/

-- Add policy for users to insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
