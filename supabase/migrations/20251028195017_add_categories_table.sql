/*
  # Add Product Categories Management

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name
      - `display_order` (integer) - Order for displaying categories
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `categories` table
    - Add policy for everyone to read categories (public)
    - Add policy for super_admin and product_manager to manage categories
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- Super admin and product manager can insert categories
CREATE POLICY "Admins can create categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role IN ('super_admin', 'product_manager')
    )
  );

-- Super admin and product manager can update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role IN ('super_admin', 'product_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role IN ('super_admin', 'product_manager')
    )
  );

-- Super admin and product manager can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role IN ('super_admin', 'product_manager')
    )
  );

-- Insert default categories based on existing products
INSERT INTO categories (name, display_order)
VALUES 
  ('Wine', 1),
  ('Champagne', 2),
  ('Whisky', 3),
  ('Spirits', 4),
  ('Cognac', 5),
  ('Mixers', 6)
ON CONFLICT (name) DO NOTHING;