-- ============================================================
-- schema.sql — Esquema de Base de Datos para Supabase
-- Ejecutar este SQL en el SQL Editor de Supabase
-- ============================================================

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT DEFAULT '',
  telefono TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  remitente TEXT NOT NULL CHECK (remitente IN ('cliente', 'negocio')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de pedidos (para futuro uso)
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono TEXT NOT NULL,
  producto TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_mensajes_telefono ON mensajes(telefono);
CREATE INDEX IF NOT EXISTS idx_mensajes_created ON mensajes(created_at);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_telefono ON pedidos(telefono);

-- Habilitar Row Level Security (RLS) - Supabase lo requiere
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso con la anon key (ajustar según necesidad)
CREATE POLICY "Permitir todo acceso a clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a mensajes" ON mensajes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
