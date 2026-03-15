import { useEffect, useRef } from 'react';
import type { Message, Contact } from '../types';

interface ChatWindowProps {
  messages: Message[];
  contact: Contact | null;
}

export default function ChatWindow({ messages, contact }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef<number>(0);

  useEffect(() => {
    // Solo auto-scrollear si hay mensajes nuevos, no cada vez que el polling actualiza la referencia del array
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  if (!contact) {
    return (
      <section className="flex-1 flex flex-col bg-[#f0f2f5] items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700">Select a conversation</h3>
          <p className="text-sm text-gray-400 mt-1">Choose a chat to start messaging</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-[#f0f2f5] relative min-w-0">
      {/* Chat Header */}
      <header className="p-4 bg-white border-b border-gray-200 flex justify-between items-center h-16 z-10">
        <div className="flex items-center">
          <img alt={contact.name} className="w-10 h-10 rounded-full mr-3" src={contact.avatar} />
          <div>
            <h3 className="font-semibold text-slate-800">{contact.name}</h3>
            <p className="text-xs text-brand-whatsapp flex items-center">
              {contact.online && (
                <>
                  <span className="w-2 h-2 bg-brand-whatsapp rounded-full mr-1"></span>
                  online
                </>
              )}
              {!contact.online && (
                <span className="text-gray-400">offline</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <button className="hover:text-slate-700 cursor-pointer">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
          <button className="hover:text-slate-700 cursor-pointer">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-sm relative ${
                msg.sent
                  ? 'bg-[#d9fdd3] rounded-tr-none'
                  : 'bg-white rounded-tl-none'
              }`}
            >
              <p className="text-sm text-slate-800">{msg.text}</p>
              <div className={`flex items-center mt-1 ${msg.sent ? 'justify-end' : ''}`}>
                <span className={`text-[10px] text-gray-400 ${msg.sent ? 'mr-1' : 'block text-right w-full'}`}>
                  {msg.timestamp}
                </span>
                {msg.sent && msg.read && (
                  <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}
