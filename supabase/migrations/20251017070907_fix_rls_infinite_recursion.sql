/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The admin policies were querying the profiles table to check admin status
    - This created infinite recursion when loading profiles
  
  2. Solution
    - Drop the problematic admin policies
    - Keep only the basic user policies that check auth.uid() = id
    - Admins will be able to read their own profile like regular users
    - For admin-specific features, we'll check is_admin in the application layer
  
  3. Changes
    - Drop "Admins can read all profiles" policy
    - Drop "Super admins can manage all profiles" policy
    - Keep user policies (read own, update own, insert own)
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
