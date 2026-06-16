import axios from 'axios';

const chatAPI = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const sendMessage = async ({ chatId, message }) => {
  const response = await chatAPI.post(`/message`, {
    chat: chatId,
    chatId,
    message,
  });
  return response.data;
};

export const getChats = async () => {
  const response = await chatAPI.get('/api/chats/');
  return response.data;
};

export const getMessage = async (chatId) => {
  const response = await chatAPI.get(`/api/chats/${chatId}/messages`);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await chatAPI.delete(`/api/chats/delete/${chatId}`);
  return response.data;
};

export default chatAPI;