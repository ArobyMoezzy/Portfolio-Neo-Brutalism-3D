import { ZodError } from 'zod';

// Pembungkus agar error async diteruskan ke error handler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
}

// Error handler terpusat
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validasi gagal',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))
    });
  }
  console.error('❌', err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Terjadi kesalahan pada server' : err.message
  });
}
