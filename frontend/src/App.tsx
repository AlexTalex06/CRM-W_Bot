import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import ContactPanel from './components/ContactPanel';
import { fetchConversations, fetchMessages, sendMessage } from './api';
import { mapConversacion, mapMensaje } from './types';
import type { Conversation, Message } from './types';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('chats');
  const [loading, setLoading] = useState(true);

  // Cargar conversaciones al montar
  useEffect(() => {
    fetchConversations()
      .then((data) => {
        const mapped = data.map(mapConversacion);
        setConversations(mapped);
        if (mapped.length > 0) {
          setSelectedConvId(mapped[0].id);
        }
      })
      .catch((err) => {
        console.error('Error al cargar conversaciones:', err);
        // Si no hay conexión, mostrar el dashboard vacío
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Cargar mensajes cuando cambia la conversación
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId)
        .then((data) => {
          const mapped = data.map(mapMensaje);
          setMessages(mapped);
        })
        .catch((err) => {
          console.error('Error al cargar mensajes:', err);
          setMessages([]);
        });
    }
  }, [selectedConvId]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedConvId) return;
      try {
        const newMsg = await sendMessage(selectedConvId, text);

        if (newMsg) {
          const mapped = mapMensaje(newMsg);
          setMessages((prev) => [...prev, mapped]);

          // Actualizar último mensaje en la lista
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedConvId
                ? { ...conv, lastMessage: text, lastMessageTime: mapped.timestamp }
                : conv
            )
          );
        }
      } catch (err) {
        console.error('Error al enviar mensaje:', err);
        // Agregar mensaje localmente aunque falle el envío por WhatsApp
        const localMsg: Message = {
          id: `local-${Date.now()}`,
          conversationId: selectedConvId,
          text,
          timestamp: new Date().toLocaleTimeString('es-MX', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          sent: true,
          read: false,
        };
        setMessages((prev) => [...prev, localMsg]);
      }
    },
    [selectedConvId]
  );

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || null;
  const selectedContact = selectedConversation?.contact || null;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-whatsapp border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Sidebar de navegación */}
      <Sidebar activeItem={activeNav} onItemClick={setActiveNav} />

      {/* Columna central - Chat */}
      <main className="flex-1 flex flex-row min-w-0 border-r border-gray-200">
        {/* Lista de conversaciones */}
        <ChatList
          conversations={conversations}
          selectedId={selectedConvId}
          onSelect={setSelectedConvId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Ventana de chat + Input */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow messages={messages} contact={selectedContact} />
          <MessageInput onSend={handleSendMessage} disabled={!selectedConvId} />
        </div>
      </main>

      {/* Panel CRM derecho */}
      <ContactPanel contact={selectedContact} />
    </div>
  );
}

export default App;
