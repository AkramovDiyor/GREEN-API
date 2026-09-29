const BASE_URL = "https://api.green-api.com";

export const sendMessage = async (idInstance, apiTokenInstance, chatId, message) => {
  const response = await fetch(`${BASE_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });
  return response.json();
};

export const receiveNotification = async (idInstance, apiTokenInstance) => {
  const response = await fetch(`${BASE_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`);
  if (!response.ok) return null;
  return response.json();
};

export const deleteNotification = async (idInstance, apiTokenInstance, receiptId) => {
  await fetch(`${BASE_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}?receiptId=${receiptId}`, {
    method: "DELETE",
  });
};