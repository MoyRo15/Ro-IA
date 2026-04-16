import { useEffect, useRef, useState } from 'react';

const API_URL = '/api/chat';

function App() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('chatgpt4');
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('ro-ai-chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChat, setActiveChat] = useState(() => {
    return localStorage.getItem('ro-ai-active-chat') || null;
  });
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ro-ai-theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ro-ai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (activeChat) {
      const chat = chats.find(c => c.id === activeChat);
      if (chat) setMessages(chat.messages);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, status]);

  const saveChats = (newChats) => {
    setChats(newChats);
    localStorage.setItem('ro-ai-chats', JSON.stringify(newChats));
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: prompt.trim().slice(0, 30) || 'Nouvelle conversation',
      messages: [],
      createdAt: new Date().toISOString()
    };
    saveChats([newChat, ...chats]);
    setActiveChat(newChat.id);
    localStorage.setItem('ro-ai-active-chat', newChat.id);
    setMessages([]);
    setStatus('idle');
  };

  const selectChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
      localStorage.setItem('ro-ai-active-chat', chatId);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const newChats = chats.filter(c => c.id !== chatId);
    saveChats(newChats);
    if (activeChat === chatId) {
      setActiveChat(null);
      setMessages([]);
      localStorage.removeItem('ro-ai-active-chat');
    }
  };

  const sendPrompt = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    let currentChatId = activeChat;
    if (!currentChatId) {
      const newChat = {
        id: Date.now(),
        title: prompt.trim().slice(0, 30) || 'Nouvelle conversation',
        messages: [],
        createdAt: new Date().toISOString()
      };
      saveChats([newChat, ...chats]);
      setActiveChat(newChat.id);
      localStorage.setItem('ro-ai-active-chat', newChat.id);
      currentChatId = newChat.id;
    }

    const userMessage = { id: Date.now(), role: 'user', text: prompt.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setStatus('loading');
    setError(null);

    const updatedChats = chats.map(c => 
      c.id === currentChatId ? { ...c, messages: newMessages } : c
    );
    saveChats(updatedChats);

    const currentPrompt = prompt.trim();
    setPrompt('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt, model })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMessage = { id: Date.now() + 1, role: 'assistant', text: data.answer || 'Aucune réponse' };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      setStatus('success');

      const finalChats = chats.map(c => 
        c.id === currentChatId ? { ...c, messages: finalMessages } : c
      );
      saveChats(finalChats);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Erreur inconnue');
    }
  };

  const clearHistory = async () => {
    if (!activeChat) return;
    const newChats = chats.map(c => 
      c.id === activeChat ? { ...c, messages: [] } : c
    );
    saveChats(newChats);
    setMessages([]);
    setError(null);
    setStatus('idle');
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar - Dark */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} lg:w-64 flex-shrink-0 bg-navy dark:bg-navy-dark overflow-hidden transition-all duration-300`}>
        <div className="flex h-full w-64 flex-col bg-navy dark:bg-navy-dark">
          {/* Logo */}
          <div className="border-b border-white/10 p-4">
            <button
              onClick={createNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <p className="mb-2 px-3 text-xs font-medium uppercase text-white/40">Historique</p>
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10 ${
                    activeChat === chat.id ? 'bg-white/10' : ''
                  }`}
                >
                  <span className="truncate">{chat.title}</span>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="hidden rounded p-1 text-white/40 transition hover:bg-white/20 hover:text-white group-hover:block"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </button>
              ))}
              {chats.length === 0 && (
                <p className="px-3 text-sm text-white/40">Aucun historique</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange text-white">
                <span className="text-lg font-bold">R</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ro AI</p>
                <p className="text-xs text-white/60">Assistant IA</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-navy dark:text-white">
              Ro <span className="text-orange">AI</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </header>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange text-white">
                <span className="text-3xl font-bold">R</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-navy dark:text-white">Comment puis-je vous aider?</h2>
              <p className="max-w-md text-slate-500 dark:text-slate-400">
                Commencez une conversation en tapant votre message ci-dessous.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map(({ id, role, text }) => {
                const isUser = role === 'user';
                return (
                  <article
                    key={id}
                    className={`message-enter flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange text-white">
                        <span className="text-sm font-bold">R</span>
                      </div>
                    )}
                    <div className={`flex max-w-[75%] ${isUser ? 'items-start' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? 'bg-navy text-white'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {!isUser && <p className="mb-1 text-xs font-semibold text-orange">Ro AI</p>}
                        <p className="whitespace-pre-wrap text-sm">{text}</p>
                      </div>
                    </div>
                    {isUser && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </article>
                );
              })}

              {status === 'loading' && (
                <article className="message-enter flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange text-white">
                    <span className="text-sm font-bold">R</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                    <div className="h-2 w-2 rounded-full bg-slate-400 loading-dot dark:bg-slate-500" />
                    <div className="h-2 w-2 rounded-full bg-slate-400 loading-dot dark:bg-slate-500" />
                    <div className="h-2 w-2 rounded-full bg-slate-400 loading-dot dark:bg-slate-500" />
                  </div>
                </article>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto mb-2 w-full max-w-3xl px-4 lg:px-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
              Erreur: {error}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-700 lg:px-6">
          <form onSubmit={sendPrompt} className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="hidden w-24 rounded-lg border-0 bg-slate-100 py-1.5 text-xs font-medium text-slate-700 outline-none sm:block dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="chatgpt4">GPT-4</option>
              <option value="chatgpt3">GPT-3.5</option>
            </select>
            <input
              aria-label="Prompt utilisateur"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !prompt.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange text-white transition hover:bg-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="mt-3 flex justify-center gap-3">
            <button
              onClick={clearHistory}
              disabled={!activeChat || messages.length === 0}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Effacer l'historique
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;