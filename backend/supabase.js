// ============================================================
// supabase.js — Cliente de Supabase
// Conexión a la base de datos usando variables de entorno
// ============================================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Funciones de Base de Datos ---

/**
 * Guardar un mensaje en la tabla 'mensajes'
 * @param {string} telefono - Número de teléfono del cliente
 * @param {string} mensaje - Contenido del mensaje
 * @param {string} remitente - 'cliente' o 'negocio'
 */
export async function guardarMensaje(telefono, mensaje, remitente) {
  const { data, error } = await supabase
    .from("mensajes")
    .insert([{ telefono, mensaje, remitente }])
    .select();

  if (error) {
    console.error("❌ Error al guardar mensaje:", error.message);
    return null;
  }
  return data[0];
}

/**
 * Guardar o actualizar un cliente en la tabla 'clientes'
 * Si el teléfono ya existe, no duplica el registro
 * @param {string} telefono - Número de teléfono
 * @param {string} nombre - Nombre del cliente (opcional)
 */
export async function guardarCliente(telefono, nombre = "") {
  // Verificar si el cliente ya existe
  const { data: existing } = await supabase
    .from("clientes")
    .select("id")
    .eq("telefono", telefono)
    .single();

  if (existing) return existing;

  // Crear nuevo cliente
  const { data, error } = await supabase
    .from("clientes")
    .insert([{ telefono, nombre }])
    .select();

  if (error) {
    console.error("❌ Error al guardar cliente:", error.message);
    return null;
  }
  return data[0];
}

/**
 * Obtener el historial de mensajes de un teléfono
 * @param {string} telefono - Número de teléfono
 * @param {number} limite - Cantidad máxima de mensajes (default 50)
 */
export async function obtenerHistorial(telefono, limite = 50) {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .eq("telefono", telefono)
    .order("created_at", { ascending: true })
    .limit(limite);

  if (error) {
    console.error("❌ Error al obtener historial:", error.message);
    return [];
  }
  return data;
}

/**
 * Obtener todas las conversaciones (agrupadas por teléfono)
 * Devuelve el último mensaje de cada teléfono
 */
export async function obtenerConversaciones() {
  // Obtener todos los clientes con su último mensaje
  const { data: clientes, error: clientesError } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientesError) {
    console.error("❌ Error al obtener clientes:", clientesError.message);
    return [];
  }

  // Para cada cliente, obtener su último mensaje
  const conversaciones = await Promise.all(
    clientes.map(async (cliente) => {
      const { data: mensajes } = await supabase
        .from("mensajes")
        .select("*")
        .eq("telefono", cliente.telefono)
        .order("created_at", { ascending: false })
        .limit(1);

      const ultimoMensaje = mensajes?.[0] || null;

      return {
        ...cliente,
        ultimoMensaje: ultimoMensaje?.mensaje || "",
        ultimoMensajeTime: ultimoMensaje?.created_at || cliente.created_at,
        remitente: ultimoMensaje?.remitente || "cliente",
      };
    })
  );

  return conversaciones;
}

/**
 * Obtener todos los clientes
 */
export async function obtenerClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error al obtener clientes:", error.message);
    return [];
  }
  return data;
}

export default supabase;