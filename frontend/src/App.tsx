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

  // Cargar conversaciones al montar y hacer polling cada 5 segundos
  useEffect(() => {
    let isMounted = true;
    
    const loadConversations = () => {
      fetchConversations()
        .then((data) => {
          if (!isMounted) return;
          const mapped = data.map(mapConversacion);
          // Solo actualizar si hay cambios (en un escenario real usaríamos comparaciones más precisas, 
          // pero para React básico esto funciona para refrescar datos)
          setConversations(mapped);
          
          if (mapped.length > 0 && !selectedConvId) {
            setSelectedConvId(mapped[0].id);
          }
        })
        .catch((err) => {
          console.error('Error al cargar conversaciones:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    // Carga inicial
    loadConversations();

    // Polling cada 5 segundos
    const intervalId = setInterval(loadConversations, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedConvId]);

  // Cargar mensajes cuando cambia la conversación y hacer polling
  useEffect(() => {
    let isMounted = true;
    let intervalId: number;

    const loadMessages = () => {
       if (selectedConvId) {
          fetchMessages(selectedConvId)
            .then((data) => {
              if (!isMounted) return;
              const mapped = data.map(mapMensaje);
              setMessages(mapped);
            })
            .catch((err) => {
              console.error('Error al cargar mensajes:', err);
            });
        }
    };

    if (selectedConvId) {
       loadMessages(); // Carga inicial
       intervalId = setInterval(loadMessages, 3000); // Polling cada 3 segundos para el chat activo
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
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
        alert("❌ Error: No se pudo enviar tu mensaje por WhatsApp.\n\nPosibles causas:\n1. El Token de Meta guardado en Vercel está mal o ya expiró.\n2. Vercel todavía no termina de cargar la última versión de la app.\n\nPor favor, revisa tus variables de entorno en Vercel.");
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

      {activeNav === 'chats' ? (
        <>
          {/* Columna central - Chat */}
          <main className="flex-1 flex flex-row min-w-0 border-r border-gray-200 overflow-hidden">
            {/* Lista de conversaciones */}
            <ChatList
              conversations={conversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Ventana de chat + Input */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <ChatWindow messages={messages} contact={selectedContact} />
              <MessageInput onSend={handleSendMessage} disabled={!selectedConvId} />
            </div>
          </main>

          {/* Panel CRM derecho */}
          <ContactPanel contact={selectedContact} />
        </>
      ) : (
        <main className="flex-1 flex items-center justify-center bg-gray-50 flex-col">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-700 capitalize mb-2">Módulo de {activeNav}</h2>
          <p className="text-slate-500 max-w-md text-center">
            Esta sección está disponible para futuras configuraciones. Podrás monitorear <strong>{activeNav}</strong> aquí próximamente.
          </p>
        </main>
      )}
    </div>
  );
}

export default App;
