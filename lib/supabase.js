// ============================================================
// lib/supabase.js — Cliente de Supabase (Vercel Serverless)
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/** Guardar un mensaje */
export async function guardarMensaje(telefono, mensaje, remitente) {
  const { data, error } = await supabase
    .from("mensajes")
    .insert([{ telefono, mensaje, remitente }])
    .select();
  if (error) { console.error("❌ Error guardarMensaje:", error.message); return null; }
  return data[0];
}

/** Guardar o encontrar un cliente */
export async function guardarCliente(telefono, nombre = "") {
  const { data: existing } = await supabase
    .from("clientes")
    .select("id, telefono, nombre, company, role, lead_status, lead_tag, notes, avatar")
    .eq("telefono", telefono)
    .single();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("clientes")
    .insert([{ telefono, nombre }])
    .select();
  if (error) { console.error("❌ Error guardarCliente:", error.message); return null; }
  return data[0];
}

/** Actualizar datos de un cliente (notas, lead status, etc) */
export async function actualizarCliente(telefono, updates) {
  const { data, error } = await supabase
    .from("clientes")
    .update(updates)
    .eq("telefono", telefono)
    .select();
  if (error) { console.error("❌ Error actualizarCliente:", error.message); return null; }
  return data[0];
}

/** Obtener historial de mensajes */
export async function obtenerHistorial(telefono, limite = 50) {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .eq("telefono", telefono)
    .order("created_at", { ascending: true })
    .limit(limite);
  if (error) { console.error("❌ Error obtenerHistorial:", error.message); return []; }
  return data;
}

/** Obtener todas las conversaciones y el cliente completo */
export async function obtenerConversaciones() {
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("❌ Error obtenerConversaciones:", error.message); return []; }

  const conversaciones = await Promise.all(
    clientes.map(async (cliente) => {
      // 1. Obtener el ultimo mensaje
      const { data: mensajes } = await supabase
        .from("mensajes")
        .select("*")
        .eq("telefono", cliente.telefono)
        .order("created_at", { ascending: false })
        .limit(1);
      
      // 2. Obtener tratos (pedidos) activos
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("*")
        .eq("cliente_id", cliente.id)
        .order("created_at", { ascending: false });

      // 3. Obtener tareas
      const { data: tareas } = await supabase
        .from("tareas")
        .select("*")
        .eq("cliente_id", cliente.id)
        .order("created_at", { ascending: false });

      const ultimo = mensajes?.[0] || null;
      return {
        ...cliente,
        ultimoMensaje: ultimo?.mensaje || "",
        ultimoMensajeTime: ultimo?.created_at || cliente.created_at,
        remitente: ultimo?.remitente || "cliente",
        pedidos: pedidos || [],
        tareas: tareas || []
      };
    })
  );
  return conversaciones;
}

/** Obtener todos los clientes (Solo tabla clientes) */
export async function obtenerClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("❌ Error obtenerClientes:", error.message); return []; }
  return data;
}

/** Crear o actualizar una tarea */
export async function guardarTarea(tarea) {
  const { data, error } = await supabase
    .from("tareas")
    .upsert(tarea)
    .select();
  if (error) { console.error("❌ Error guardarTarea:", error.message); return null; }
  return data[0];
}

/** Crear o actualizar un pedido/trato */
export async function guardarPedido(pedido) {
  const { data, error } = await supabase
    .from("pedidos")
    .upsert(pedido)
    .select();
  if (error) { console.error("❌ Error guardarPedido:", error.message); return null; }
  return data[0];
}

export default supabase;
