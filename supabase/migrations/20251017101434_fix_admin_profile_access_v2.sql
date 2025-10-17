/*
  # Fix Admin Profile Access - Version 2

  1. Problem
    - Users need to read their own profile to check if they're admin
    - But the admin policy needs to know if they're admin to let them read
    - This creates a chicken-and-egg problem
    
  2. Solution
    - Keep "Users can read own profile" policy (always allows reading own profile)
    - Update "Admins can view all profiles" to only apply when viewing OTHER profiles
    - This way:
      * Users can always read their own profile (needed for login)
      * Admins can ALSO read other profiles (for user management)
    
  3. Security
    - Regular users: Can only read their own profile ✓
    - Admin users: Can read their own profile + all other profiles ✓
*/

-- Drop and recreate the admin policy to only apply to OTHER profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is admin (use SECURITY DEFINER function to avoid recursion)
    is_admin() = true
    AND
    -- Only apply this policy for OTHER people's profiles
    auth.uid() != id
  );
