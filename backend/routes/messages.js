// ============================================================
// routes/messages.js — Rutas de Mensajes y Conversaciones
// Endpoints para el CRM: listar conversaciones, historial, enviar
// ============================================================

import { Router } from "express";
import { obtenerConversaciones, obtenerHistorial, guardarMensaje } from "../supabase.js";
import { enviarMensajeWhatsApp } from "../whatsapp.js";

const router = Router();

/**
 * GET /conversations — Obtener lista de conversaciones
 * Devuelve todos los clientes con su último mensaje
 */
router.get("/conversations", async (_req, res) => {
  try {
    const conversaciones = await obtenerConversaciones();
    res.json(conversaciones);
  } catch (error) {
    console.error("❌ Error al obtener conversaciones:", error.message);
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
});

/**
 * GET /messages/:telefono — Obtener historial de mensajes
 * Devuelve todos los mensajes de un número de teléfono
 */
router.get("/messages/:telefono", async (req, res) => {
  try {
    const { telefono } = req.params;
    const mensajes = await obtenerHistorial(telefono);
    res.json(mensajes);
  } catch (error) {
    console.error("❌ Error al obtener mensajes:", error.message);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

/**
 * POST /send-message — Enviar mensaje manual desde el CRM
 * Body: { telefono, mensaje }
 */
router.post("/send-message", async (req, res) => {
  try {
    const { telefono, mensaje } = req.body;

    if (!telefono || !mensaje) {
      return res.status(400).json({ error: "Se requiere 'telefono' y 'mensaje'" });
    }

    // 1. Enviar por WhatsApp
    const resultado = await enviarMensajeWhatsApp(telefono, mensaje);

    if (!resultado) {
      return res.status(500).json({ error: "Error al enviar mensaje por WhatsApp" });
    }

    // 2. Guardar en Supabase
    const mensajeGuardado = await guardarMensaje(telefono, mensaje, "negocio");

    res.status(201).json({
      success: true,
      mensaje: mensajeGuardado,
    });
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error.message);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

export default router;
