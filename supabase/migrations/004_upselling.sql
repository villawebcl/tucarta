-- Phase 1: Upselling flags on items
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS destacado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS popular   boolean NOT NULL DEFAULT false;

-- Phase 2 prep: WhatsApp contact on tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS whatsapp text;
