// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { useGreenAPI } from './hooks/useGreenAPI';
import { formatPhone, formatTime } from './utils';
import { Send, Plus, User, LogOut, Phone } from 'lucide-react';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('green_api_auth');
    if (savedAuth) setAuth(JSON.parse(savedAuth));
    
    const savedChats = localStorage.getItem('green_api_chats');
    if (savedChats) setChats(JSON.parse(savedChats));
  }, []);

  // Передаем только auth, поллинг теперь глобальный
  const { messagesByChat, sendMessage } = useGreenAPI(auth);

  // Берем сообщения ТОЛЬКО для текущего открытого чата
  const currentChatPhone = currentChat ? formatPhone(currentChat.phone) : null;
  const currentMessages = currentChatPhone ? (messagesByChat[currentChatPhone] || []) : [];

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, currentChatPhone]);

  // Синхронизация сайдбара: если пришло сообщение в любой чат, обновляем его "последнее сообщение"
  useEffect(() => {
    if (!auth || Object.keys(messagesByChat).length === 0) return;

    setChats((prevChats) => {
      let hasChanges = false;
      const updatedChats = prevChats.map((chat) => {
        const msgs = messagesByChat[chat.phone];
        if (msgs && msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (chat.lastMessage !== lastMsg.text || chat.timestamp !== lastMsg.timestamp) {
            hasChanges = true;
            return { ...chat, lastMessage: lastMsg.text, timestamp: lastMsg.timestamp };
          }
        }
        return chat;
      });

      // Если пришло сообщение в чат, которого еще нет в сайдбаре (например, нам написали первыми), добавляем его
      Object.keys(messagesByChat).forEach((chatId) => {
        if (!updatedChats.find((c) => c.phone === chatId)) {
          const msgs = messagesByChat[chatId];
          const lastMsg = msgs[msgs.length - 1];
          updatedChats.push({
            phone: chatId,
            name: `+${chatId.replace('@c.us', '')}`,
            lastMessage: lastMsg.text,
            timestamp: lastMsg.timestamp,
          });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem('green_api_chats', JSON.stringify(updatedChats));
        return updatedChats;
      }
      return prevChats;
    });
  }, [messagesByChat, auth]);

  const handleLogout = () => {
    localStorage.removeItem('green_api_auth');
    setAuth(null);
    setCurrentChat(null);
  };

  const createNewChat = () => {
    if (!newPhone.trim()) return;
    const formatted = formatPhone(newPhone);
    const newChat = { 
      phone: formatted, 
      name: `+${formatted.replace('@c.us', '')}`, 
      timestamp: Date.now() 
    };
    
    const updatedChats = [newChat, ...chats.filter((c) => c.phone !== formatted)];
    setChats(updatedChats);
    localStorage.setItem('green_api_chats', JSON.stringify(updatedChats));
    
    setCurrentChat(newChat);
    setNewPhone('');
    setShowNewChat(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !currentChat) return;
    
    const success = await sendMessage(currentChatPhone, inputText.trim());
    
    if (success) {
      // Обновляем сайдбар сразу после отправки
      const updatedChats = chats.map((c) => 
        c.phone === currentChatPhone 
          ? { ...c, lastMessage: inputText.trim(), timestamp: Date.now() } 
          : c
      );
      setChats(updatedChats);
      localStorage.setItem('green_api_chats', JSON.stringify(updatedChats));
      setInputText('');
    }
  };

  if (!auth) return <AuthScreen onAuth={setAuth} />;

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* ЛЕВАЯ КОЛОНКА: Список чатов */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="font-bold text-lg text-gray-800">Чаты</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowNewChat(!showNewChat)} 
              className="p-2 hover:bg-gray-100 rounded-full transition" 
              title="Новый чат"
            >
              <Plus className="w-5 h-5 text-primary" />
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2 hover:bg-red-50 rounded-full transition" 
              title="Выйти"
            >
              <LogOut className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {showNewChat && (
          <div className="p-4 bg-white border-b border-gray-200">
            <input
              type="text"
              placeholder="79991234567"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary outline-none"
              onKeyDown={(e) => e.key === 'Enter' && createNewChat()}
            />
            <button 
              onClick={createNewChat} 
              className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primaryHover transition"
            >
              Начать чат
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Нет активных чатов</div>
          ) : (
            // Сортируем чаты: те, где есть новые сообщения (или более поздний timestamp), идут выше
            [...chats].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((chat) => (
              <div
                key={chat.phone}
                onClick={() => setCurrentChat(chat)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition border-l-4 ${
                  currentChat?.phone === chat.phone 
                    ? 'bg-blue-50 border-primary' 
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'Нет сообщений'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: Окно текущего чата */}
      <div className="flex-1 flex flex-col bg-bgChat">
        {currentChat ? (
          <>
            <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{currentChat.name}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">
                  Напишите первое сообщение
                </div>
              )}
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.sender === 'me'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-bubbleThem text-gray-900 rounded-bl-none border border-gray-100'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Введите сообщение..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none max-h-32 min-h-[48px]"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="bg-primary hover:bg-primaryHover disabled:bg-gray-300 text-white p-3 rounded-xl transition flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600">MAX Web</h3>
            <p className="text-sm mt-2">Выберите чат или создайте новый, чтобы начать общение</p>
          </div>
        )}
      </div>
    </div>
  );
}