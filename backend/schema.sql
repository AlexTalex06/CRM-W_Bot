-- ============================================================
-- schema.sql — Esquema de Base de Datos para Supabase
-- Ejecutar este SQL en el SQL Editor de Supabase
-- ============================================================

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT DEFAULT '',
  telefono TEXT UNIQUE NOT NULL,
  company TEXT DEFAULT '',
  role TEXT DEFAULT '',
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'active', 'closed')),
  lead_tag TEXT DEFAULT 'Lead',
  notes TEXT DEFAULT '',
  avatar TEXT DEFAULT 'https://ui-avatars.com/api/?name=Cliente&background=random',
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

-- Tabla de tratos (deals/pedidos)
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  telefono TEXT NOT NULL,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'Proposal',
  progress INTEGER DEFAULT 0,
  closing_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de tareas (recent tasks)
CREATE TABLE IF NOT EXISTS tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  telefono TEXT NOT NULL,
  title TEXT NOT NULL,
  due_info TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  overdue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_mensajes_telefono ON mensajes(telefono);
CREATE INDEX IF NOT EXISTS idx_mensajes_created ON mensajes(created_at);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_telefono ON pedidos(telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_telefono ON tareas(telefono);
CREATE INDEX IF NOT EXISTS idx_tareas_cliente_id ON tareas(cliente_id);

-- Habilitar Row Level Security (RLS) - Supabase lo requiere
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso con la anon key (ajustar según necesidad)
CREATE POLICY "Permitir todo acceso a clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a mensajes" ON mensajes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso a tareas" ON tareas FOR ALL USING (true) WITH CHECK (true);
