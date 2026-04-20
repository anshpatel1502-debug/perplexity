import axios from 'axios';

const chatAPI = axios.create({
  baseURL: 'http://localhost:3000/api/chats',
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
  const response = await chatAPI.get('/');
  return response.data;
};

export const getMessage = async (chatId) => {
  const response = await chatAPI.get(`/${chatId}/messages`);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await chatAPI.delete(`/delete/${chatId}`);
  return response.data;
};

export default chatAPI;