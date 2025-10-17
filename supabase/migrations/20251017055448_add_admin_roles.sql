/*
  # Add Admin Role Levels

  1. Changes
    - Add `admin_role` column to profiles table with default 'viewer'
    - Admin roles: super_admin, product_manager, order_manager, viewer
    
  2. Role Permissions
    - super_admin: Full access to all features including user management
    - product_manager: Can manage products and inventory
    - order_manager: Can manage orders and view reports
    - viewer: Can only view data, no edit permissions
    
  3. Security
    - Update existing RLS policies to check admin_role
    - Only super_admins can modify user roles
*/

-- Add admin_role column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'admin_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN admin_role text DEFAULT 'viewer' 
    CHECK (admin_role IN ('super_admin', 'product_manager', 'order_manager', 'viewer'));
  END IF;
END $$;

-- Update existing admins to super_admin role
UPDATE profiles SET admin_role = 'super_admin' WHERE is_admin = true;

-- Drop existing admin policies for profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create new policy for super admins to manage all profiles
CREATE POLICY "Super admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true AND admin_role = 'super_admin'
    )
  );

-- Create policy for all admins to read profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Drop existing product policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create separate policies for product management
CREATE POLICY "Super admins and product managers can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND is_admin = true 
      AND admin_role IN ('super_admin', 'product_manager')
    )
  );

-- Drop existing order update policy
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Create separate policies for order management
CREATE POLICY "Super admins and order managers can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND is_admin = true 
      AND admin_role IN ('super_admin', 'order_manager')
    )
  );
