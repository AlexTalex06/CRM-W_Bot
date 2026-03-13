// ============================================================
// types.ts — Tipos de datos del CRM
// Coinciden con el modelo de datos de Supabase
// ============================================================

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  created_at: string;
}

export interface Mensaje {
  id: string;
  telefono: string;
  mensaje: string;
  remitente: 'cliente' | 'negocio';
  created_at: string;
}

export interface Conversacion {
  id: string;
  nombre: string;
  telefono: string;
  created_at: string;
  ultimoMensaje: string;
  ultimoMensajeTime: string;
  remitente: string;
}

// Para compatibilidad con los componentes existentes
export interface Contact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  leadStatus: 'new' | 'active' | 'closed';
  leadTag: string;
  deals: Deal[];
  tasks: Task[];
  notes: string;
  online: boolean;
  telefono?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  closingDate: string;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  dueInfo: string;
  completed: boolean;
  overdue: boolean;
}

export interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  timestamp: string;
  sent: boolean;
  read: boolean;
}

// --- Funciones de mapeo: Supabase → Componentes ---

const AVATAR_COLORS = ['#25D366', '#1E40AF', '#7C3AED', '#DB2777', '#EA580C', '#0891B2'];

/**
 * Genera un avatar basado en las iniciales del nombre
 */
function getAvatarUrl(nombre: string): string {
  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  const colorIndex = nombre.length % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIndex].replace('#', '');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=128&bold=true`;
}

/**
 * Convertir Conversacion (Supabase) a Conversation (componentes)
 */
export function mapConversacion(conv: Conversacion): Conversation {
  return {
    id: conv.telefono, // Usamos el teléfono como ID
    contact: {
      id: conv.id,
      name: conv.nombre || conv.telefono,
      avatar: getAvatarUrl(conv.nombre || conv.telefono),
      role: '',
      company: '',
      leadStatus: 'new',
      leadTag: 'Cliente',
      deals: [],
      tasks: [],
      notes: '',
      online: false,
      telefono: conv.telefono,
    },
    lastMessage: conv.ultimoMensaje,
    lastMessageTime: formatTime(conv.ultimoMensajeTime),
    unreadCount: 0,
  };
}

/**
 * Convertir Mensaje (Supabase) a Message (componentes)
 */
export function mapMensaje(msg: Mensaje): Message {
  return {
    id: msg.id,
    conversationId: msg.telefono,
    text: msg.mensaje,
    timestamp: formatTime(msg.created_at),
    sent: msg.remitente === 'negocio',
    read: true,
  };
}

/**
 * Formatear timestamp para mostrar en la UI
 */
function formatTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    }
  } catch {
    return isoString;
  }
}
