import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  createNewChat,
  addMessage,
  removeMessageById,
  setChatMessages,
  removeChat,
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
} from "../chat.slice";
import {
  sendMessage,
  getMessage,
  getChats,
  deleteChat,
} from "../services/chat.api";

const getChatId = (chat) => chat?._id || chat?.id || chat?.chatId || null;

const normalizeMessage = (message, fallbackChatId = null) => ({
  id: message?._id || message?.id || `msg-${Date.now()}`,
  chatId: message?.chatId || message?.chat || fallbackChatId,
  content: message?.content || message?.context || "",
  role: message?.role || "ai",
  sender: message?.sender || message?.role || "ai",
  createdAt: message?.createdAt || new Date().toISOString(),
});

export const useChat = () => {
  const dispatch = useDispatch();

  const handleSendMessage = useCallback(
    async ({ message, chatId }) => {
      const trimmedMessage = message?.trim();
      if (!trimmedMessage) return null;

      const optimisticAiId = `temp-ai-${Date.now()}`;

      try {
        if (chatId) dispatch(setCurrentChatId(chatId));

        const optimisticUserId = `temp-user-${Date.now()}`;
        if (chatId) {
          dispatch(
            addMessage({
              id: optimisticUserId,
              chatId,
              content: trimmedMessage,
              role: "user",
              sender: "user",
            }),
          );
        }

        dispatch(
          addMessage({
            id: optimisticAiId,
            chatId: chatId || null,
            content: "Thinking...",
            role: "ai",
            sender: "ai",
            pending: true,
          }),
        );

        dispatch(setLoading(true));
        const data = await sendMessage({ chatId, message: trimmedMessage });
        const { chat, aiMessage } = data || {};
        const resolvedChatId = getChatId(chat) || chatId || null;

        if (getChatId(chat)) {
          dispatch(
            createNewChat({
              chatId: getChatId(chat),
              title: chat.title,
            }),
          );
          dispatch(setCurrentChatId(getChatId(chat)));
        }

        dispatch(removeMessageById(optimisticAiId));

        if (!chatId && resolvedChatId) {
          dispatch(
            addMessage(
              normalizeMessage(
                {
                  id: optimisticUserId,
                  content: trimmedMessage,
                  role: "user",
                  sender: "user",
                },
                resolvedChatId,
              ),
            ),
          );
        }

        if (aiMessage) {
          dispatch(addMessage(normalizeMessage(aiMessage, resolvedChatId)));
        }

        return data;
      } catch (error) {
        dispatch(removeMessageById(optimisticAiId));
        dispatch(
          setError(error?.response?.data?.message || "Failed to send message"),
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const handleGetChats = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getChats();
      const chats = Array.isArray(data?.chats) ? data.chats : [];
      dispatch(setChats(chats));

      if (chats.length > 0) {
        const firstChat = chats[0];
        dispatch(setCurrentChatId(getChatId(firstChat) || firstChat));
      }

      return chats;
    } catch (error) {
      dispatch(
        setError(error?.response?.data?.message || "Failed to load chats"),
      );
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const handleOpenChat = useCallback(
    async (chatId) => {
      if (!chatId) return [];

      try {
        dispatch(setLoading(true));
        const data = await getMessage(chatId);
        const formattedMessages = Array.isArray(data?.messages)
          ? data.messages.map((message) => normalizeMessage(message, chatId))
          : [];

        dispatch(setCurrentChatId(chatId));
        dispatch(
          setChatMessages({
            chatId,
            messages: formattedMessages,
          }),
        );

        return formattedMessages;
      } catch (error) {
        dispatch(
          setError(error?.response?.data?.message || "Failed to open chat"),
        );
        return [];
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const handleDeleteChat = useCallback(
    async (chatId) => {
      if (!chatId) return null;

      try {
        dispatch(setLoading(true));
        const response = await deleteChat(chatId);
        dispatch(removeChat(chatId));
        return response;
      } catch (error) {
        dispatch(
          setError(error?.response?.data?.message || "Failed to delete chat"),
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  return {
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleDeleteChat,
  };
};
