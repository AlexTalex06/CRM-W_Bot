// ============================================================
// lib/whatsapp.js — WhatsApp Business API (Vercel Serverless)
// ============================================================

import axios from "axios";

/** Enviar un mensaje de texto por WhatsApp */
export async function enviarMensajeWhatsApp(telefono, mensaje) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;

  try {
    const response = await axios.post(url,
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
    console.error("❌ Error enviarMensajeWhatsApp:", error.response?.data || error.message);
    return null;
  }
}

/** Extraer datos del mensaje entrante de WhatsApp */
export function extraerMensajeEntrante(body) {
  try {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages || value.messages.length === 0) return null;

    const message = value.messages[0];
    if (message.type !== "text") {
      console.log(`ℹ️ Tipo '${message.type}' ignorado`);
      return null;
    }

    return {
      telefono: message.from,
      texto: message.text?.body || "",
      nombre: value.contacts?.[0]?.profile?.name || "",
      messageId: message.id,
    };
  } catch (error) {
    console.error("❌ Error extraerMensajeEntrante:", error.message);
    return null;
  }
}
