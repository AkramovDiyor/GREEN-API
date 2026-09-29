export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.endsWith('@c.us') ? cleaned : `${cleaned}@c.us`;
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};