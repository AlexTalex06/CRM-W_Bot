// ============================================================
// api/messages/[telefono].js — Historial de mensajes (Vercel)
// Ruta dinámica: /api/messages/5215512345678
// ============================================================

import { obtenerHistorial } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { telefono } = req.query;
    const mensajes = await obtenerHistorial(telefono);
    res.status(200).json(mensajes);
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
}
