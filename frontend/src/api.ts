// ============================================================
// api.ts — Cliente API del CRM
// En producción (Vercel): /api/* directo
// En desarrollo: Vite proxy redirige /api/* al backend local
// ============================================================

import type { Conversacion, Mensaje } from './types';

/** Obtener lista de conversaciones */
export async function fetchConversations(): Promise<Conversacion[]> {
  const res = await fetch('/api/conversations');
  if (!res.ok) throw new Error('Error al obtener conversaciones');
  return res.json();
}

/** Obtener historial de mensajes de un teléfono */
export async function fetchMessages(telefono: string): Promise<Mensaje[]> {
  const res = await fetch(`/api/messages/${encodeURIComponent(telefono)}`);
  if (!res.ok) throw new Error('Error al obtener mensajes');
  return res.json();
}

/** Enviar mensaje manual desde el CRM */
export async function sendMessage(telefono: string, mensaje: string): Promise<Mensaje> {
  const res = await fetch('/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telefono, mensaje }),
  });
  if (!res.ok) throw new Error('Error al enviar mensaje');
  const data = await res.json();
  return data.mensaje;
}
