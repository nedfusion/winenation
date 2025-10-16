/*
  # Add Stock Management and Multiple Images Support

  1. Changes to Products Table
    - Add `stock_quantity` column (integer) to track available stock
    - Add `low_stock_threshold` column (integer) to alert when stock is low
    - Keep existing `in_stock` as a boolean flag

  2. New Tables
    - `product_images` table for storing multiple product images/thumbnails
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `image_url` (text)
      - `is_primary` (boolean) - marks the main product image
      - `display_order` (integer) - order of images in gallery
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on product_images table
    - Add policies for authenticated users to manage images
    - Public read access for viewing images
*/

-- Add stock management columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;
END $$;

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(product_id, is_primary);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Allow public to view product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Public can view product images'
  ) THEN
    CREATE POLICY "Public can view product images"
    ON product_images
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Authenticated users can insert product images'
  ) THEN
    CREATE POLICY "Authenticated users can insert product images"
    ON product_images
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to update product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Authenticated users can update product images'
  ) THEN
    CREATE POLICY "Authenticated users can update product images"
    ON product_images
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to delete product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Authenticated users can delete product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product images"
    ON product_images
    FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;
