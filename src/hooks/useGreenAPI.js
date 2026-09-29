import { useState, useEffect, useCallback } from 'react';
import { sendMessage as apiSendMessage, receiveNotification, deleteNotification } from '../api'; 

export const useGreenAPI = (auth) => {
  const [messagesByChat, setMessagesByChat] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (chatId, text) => {
    if (!auth || !chatId) return;
    setIsLoading(true);
    try {
      const response = await apiSendMessage(auth.idInstance, auth.apiTokenInstance, chatId, text);
      
      if (response.idMessage) {
        const newMessage = {
          id: response.idMessage,
          text,
          sender: 'me',
          timestamp: Date.now(),
        };
        
        setMessagesByChat((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), newMessage],
        }));
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (!auth) return;

    const poll = async () => {
      try {
        const data = await receiveNotification(auth.idInstance, auth.apiTokenInstance);

        if (data && data.receiptId) {
          const body = data.body || {};
          const text = body.textMessage || body.message;
          const isText = body.typeMessage === 'textMessage' || !!text;
          const chatId = body.chatId;

          if (isText && chatId && text) {
            const incomingMessage = {
              id: data.receiptId.toString(),
              text: text,
              sender: 'them',
              timestamp: body.timestampMessage ? body.timestampMessage * 1000 : Date.now(),
            };
            
            setMessagesByChat((prev) => ({
              ...prev,
              [chatId]: [...(prev[chatId] || []), incomingMessage],
            }));
          }

          await deleteNotification(auth.idInstance, auth.apiTokenInstance, data.receiptId);
        }
      } catch (error) {
      }
    };

    const intervalId = setInterval(poll, 3000);
    return () => clearInterval(intervalId);
  }, [auth]);

  return { messagesByChat, sendMessage, isLoading };
};