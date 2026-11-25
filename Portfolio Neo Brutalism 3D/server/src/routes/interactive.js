import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import db from '../db/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Batasi POST agar tidak di-spam
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan, coba lagi nanti.' }
});

// Hilangkan karakter < > agar aman ditampilkan (React sudah meng-escape, ini lapisan tambahan)
const clean = (s) => s.replace(/[<>]/g, '').trim();

/* ---------- Kontak ---------- */
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(80),
  email: z.string().trim().email('Format email tidak valid').max(120),
  message: z.string().trim().min(10, 'Pesan minimal 10 karakter').max(2000)
});

async function sendMail({ name, email, message }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    console.log(`📩 [SMTP belum diatur] Pesan dari ${name} <${email}>: ${message}`);
    return false;
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  await transporter.sendMail({
    from: `"Portfolio" <${SMTP_USER}>`,
    to: MAIL_TO,
    replyTo: email,
    subject: `Pesan baru dari ${name}`,
    text: `Nama: ${name}\nEmail: ${email}\n\n${message}`
  });
  return true;
}

router.post(
  '/contact',
  postLimiter,
  asyncHandler(async (req, res) => {
    const data = contactSchema.parse(req.body);
    const safe = { name: clean(data.name), email: data.email, message: clean(data.message) };
    db.prepare('INSERT INTO messages (name, email, message) VALUES (@name, @email, @message)').run(safe);
    let emailed = false;
    try {
      emailed = await sendMail(safe);
    } catch (e) {
      console.error('Gagal kirim email:', e.message); // pesan tetap tersimpan
    }
    res.status(201).json({ ok: true, emailed });
  })
);

/* ---------- Guestbook ---------- */
const COLORS = ['#FFE500', '#FF6B9D', '#4D9DE0', '#7AE582', '#FFB347'];
const guestSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(40),
  message: z.string().trim().min(3, 'Pesan minimal 3 karakter').max(240)
});

router.get('/guestbook', (_req, res) => {
  res.json(db.prepare('SELECT * FROM guestbook ORDER BY id DESC LIMIT 60').all());
});

router.post(
  '/guestbook',
  postLimiter,
  asyncHandler(async (req, res) => {
    const data = guestSchema.parse(req.body);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const info = db
      .prepare('INSERT INTO guestbook (name, message, color) VALUES (?, ?, ?)')
      .run(clean(data.name), clean(data.message), color);
    res.status(201).json(db.prepare('SELECT * FROM guestbook WHERE id = ?').get(info.lastInsertRowid));
  })
);

/* ---------- Visitor counter ---------- */
router.get('/visitors', (_req, res) => {
  res.json(db.prepare('SELECT count FROM visitors WHERE id = 1').get());
});

router.post('/visitors', (_req, res) => {
  db.prepare('UPDATE visitors SET count = count + 1 WHERE id = 1').run();
  res.json(db.prepare('SELECT count FROM visitors WHERE id = 1').get());
});

export default router;
