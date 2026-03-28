import { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:5174/api/chat';

function App() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('chatgpt4');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ro-ai-theme') === 'dark');
  const containerRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ro-ai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, status]);

  const sendPrompt = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: prompt.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), model })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMessage = { id: Date.now() + 1, role: 'assistant', text: data.answer || 'Aucune réponse' };
      setMessages((prev) => [...prev, aiMessage]);
      setPrompt('');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Erreur inconnue');
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setError(null);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-100 via-white to-cyan-100 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-900 transition-colors">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ro AI</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Assistant IA de roland ro pour vos recherches </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDark((v) => !v)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {isDark ? 'Mode Clair' : 'Mode Sombre'}
            </button>
            <div className="flex items-center gap-3 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span>{status === 'loading' ? '⏳ En cours...' : status === 'error' ? '❌ Erreur' : '✅ Prêt'}</span>
            </div>
          </div>
        </header>

        <form onSubmit={sendPrompt} className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            aria-label="Prompt utilisateur"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Écris ton prompt ici..."
            className="h-14 rounded-xl border px-4 text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="h-14 rounded-xl bg-cyan-600 px-6 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Envoyer
          </button>
          <div className="mt-2 flex items-center gap-2 md:col-span-2">
            <label htmlFor="model" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Modèle
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-10 rounded-lg border px-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="chatgpt4">chatgpt4</option>
              <option value="chatgpt3">chatgpt3</option>
            </select>
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
            Erreur : {error}
          </div>
        )}

        <div ref={containerRef} className="max-h-[58vh] space-y-3 overflow-y-auto pr-1 pb-2">
          {messages.length === 0 && <p className="text-sm text-slate-500">Commencez une conversation avec Ro AI.</p>}
          {messages.map(({ id, role, text }) => {
            const isUser = role === 'user';
            return (
              <article
                key={id}
                className={`rounded-2xl p-4 shadow-sm transition ${
                  isUser ? 'ml-auto max-w-[75%] bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-100' : 'mr-auto max-w-[85%] bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-100'
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{isUser ? 'Vous' : 'Ro AI'}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{text}</p>
              </article>
            );
          })}

          {status === 'loading' && (
            <article className="mr-auto max-w-[85%] animate-pulse rounded-2xl bg-slate-100 p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Ro AI</p>
              <p className="mt-1 text-sm">Génération en cours...</p>
            </article>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={clearHistory} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Effacer l'historique
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
