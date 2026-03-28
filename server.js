import express from 'express';
import cors from 'cors';
import { onStart } from './chatgptfree.js';

const app = express();
const PORT = 5174;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.all('/api/chat', (req, res) => onStart({ req, res }));

app.listen(PORT, () => {
  console.log(`Ro AI backend proxy is running at http://localhost:${PORT}`);
});
