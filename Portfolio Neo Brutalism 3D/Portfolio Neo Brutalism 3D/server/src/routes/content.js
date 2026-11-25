import { Router } from 'express';
import db from '../db/database.js';

const router = Router();
const parseJSON = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
};

// GET /api/projects?category=fullstack
router.get('/projects', (req, res) => {
  const { category } = req.query;
  const rows = category && category !== 'all'
    ? db.prepare('SELECT * FROM projects WHERE category = ? ORDER BY id DESC').all(String(category))
    : db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
  res.json(rows.map((r) => ({ ...r, stack: parseJSON(r.stack) })));
});

// GET /api/projects/:id
router.get('/projects/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
  res.json({ ...row, stack: parseJSON(row.stack) });
});

// GET /api/posts?q=react
router.get('/posts', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  let rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  rows = rows.map((r) => ({ ...r, tags: parseJSON(r.tags) }));
  if (q) {
    rows = rows.filter((r) =>
      [r.title_id, r.title_en, r.excerpt_id, r.excerpt_en, ...r.tags]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }
  res.json(rows);
});

router.get('/skills', (_req, res) => {
  res.json(db.prepare('SELECT * FROM skills ORDER BY level DESC').all());
});

router.get('/testimonials', (_req, res) => {
  res.json(db.prepare('SELECT * FROM testimonials ORDER BY id').all());
});

export default router;
