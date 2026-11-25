// Klien API tipis berbasis fetch
const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Terjadi kesalahan');
    err.details = data.details;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
};

export const CV_URL = `${BASE}/cv/download`;
