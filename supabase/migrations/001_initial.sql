-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants (cada restaurante)
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]{3,50}$'),
  nombre      TEXT NOT NULL,
  logo_url    TEXT,
  colores     JSONB DEFAULT '{"primario": "#FF6B35", "fondo": "#FFFFFF"}'::jsonb,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basico', 'pro')),
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usuarios del panel (dueños / admins del restorán)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'staff')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categorías del menú
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  orden       INTEGER NOT NULL DEFAULT 0,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ítems del menú
CREATE TABLE items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  descripcion   TEXT,
  precio        NUMERIC(10, 0) NOT NULL CHECK (precio >= 0),
  imagen_url    TEXT,
  activo        BOOLEAN NOT NULL DEFAULT true,
  orden         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suscripciones Mercado Pago
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mp_subscription_id  TEXT UNIQUE NOT NULL,
  mp_payer_id         TEXT,
  status              TEXT NOT NULL CHECK (status IN ('authorized','paused','cancelled','pending')),
  plan                TEXT NOT NULL CHECK (plan IN ('basico', 'pro')),
  next_billing_date   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics de escaneos QR
CREATE TABLE qr_scans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent  TEXT,
  ip_hash     TEXT  -- hash del IP, nunca el IP real
);

-- Índices de performance
CREATE INDEX idx_items_tenant_id ON items(tenant_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_qr_scans_tenant_id ON qr_scans(tenant_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at);

-- Trigger updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER items_updated_at   BEFORE UPDATE ON items   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) — OBLIGATORIO en todas las tablas
ALTER TABLE tenants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans      ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "tenant: solo su propio registro"
  ON tenants FOR ALL USING (id = (current_setting('app.tenant_id', true))::uuid);

CREATE POLICY "users: solo de su tenant"
  ON users FOR ALL USING (tenant_id = (current_setting('app.tenant_id', true))::uuid);

CREATE POLICY "categories: solo de su tenant"
  ON categories FOR ALL USING (tenant_id = (current_setting('app.tenant_id', true))::uuid);

CREATE POLICY "items: solo de su tenant"
  ON items FOR ALL USING (tenant_id = (current_setting('app.tenant_id', true))::uuid);

CREATE POLICY "subscriptions: solo de su tenant"
  ON subscriptions FOR ALL USING (tenant_id = (current_setting('app.tenant_id', true))::uuid);

-- Carta pública: cualquiera puede leer items activos (sin autenticación)
CREATE POLICY "items publicos: lectura libre si activo"
  ON items FOR SELECT USING (activo = true);

CREATE POLICY "categories publicas: lectura libre si activo"
  ON categories FOR SELECT USING (activo = true);

CREATE POLICY "tenant publico: lectura libre"
  ON tenants FOR SELECT USING (activo = true);

-- QR scans: solo insert anónimo, lectura solo del tenant
CREATE POLICY "qr_scans: insert libre"
  ON qr_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "qr_scans: lectura solo de su tenant"
  ON qr_scans FOR SELECT USING (tenant_id = (current_setting('app.tenant_id', true))::uuid);
