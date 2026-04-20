import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { MessageSquarePlus, SendHorizonal } from "lucide-react";
import { setCurrentChatId } from "../chat.slice";
import { useChat } from "../hooks/useChat";
import remarkGfm from "remark-gfm";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { chats, currentChatId, loading, error } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth.user);
  const { handleGetChats, handleOpenChat, handleSendMessage, handleDeleteChat } = useChat();

  const [query, setQuery] = useState("");
  const messagesEndRef = useRef(null);

  const chatList = useMemo(() => {
    return Object.values(chats || {}).sort(
      (a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
    );
  }, [chats]);

  const activeChat = currentChatId ? chats?.[currentChatId] : null;
  const messages = activeChat?.messages || [];

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
    setQuery("");
  };

  const handleDeleteChatClick = async (event, chatId) => {
    event.stopPropagation();
    if (!chatId) return;

    try {
      await handleDeleteChat(chatId);
      const loadedChats = await handleGetChats();
      if (Array.isArray(loadedChats) && loadedChats.length > 0) {
        const firstChatId = loadedChats[0]?._id || loadedChats[0]?.id;
        if (firstChatId) {
          await handleOpenChat(firstChatId);
        }
      } else {
        dispatch(setCurrentChatId(null));
      }
    } catch {
      // Error state is already handled in useChat.
    }
  };

  const onSendMessage = async () => {
    const message = query.trim();
    if (!message || loading) return;

    try {
      await handleSendMessage({ message, chatId: currentChatId });
      setQuery("");
    } catch {
      // Error state is already handled in useChat.
    }
  };

  useEffect(() => {
    const bootstrapChats = async () => {
      const loadedChats = await handleGetChats();
      if (Array.isArray(loadedChats) && loadedChats.length > 0) {
        const firstChatId = loadedChats[0]?._id || loadedChats[0]?.id;
        if (firstChatId) {
          await handleOpenChat(firstChatId);
        }
      }
    };

    bootstrapChats();
  }, [handleGetChats, handleOpenChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-4">
        <div className="mb-4">
          <h1 className="bg-linear-to-r from-sky-400 to-cyan-300 bg-clip-text text-xl font-semibold text-transparent">
            Perplexity
          </h1>
        </div>

        <button
          onClick={handleNewChat}
          className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium hover:border-slate-600 hover:bg-slate-700"
        >
          <MessageSquarePlus size={16} />
          Create New Chat
        </button>

        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">All Chats</p>
        <div className="space-y-2 overflow-y-auto pr-1">
          {chatList.length === 0 && (
            <p className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400">
              No chats yet. Start by asking a question.
            </p>
          )}

          {chatList.map((chat) => {
            const isActive = chat.id === currentChatId;
            return (
              <div
                key={chat.id}
                className={`group w-full rounded-xl border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-sky-500/50 bg-sky-500/10"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={async () => {
                    await handleOpenChat(chat.id);
                  }}
                  className="mb-1 w-full text-left text-sm font-medium"
                >
                  <span className="line-clamp-1">{chat.title || "Untitled chat"}</span>
                </button>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(chat.lastUpdated || Date.now()).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded px-1 text-sky-300 hover:bg-sky-500/10 hover:text-sky-200"
                      onClick={async () => await handleOpenChat(chat.id)}
                    >
                      open
                    </button>
                    <button
                      type="button"
                      className="rounded px-1 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                      onClick={(event) => handleDeleteChatClick(event, chat.id)}
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-800 px-4 md:px-6">
          <p className="text-sm text-slate-300">{activeChat?.title || "Ask anything"}</p>
          <p className="text-xs text-slate-500">{user?.username || user?.email || "Guest"}</p>
        </header>

        <section className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
          {error && (
            <div className="mx-auto mb-4 max-w-3xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && chatList.length === 0 && (
            <div className="mx-auto max-w-3xl rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
              Loading your chats...
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="mx-auto mt-16 max-w-3xl text-center">
              <h2 className="mb-2 text-2xl font-semibold text-slate-100">Where knowledge begins</h2>
              <p className="text-sm text-slate-400">
                Ask a technical question, request a summary, or explore an idea in depth.
              </p>
            </div>
          )}

          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message, index) => {
              const key = message?.id || `${message?.role || "assistant"}-${index}`;
              const isUser = (message?.role || message?.sender) === "user";

              return (
                <article
                  key={key}
                  className={`rounded-2xl border px-6 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "ml-auto max-w-fit border-sky-500/30 bg-sky-500/10"
                      : "max-w-fit border-slate-800 bg-slate-900"
                  }`}
                >
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">{isUser ? "You" : "Assistant"}</p>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message?.content || message?.context || ""}</ReactMarkdown>
                  </div>
                </article>
              );
            })}

            {/* {loading && messages.length > 0 && (
              <div className="max-w-fit rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
                Thinking...
              </div>
            )} */}
            <div ref={messagesEndRef} />
          </div>
        </section>

        <footer className="border-t border-slate-800 px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2">
            <textarea
              rows={1}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Ask anything..."
              className="max-h-40 min-h-11 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={onSendMessage}
              disabled={loading || !query.trim()}
              className="rounded-xl bg-sky-500 px-3 py-2 text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizonal size={16} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;