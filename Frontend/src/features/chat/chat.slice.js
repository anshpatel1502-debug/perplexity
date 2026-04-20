import { createSlice } from "@reduxjs/toolkit";

const normalizeChatId = (chat) => chat?._id || chat?.id || chat?.chatId || null;

const ensureChat = (state, chatId) => {
  if (!chatId) return null;
  if (!state.chats[chatId]) {
    state.chats[chatId] = {
      id: chatId,
      title: "New chat",
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
  }
  return state.chats[chatId];
};

const normalizeChats = (payload) => {
  if (Array.isArray(payload)) {
    return payload.reduce((acc, chat) => {
      const id = normalizeChatId(chat);
      if (!id) return acc;
      acc[id] = {
        id,
        title: chat?.title || "Untitled chat",
        messages: Array.isArray(chat?.messages) ? chat.messages : [],
        lastUpdated: chat?.updatedAt || chat?.lastUpdated || new Date().toISOString(),
      };
      return acc;
    }, {});
  }

  if (payload && typeof payload === "object") {
    return payload;
  }

  return {};
};

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    loading: false,
    error: null,
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload || {};
      if (!chatId) return;

      state.chats[chatId] = {
        id: chatId,
        title: title || state.chats[chatId]?.title || "New chat",
        messages: state.chats[chatId]?.messages || [],
        lastUpdated: new Date().toISOString(),
      };
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role, ...rest } = action.payload || {};
      const chat = ensureChat(state, chatId);
      if (!chat) return;

      chat.messages.push({ content, role, ...rest });
      chat.lastUpdated = new Date().toISOString();
    },
    addMessage: (state, action) => {
      const { chatId, messages, ...singleMessage } = action.payload || {};
      const resolvedChatId = chatId || singleMessage.chatId;
      const chat = ensureChat(state, resolvedChatId);
      if (!chat) return;

      if (Array.isArray(messages)) {
        chat.messages.push(...messages);
      } else if (Object.keys(singleMessage).length > 0) {
        chat.messages.push(singleMessage);
      }
      chat.lastUpdated = new Date().toISOString();
    },
    removeMessageById: (state, action) => {
      const messageId = action.payload;
      if (!messageId) return;

      Object.values(state.chats).forEach((chat) => {
        chat.messages = (chat.messages || []).filter((message) => message?.id !== messageId);
      });
    },
    setChatMessages: (state, action) => {
      const { chatId, messages } = action.payload || {};
      const chat = ensureChat(state, chatId);
      if (!chat) return;

      chat.messages = Array.isArray(messages) ? messages : [];
      chat.lastUpdated = new Date().toISOString();
    },
    setChats: (state, action) => {
      state.chats = normalizeChats(action.payload);
    },
    setCurrentChatId: (state, action) => {
      const payload = action.payload;
      state.currentChatId = typeof payload === "string" ? payload : normalizeChatId(payload);
    },
    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload || null;
    },
    removeChat: (state, action) => {
      const chatId = action.payload;
      if (!chatId) return;

      delete state.chats[chatId];
      if (state.currentChatId === chatId) {
        state.currentChatId = null;
      }
    },
  },
});

export const {
  createNewChat,
  addNewMessage,
  addMessage,
  removeMessageById,
  setChatMessages,
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  removeChat,
} = chatSlice.actions;

export default chatSlice.reducer;
