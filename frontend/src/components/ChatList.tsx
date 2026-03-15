import type { Conversation } from '../types';

interface ChatListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat?: () => void;
}

export default function ChatList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  onNewChat,
}: ChatListProps) {
  const filtered = conversations.filter((conv) =>
    conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-white border-b border-gray-200 flex justify-between items-center h-16 shrink-0">
        <h2 className="font-bold text-xl text-slate-800">Messages</h2>
        <button 
          onClick={() => {
            if (onNewChat) {
              onNewChat();
            } else {
              alert("Función 'Nuevo Chat' en desarrollo. Próximamente podrás iniciar conversaciones desde aquí.");
            }
          }}
          className="p-2 text-slate-500 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
          title="Nuevo Chat (Próximamente)"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </header>

      {/* Search */}
      <div className="p-3 bg-white">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
          <input
            className="block w-full pl-10 pr-3 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-brand-whatsapp focus:outline-none"
            placeholder="Search chats..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List Items */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filtered.map((conv) => {
          const isActive = conv.id === selectedId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex items-center p-4 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-gray-50 border-r-4 border-brand-whatsapp'
                  : 'hover:bg-gray-50 border-b border-gray-50'
              }`}
            >
              <img
                alt={conv.contact.name}
                className="w-12 h-12 rounded-full mr-3 object-cover"
                src={conv.contact.avatar}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-slate-800 truncate">{conv.contact.name}</h3>
                  <span className="text-[10px] text-gray-500">{conv.lastMessageTime}</span>
                </div>
                <p className={`text-sm truncate ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="ml-2 w-5 h-5 bg-brand-whatsapp text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
