// src/hooks/useGreenAPI.js
import { useState, useEffect } from 'react';
import { sendMessageAPI, receiveNotificationAPI, deleteNotificationAPI } from '../api/greenApi';

export const useGreenAPI = (auth) => {
  // Храним сообщения как словарь: { '7999@c.us': [msg1, msg2], '7998@c.us': [msg1] }
  const [messagesByChat, setMessagesByChat] = useState({});

  // Глобальный поллинг: работает, пока есть авторизация, независимо от открытого чата
  useEffect(() => {
    if (!auth) return;

    const poll = async () => {
      try {
        const data = await receiveNotificationAPI(auth.idInstance, auth.apiTokenInstance);

        if (data && data.receiptId) {
          const body = data.body || {};
          const text = body.textMessage || body.message;
          const chatId = body.chatId;

          // Обрабатываем только текстовые сообщения, где есть текст и chatId
          if ((body.typeMessage === 'textMessage' || !!text) && text && chatId) {
            const newMessage = {
              id: data.receiptId.toString(),
              text: text,
              sender: 'them',
              timestamp: body.timestampMessage ? body.timestampMessage * 1000 : Date.now(),
            };

            setMessagesByChat((prev) => {
              const chatMessages = prev[chatId] || [];
              // Защита от дублей
              if (chatMessages.find((m) => m.id === newMessage.id)) return prev;
              
              return {
                ...prev,
                [chatId]: [...chatMessages, newMessage],
              };
            });
          }

          // Всегда удаляем уведомление из очереди после обработки
          await deleteNotificationAPI(auth.idInstance, auth.apiTokenInstance, data.receiptId);
        }
      } catch (error) {
        // Игнорируем ошибки сети при поллинге, чтобы не спамить консоль
      }
    };

    const intervalId = setInterval(poll, 3000);
    return () => clearInterval(intervalId);
  }, [auth]);

  const sendMessage = async (chatId, text) => {
    if (!auth || !chatId || !text) return;

    const success = await sendMessageAPI(auth.idInstance, auth.apiTokenInstance, chatId, text);
    
    if (success) {
      const newMessage = {
        id: Date.now().toString(),
        text,
        sender: 'me',
        timestamp: Date.now(),
      };

      setMessagesByChat((prev) => {
        const chatMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: [...chatMessages, newMessage],
        };
      });
    }
    return success;
  };

  return { messagesByChat, sendMessage };
};