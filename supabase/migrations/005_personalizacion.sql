-- Descripción breve del negocio (aparece bajo el nombre en la carta)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Redes sociales y datos de contacto del negocio
-- Estructura esperada: { instagram?, telefono?, direccion? }
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS redes_sociales JSONB;
