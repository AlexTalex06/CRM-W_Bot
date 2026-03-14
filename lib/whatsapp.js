// ============================================================
// lib/whatsapp.js — WhatsApp Business API (Vercel Serverless)
// ============================================================

import axios from "axios";

/** Enviar un mensaje de texto por WhatsApp */
export async function enviarMensajeWhatsApp(telefono, mensaje) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;

  const dataPayload = {
    messaging_product: "whatsapp",
    to: telefono,
    type: "text",
    text: { body: mensaje },
  };

  const headersParams = {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(url, dataPayload, headersParams);
    console.log(`✅ Mensaje enviado a ${telefono}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error enviarMensajeWhatsApp a ${telefono}:`, JSON.stringify(error.response?.data || error.message, null, 2));

    // Corrección para México: Si el número de WhatsApp empieza con 521, Meta a menudo requiere que sea 52
    if (telefono.startsWith('521') && telefono.length === 13) {
      console.log(`⚠️ Intentando reenviar sin el '1' (México)...`);
      const telefonoCorregido = telefono.replace('521', '52');
      dataPayload.to = telefonoCorregido;
      
      try {
        const retry = await axios.post(url, dataPayload, headersParams);
        console.log(`✅ Mensaje reenviado exitosamente a ${telefonoCorregido}`);
        return retry.data;
      } catch (retryError) {
        console.error(`❌ También falló el reintento a ${telefonoCorregido}:`, JSON.stringify(retryError.response?.data || retryError.message, null, 2));
      }
    }
    
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
