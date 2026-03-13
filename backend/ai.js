// ============================================================
// ai.js — Módulo de Inteligencia Artificial (OpenAI)
// Genera respuestas automáticas para clientes de WhatsApp
// ============================================================

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt base para el asistente virtual
const PROMPT_SISTEMA = `Eres un asistente virtual para pequeños negocios mexicanos.
Responde siempre en español de forma clara, amable y breve.

Debes entender lo que el cliente quiere incluso si escribe con errores ortográficos o usa modismos mexicanos.

Detecta si el cliente:
- Quiere comprar algo
- Pregunta por un precio
- Pregunta por la ubicación o dirección
- Quiere hablar con una persona real
- Pide información general del negocio
- Hace un saludo o pregunta casual

Responde de forma útil y natural. Si el cliente quiere hablar con una persona, indica que un representante se comunicará pronto.

Mantén las respuestas cortas (máximo 2-3 oraciones) a menos que el cliente pida más detalle.
No inventes precios ni información que no tengas.
Si no sabes algo, di que consultarás con el equipo.`;

/**
 * Generar una respuesta automática usando OpenAI
 * @param {string} mensajeCliente - El mensaje que envió el cliente
 * @param {Array} historial - Historial de mensajes previos (opcional)
 * @returns {string} - La respuesta generada por la IA
 */
export async function generarRespuesta(mensajeCliente, historial = []) {
  try {
    // Construir el historial de conversación para contexto
    const mensajesConversacion = historial.slice(-10).map((msg) => ({
      role: msg.remitente === "cliente" ? "user" : "assistant",
      content: msg.mensaje,
    }));

    // Agregar el mensaje actual del cliente
    mensajesConversacion.push({
      role: "user",
      content: mensajeCliente,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        ...mensajesConversacion,
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const respuesta = response.choices[0]?.message?.content || "";
    console.log(`🤖 Respuesta IA generada: "${respuesta.substring(0, 80)}..."`);
    return respuesta;
  } catch (error) {
    console.error("❌ Error al generar respuesta con IA:", error.message);
    return "Disculpa, no pude procesar tu mensaje en este momento. Un representante te atenderá pronto. 🙏";
  }
}
