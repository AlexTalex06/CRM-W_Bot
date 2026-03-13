// ============================================================
// api/conversations.js — Lista de conversaciones (Vercel)
// ============================================================

import { obtenerConversaciones } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const conversaciones = await obtenerConversaciones();
    res.status(200).json(conversaciones);
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
}
