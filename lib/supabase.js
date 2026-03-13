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
    .select("id")
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

/** Obtener todas las conversaciones */
export async function obtenerConversaciones() {
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("❌ Error obtenerConversaciones:", error.message); return []; }

  const conversaciones = await Promise.all(
    clientes.map(async (cliente) => {
      const { data: mensajes } = await supabase
        .from("mensajes")
        .select("*")
        .eq("telefono", cliente.telefono)
        .order("created_at", { ascending: false })
        .limit(1);
      const ultimo = mensajes?.[0] || null;
      return {
        ...cliente,
        ultimoMensaje: ultimo?.mensaje || "",
        ultimoMensajeTime: ultimo?.created_at || cliente.created_at,
        remitente: ultimo?.remitente || "cliente",
      };
    })
  );
  return conversaciones;
}

/** Obtener todos los clientes */
export async function obtenerClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("❌ Error obtenerClientes:", error.message); return []; }
  return data;
}

export default supabase;
