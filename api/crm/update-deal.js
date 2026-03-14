// ============================================================
// api/crm/update-deal.js — Crear o actualizar un pedido/trato
// ============================================================

import { guardarPedido } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { trato } = req.body;
    
    if (!trato || !trato.telefono || !trato.title) {
      return res.status(400).json({ error: "Faltan parámetros del trato (telefono, title)" });
    }

    const tratoActualizado = await guardarPedido(trato);
    
    if (!tratoActualizado) {
      return res.status(500).json({ error: "Error al guardar el trato/pedido" });
    }

    res.status(200).json({ success: true, trato: tratoActualizado });
  } catch (error) {
    console.error("❌ Error en update-deal:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
