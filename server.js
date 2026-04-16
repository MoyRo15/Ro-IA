import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { onStart } from './chatgptfree.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174; // ✅ Variable Render

// ✅ CORS élargi pour prod + local
app.use(cors({
  origin: ['http://localhost:5173', 'https://ro-ia-1.onrender.com']
}));

app.use(express.json());

// ✅ Route API (avant le catch-all)
app.all('/api/chat', (req, res) => onStart({ req, res }));

// ✅ Servir le build Vite
app.use(express.static(path.join(__dirname, 'dist')));

// ✅ Fallback React (toujours en dernie
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ro AI backend proxy is running at http://localhost:${PORT}`);
});