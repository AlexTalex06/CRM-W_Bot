// ============================================================
// lib/ai.js — OpenAI (Vercel Serverless)
// ============================================================

import OpenAI from "openai";

const PROMPT_SISTEMA = `Eres un asistente virtual de ventas para un negocio. Tu objetivo principal es tomar pedidos y cerrar ventas.
Responde de forma amable, directa y persuasiva.

Reglas:
1. Si el cliente tiene dudas, respóndelas de forma general y siempre encamínalo a realizar un pedido ("¿Te gustaría que te tome la orden?", "¿Qué cantidad necesitas?").
2. Si el cliente quiere hacer un pedido, pídele los detalles necesarios (producto, cantidad, dirección si aplica) y confírmale que el pedido ha sido registrado.
3. No des precios exactos si no estás seguro, pero ofrece opciones genéricas recomendadas.
4. Mantén las respuestas efectivas y enfocadas en cerrar el trato. No des respuestas demasiado largas.`;

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
