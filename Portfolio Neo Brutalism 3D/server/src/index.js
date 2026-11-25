import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { seedIfEmpty } from './db/seed.js';
import contentRoutes from './routes/content.js';
import interactiveRoutes from './routes/interactive.js';
import cvRoutes from './routes/cv.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

seedIfEmpty();

app.set('trust proxy', 1); // dibutuhkan di Render/Railway agar rate limit membaca IP asli
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim())
  })
);
app.use(express.json({ limit: '50kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limit umum untuk seluruh API
app.use(
  '/api',
  rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false })
);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api', contentRoutes);
app.use('/api', interactiveRoutes);
app.use('/api', cvRoutes);

// Opsional: sajikan hasil build frontend dari server yang sama (satu deploy)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 API berjalan di http://localhost:${PORT}`));
