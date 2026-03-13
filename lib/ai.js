// ============================================================
// lib/ai.js — OpenAI (Vercel Serverless)
// ============================================================

import OpenAI from "openai";

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

/** Generar respuesta automática con OpenAI */
export async function generarRespuesta(mensajeCliente, historial = []) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const mensajesConversacion = historial.slice(-10).map((msg) => ({
      role: msg.remitente === "cliente" ? "user" : "assistant",
      content: msg.mensaje,
    }));

    mensajesConversacion.push({ role: "user", content: mensajeCliente });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        ...mensajesConversacion,
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("❌ Error generarRespuesta:", error.message);
    return "Disculpa, no pude procesar tu mensaje en este momento. Un representante te atenderá pronto. 🙏";
  }
}
