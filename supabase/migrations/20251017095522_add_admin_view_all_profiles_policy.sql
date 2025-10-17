/*
  # Add Admin Access to View All Profiles

  1. Changes
    - Add SELECT policy for admins to view all profiles (for user count and user management)
    
  2. Security
    - Only allows authenticated users with is_admin = true to view all profiles
    - Regular users can still only see their own profile
*/

-- Create policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
