// ============================================================
// api/webhook.js — Webhook de WhatsApp (Vercel Serverless)
// Maneja verificación GET y recepción POST de mensajes
// ============================================================

import { extraerMensajeEntrante, enviarMensajeWhatsApp } from "../lib/whatsapp.js";
import { guardarMensaje, guardarCliente, obtenerHistorial } from "../lib/supabase.js";
import { generarRespuesta } from "../lib/ai.js";

export default async function handler(req, res) {
  // --- GET: Verificación de Meta ---
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log("✅ Webhook verificado");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verificación fallida");
  }

  // --- POST: Recibir mensaje de WhatsApp ---
  if (req.method === "POST") {
    try {
      const datos = extraerMensajeEntrante(req.body);
      
      if (!datos) {
        // Si no es un mensaje válido de usuario (ej. mensaje de estado), igual responder 200 a Meta
        return res.status(200).send("EVENT_RECEIVED");
      }

      const { telefono, texto, nombre } = datos;
      console.log(`📩 Recibiendo mensaje de ${telefono}: "${texto}"`);

      // 1. Guardar cliente
      await guardarCliente(telefono, nombre);

      // 2. Guardar mensaje del cliente
      await guardarMensaje(telefono, texto, "cliente");

      // 3. Obtener historial para contexto
      const historial = await obtenerHistorial(telefono, 10);

      // 4. Generar respuesta con IA
      const respuesta = await generarRespuesta(texto, historial);

      // 5. Enviar respuesta por WhatsApp
      await enviarMensajeWhatsApp(telefono, respuesta);

      // 6. Guardar respuesta
      await guardarMensaje(telefono, respuesta, "negocio");

      console.log(`✅ Flujo completo procesado para ${telefono}`);
      
      // Responder a Meta SÓLO deespués de que se resolvió todo (o usar waitUntil si Vercel lo soporta, pero await es más seguro aquí)
      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("❌ Error webhook:", error.message);
      // Meta requiere un 200 o seguirá reintentando infinitamente, enviamos 200 aunque falle internamente
      return res.status(200).send("EVENT_RECEIVED_WITH_ERROR");
    }
  }

  res.status(405).json({ error: "Método no permitido" });
}
