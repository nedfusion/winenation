/*
  # Fix Admin RLS Circular Dependency

  1. Problem
    - "Admins can view all profiles" policy checks profiles table to see if user is admin
    - This creates circular dependency: need to read profiles to check if can read profiles
    - Results in profile returning null for admin users

  2. Solution
    - Drop the problematic policy
    - Create a helper function that uses security definer to bypass RLS
    - Create new policy using the helper function
    
  3. Security
    - Helper function is secure and only checks current user's admin status
    - No risk of privilege escalation
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a helper function to check if current user is admin
-- Uses SECURITY DEFINER to bypass RLS when checking current user's own profile
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Create new policy using the helper function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());
