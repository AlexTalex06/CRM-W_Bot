// ============================================================
// routes/webhook.js — Webhook de WhatsApp
// Recibe y procesa mensajes entrantes de WhatsApp
// ============================================================

import { Router } from "express";
import { extraerMensajeEntrante, enviarMensajeWhatsApp } from "../whatsapp.js";
import { guardarMensaje, guardarCliente, obtenerHistorial } from "../supabase.js";
import { generarRespuesta } from "../ai.js";

const router = Router();

/**
 * GET /webhook — Verificación de Meta
 * Meta envía un GET para verificar el webhook al configurarlo
 */
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    return res.status(200).send(challenge);
  }

  console.warn("⚠️ Verificación de webhook fallida — token inválido");
  return res.sendStatus(403);
});

/**
 * POST /webhook — Recibir mensajes de WhatsApp
 * Flujo completo:
 * 1. Extraer teléfono y texto
 * 2. Guardar cliente en Supabase
 * 3. Guardar mensaje del cliente
 * 4. Obtener historial de conversación
 * 5. Generar respuesta con IA
 * 6. Enviar respuesta por WhatsApp
 * 7. Guardar respuesta en Supabase
 */
router.post("/", async (req, res) => {
  try {
    // Responder inmediatamente a Meta (evitar timeout)
    res.sendStatus(200);

    // 1. Extraer datos del mensaje
    const datos = extraerMensajeEntrante(req.body);
    if (!datos) return; // No es un mensaje de texto válido

    const { telefono, texto, nombre } = datos;
    console.log(`📩 Mensaje recibido de ${telefono}: "${texto}"`);

    // 2. Guardar o actualizar cliente
    await guardarCliente(telefono, nombre);

    // 3. Guardar mensaje del cliente en la BD
    await guardarMensaje(telefono, texto, "cliente");

    // 4. Obtener historial para contexto de la IA
    const historial = await obtenerHistorial(telefono, 10);

    // 5. Generar respuesta con IA
    const respuesta = await generarRespuesta(texto, historial);

    // 6. Enviar respuesta por WhatsApp
    await enviarMensajeWhatsApp(telefono, respuesta);

    // 7. Guardar respuesta del negocio en la BD
    await guardarMensaje(telefono, respuesta, "negocio");

    console.log(`✅ Flujo completo para ${telefono} procesado exitosamente`);
  } catch (error) {
    console.error("❌ Error en el webhook:", error.message);
  }
});

export default router;
