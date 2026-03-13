// ============================================================
// whatsapp.js — Módulo de WhatsApp Business API (Meta)
// Envía mensajes de texto a través de la API de Meta
// ============================================================

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const GRAPH_API_URL = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;

/**
 * Enviar un mensaje de texto por WhatsApp
 * @param {string} telefono - Número de teléfono del destinatario (formato internacional, ej: 5215512345678)
 * @param {string} mensaje - Texto del mensaje a enviar
 * @returns {object|null} - Respuesta de la API o null si hay error
 */
export async function enviarMensajeWhatsApp(telefono, mensaje) {
  try {
    const response = await axios.post(
      GRAPH_API_URL,
      {
        messaging_product: "whatsapp",
        to: telefono,
        type: "text",
        text: { body: mensaje },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Mensaje enviado a ${telefono}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error al enviar mensaje de WhatsApp:",
      error.response?.data || error.message
    );
    return null;
  }
}

/**
 * Extraer datos del mensaje entrante de WhatsApp (webhook)
 * Devuelve el teléfono y el texto del mensaje, o null si no es un mensaje de texto
 * @param {object} body - Body del request del webhook
 */
export function extraerMensajeEntrante(body) {
  try {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Verificar que hay mensajes
    if (!value?.messages || value.messages.length === 0) {
      return null;
    }

    const message = value.messages[0];

    // Solo procesar mensajes de texto
    if (message.type !== "text") {
      console.log(`ℹ️ Mensaje recibido de tipo '${message.type}', ignorando (solo se procesan textos)`);
      return null;
    }

    const telefono = message.from; // Número del remitente
    const texto = message.text?.body || "";
    const nombre = value.contacts?.[0]?.profile?.name || "";
    const messageId = message.id;

    return { telefono, texto, nombre, messageId };
  } catch (error) {
    console.error("❌ Error al extraer mensaje entrante:", error.message);
    return null;
  }
}
