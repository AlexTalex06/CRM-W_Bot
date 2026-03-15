// ============================================================
// lib/ai.js — OpenAI (Vercel Serverless)
// ============================================================

import OpenAI from "openai";

const PROMPT_SISTEMA = `Eres un asistente virtual de ventas para un negocio. Tu objetivo principal es tomar pedidos y cerrar ventas.
Responde de forma amable, directa y persuasiva.

REGLA ESTRICTA: SIEMPRE debes responder en un formato JSON válido.
Tu respuesta JSON debe tener exactamente esta estructura:
{
  "respuesta": "El texto amable que le dirías al cliente por WhatsApp.",
  "pedido_confirmado": null // O un objeto si el cliente ACABA de confirmar un pedido
}

Si el cliente confirma un pedido, llena el objeto "pedido_confirmado" así:
{
  "respuesta": "¡Perfecto! Tu pedido de 1 crema y 1 shampoo ha sido registrado por un total de $500.",
  "pedido_confirmado": {
    "descripcion": "1 crema, 1 shampoo",
    "total": 500
  }
}

Reglas:
1. Si el cliente tiene dudas, respóndelas e incítalo a pedir ("¿Te gustaría que te tome la orden?").
2. Si el cliente quiere hacer un pedido, confirma los detalles y calcula un precio aproximado razonable.
3. Solo envía un "pedido_confirmado" cuando el cliente confirme explícitamente la compra o el registro de la orden. Mantenlo en null mientras estén cotizando.
4. NUNCA respondas con texto plano fuera del JSON.`;

/** Generar respuesta automática con OpenAI y extraer intenciones de pedido */
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
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        ...mensajesConversacion,
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const aiOutput = response.choices[0]?.message?.content;
    let datosExtraidos;
    try {
      datosExtraidos = JSON.parse(aiOutput);
    } catch (parseError) {
      console.error("❌ Error parseando JSON de OpenAI:", aiOutput);
      return { respuesta: "Disculpa, estoy teniendo un problema técnico. ¿Podrías repetir tu mensaje?", pedido: null };
    }

    return { 
      respuesta: datosExtraidos.respuesta || "Disculpa, procesé mal la orden.", 
      pedido: datosExtraidos.pedido_confirmado || null 
    };
  } catch (error) {
    console.error("❌ Error generarRespuesta:", error.message);
    return { respuesta: "Disculpa, no pude procesar tu mensaje en este momento. 🙏", pedido: null };
  }
}

