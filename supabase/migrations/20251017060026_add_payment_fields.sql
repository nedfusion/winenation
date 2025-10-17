/*
  # Add Payment Tracking Fields

  1. Changes
    - Add payment_status to orders table
    - Add payment_method to orders table
    - Add payment_reference to orders table (for Paystack reference)
    - Add paid_at timestamp to orders table
    
  2. Payment Status Values
    - pending: Payment not yet initiated
    - processing: Payment in progress
    - completed: Payment successful
    - failed: Payment failed
    - refunded: Payment refunded
*/

-- Add payment fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_reference text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN paid_at timestamptz;
  END IF;
END $$;

-- Create index on payment_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
