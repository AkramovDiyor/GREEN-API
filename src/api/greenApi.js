
const BASE_URL = 'https://api.green-api.com';

export const sendMessageAPI = async (idInstance, apiTokenInstance, chatId, message) => {
  const response = await fetch(`${BASE_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
  return response.ok;
};

export const receiveNotificationAPI = async (idInstance, apiTokenInstance) => {
  const response = await fetch(`${BASE_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`);
  return response.json();
};

export const deleteNotificationAPI = async (idInstance, apiTokenInstance, receiptId) => {
  await fetch(`${BASE_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}?receiptId=${receiptId}`, {
    method: 'DELETE',
  });
};