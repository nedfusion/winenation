/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `category` (text, required)
      - `subcategory` (text, optional)
      - `price` (numeric, required)
      - `original_price` (numeric, optional)
      - `description` (text, optional)
      - `image_url` (text, optional)
      - `vintage` (integer, optional)
      - `region` (text, required)
      - `alcohol_content` (numeric, required)
      - `volume` (text, required)
      - `rating` (numeric, default 0)
      - `reviews_count` (integer, default 0)
      - `in_stock` (boolean, default true)
      - `featured` (boolean, default false)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `products` table
    - Add policy for anyone to read products
    - Add policy for admins to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  description text,
  image_url text,
  vintage integer,
  region text NOT NULL,
  alcohol_content numeric(4,2) NOT NULL,
  volume text NOT NULL,
  rating numeric(2,1) DEFAULT 0,
  reviews_count integer DEFAULT 0,
  in_stock boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert sample products
INSERT INTO products (name, category, price, original_price, description, image_url, vintage, region, alcohol_content, volume, rating, reviews_count, in_stock, featured) VALUES
('Dom Pérignon Vintage 2012', 'champagne', 299.99, NULL, 'The pinnacle of champagne craftsmanship. Elegant bubbles with notes of citrus, brioche, and mineral complexity.', 'https://images.pexels.com/photos/5531259/pexels-photo-5531259.jpeg?auto=compress&cs=tinysrgb&w=500', 2012, 'Champagne, France', 12.5, '750ml', 4.9, 142, true, true),
('Moët & Chandon Brut Imperial', 'champagne', 89.99, NULL, 'Classic champagne with vibrant effervescence and fresh fruit flavors. Perfect for celebrations.', 'https://images.pexels.com/photos/6478797/pexels-photo-6478797.jpeg?auto=compress&cs=tinysrgb&w=500', 2020, 'Champagne, France', 12.0, '750ml', 4.6, 203, true, false),
('Hennessy XO', 'cognac', 249.99, 299.99, 'Premium cognac with rich, complex flavors of dried fruits, spices, and oak. Aged to perfection.', 'https://images.pexels.com/photos/5490968/pexels-photo-5490968.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'Cognac, France', 40.0, '700ml', 4.8, 156, true, true),
('Rémy Martin VSOP', 'cognac', 89.99, NULL, 'Smooth and balanced cognac with notes of vanilla, apricot, and honey. Perfect for sipping.', 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'Cognac, France', 40.0, '700ml', 4.5, 94, true, false),
('Grey Goose Vodka', 'spirits', 59.99, NULL, 'Premium French vodka with exceptional smoothness and purity. Distilled from French wheat.', 'https://images.pexels.com/photos/3672825/pexels-photo-3672825.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'France', 40.0, '750ml', 4.7, 287, true, false),
('Bombay Sapphire Gin', 'spirits', 39.99, NULL, 'London Dry Gin with 10 hand-selected botanicals. Crisp, clean, and perfectly balanced.', 'https://images.pexels.com/photos/5490966/pexels-photo-5490966.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'England', 40.0, '750ml', 4.4, 198, true, false),
('Macallan 18 Year Old', 'whisky', 599.99, NULL, 'Exceptional single malt Scotch whisky aged in sherry oak casks. Rich, complex, and luxurious.', 'https://images.pexels.com/photos/3672825/pexels-photo-3672825.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'Speyside, Scotland', 43.0, '700ml', 4.9, 89, true, true),
('Jameson Irish Whiskey', 'whisky', 34.99, NULL, 'Smooth Irish whiskey with notes of vanilla, honey, and spice. Triple distilled for exceptional smoothness.', 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'Ireland', 40.0, '750ml', 4.3, 245, true, false),
('Château Margaux 2018', 'wine', 899.99, 1199.99, 'An exceptional vintage from one of Bordeaux''s most prestigious estates. Rich, complex, with notes of blackcurrant, cedar, and tobacco.', 'https://images.pexels.com/photos/3672825/pexels-photo-3672825.jpeg?auto=compress&cs=tinysrgb&w=500', 2018, 'Bordeaux, France', 13.5, '750ml', 4.9, 142, true, true),
('Cloudy Bay Sauvignon Blanc', 'wine', 32.99, NULL, 'Crisp and refreshing New Zealand Sauvignon Blanc with tropical fruit flavors and a zesty finish.', 'https://images.pexels.com/photos/5490966/pexels-photo-5490966.jpeg?auto=compress&cs=tinysrgb&w=500', 2022, 'Marlborough, New Zealand', 13.0, '750ml', 4.6, 203, true, false),
('Whispering Angel Rosé', 'wine', 24.99, NULL, 'Provence rosé with delicate flavors of strawberry and peach. Perfect for summer evenings.', 'https://images.pexels.com/photos/5490968/pexels-photo-5490968.jpeg?auto=compress&cs=tinysrgb&w=500', 2022, 'Provence, France', 13.0, '750ml', 4.4, 156, true, false),
('Fever-Tree Premium Tonic Water', 'mixers', 12.99, NULL, 'Premium tonic water made with natural quinine. Perfect mixer for gin and other spirits.', 'https://images.pexels.com/photos/6478797/pexels-photo-6478797.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'United Kingdom', 0.0, '500ml x 4', 4.5, 167, true, false),
('Schweppes Ginger Ale', 'mixers', 8.99, NULL, 'Classic ginger ale with a crisp, refreshing taste. Ideal for cocktails and enjoying on its own.', 'https://images.pexels.com/photos/5531259/pexels-photo-5531259.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'International', 0.0, '330ml x 6', 4.2, 134, true, false),
('San Pellegrino Sparkling Water', 'mixers', 15.99, NULL, 'Premium Italian sparkling water with fine bubbles and a clean, refreshing taste.', 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=500', NULL, 'Italy', 0.0, '750ml x 6', 4.6, 298, true, false);