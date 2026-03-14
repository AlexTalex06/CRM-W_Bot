// ============================================================
// api/crm/update-client.js — Actualizar datos del CRM del cliente
// ============================================================

import { actualizarCliente } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { telefono, updates } = req.body;
    
    if (!telefono || !updates) {
      return res.status(400).json({ error: "Faltan parámetros (telefono, updates)" });
    }

    const clienteActualizado = await actualizarCliente(telefono, updates);
    
    if (!clienteActualizado) {
      return res.status(404).json({ error: "Cliente no encontrado o error al actualizar" });
    }

    res.status(200).json({ success: true, cliente: clienteActualizado });
  } catch (error) {
    console.error("❌ Error en update-client:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
