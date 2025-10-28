/*
  # Add Super Admin Delete Orders Policy

  1. Changes
    - Add policy for super_admin to delete orders
    - Super admin can delete any order
  
  2. Security
    - Only users with admin_role = 'super_admin' can delete orders
    - Maintains existing RLS policies for other operations
*/

-- Super admin can delete any order
CREATE POLICY "Super admin can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role = 'super_admin'
    )
  );