import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      alert("📎 El envío de archivos multimedia (imágenes, PDFs, etc.) por WhatsApp Business requiere una configuración avanzada en Meta Cloud API. Esta función estará disponible en la próxima actualización (v2.0).");
      // Reseteamos el input
      e.target.value = '';
    }
  };

  return (
    <footer className="p-4 bg-white border-t border-gray-200 relative">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl overflow-hidden">
          <EmojiPicker 
            onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)}
            searchDisabled={false}
            skinTonesDisabled
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* Emoji button */}
        <button 
          type="button"
          disabled={disabled}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* Attach button */}
        <label className={`p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>

        {/* Text input */}
        <input
          className="flex-1 border-none bg-gray-100 rounded-full px-4 py-2 focus:ring-0 focus:outline-none text-sm"
          placeholder={disabled ? 'Select a conversation' : 'Type a message'}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="bg-brand-whatsapp text-white p-2 rounded-full hover:bg-brand-whatsapp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
