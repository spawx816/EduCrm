-- Migration: Add discount column to invoice_details
-- Created at: 2026-02-25

ALTER TABLE invoice_details ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0;
