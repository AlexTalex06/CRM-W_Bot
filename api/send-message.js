// ============================================================
// api/send-message.js — Enviar mensaje manual (Vercel)
// ============================================================

import { enviarMensajeWhatsApp } from "../lib/whatsapp.js";
import { guardarMensaje } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { telefono, mensaje } = req.body;

    if (!telefono || !mensaje) {
      return res.status(400).json({ error: "Se requiere 'telefono' y 'mensaje'" });
    }

    // 1. Enviar por WhatsApp
    const resultado = await enviarMensajeWhatsApp(telefono, mensaje);
    if (!resultado) {
      return res.status(500).json({ error: "Error al enviar por WhatsApp" });
    }

    // 2. Guardar en Supabase
    const mensajeGuardado = await guardarMensaje(telefono, mensaje, "negocio");

    res.status(201).json({ success: true, mensaje: mensajeGuardado });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
}
