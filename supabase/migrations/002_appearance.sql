-- Imagen de portada horizontal (banner) del restaurante
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS portada_url TEXT;
