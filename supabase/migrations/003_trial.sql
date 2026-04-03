-- Período de prueba gratuita de 30 días con acceso Pro completo.
-- Se asigna automáticamente al crear el tenant.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
