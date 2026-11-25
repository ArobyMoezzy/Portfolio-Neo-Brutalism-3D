import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { profile } from '../profile.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CV_PATH = path.resolve(__dirname, '../../assets/cv.pdf');

/**
 * Membuat PDF CV sederhana (satu halaman) tanpa dependensi tambahan.
 * Ganti dengan CV aslimu: cukup letakkan file PDF di server/assets/cv.pdf
 */
function buildPlaceholderPdf() {
  const esc = (s) => s.replace(/[\\()]/g, '\\$&');
  const lines = [
    ['F2', 26, profile.name.toUpperCase()],
    ['F1', 14, profile.role],
    ['F1', 11, ''],
    ['F1', 11, 'Ini CV placeholder. Ganti dengan CV aslimu:'],
    ['F1', 11, 'letakkan file PDF di server/assets/cv.pdf'],
    ['F1', 11, ''],
    ['F2', 13, 'Skill'],
    ['F1', 11, profile.skills.join(', ')],
    ['F1', 11, ''],
    ['F2', 13, 'Kontak'],
    ['F1', 11, `${profile.email}  |  ${profile.github}`]
  ];
  let y = 780;
  let stream = '';
  for (const [font, size, text] of lines) {
    stream += `BT /${font} ${size} Tf 56 ${y} Td (${esc(text)}) Tj ET\n`;
    y -= size + 12;
  }
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

// GET /api/cv/download
router.get('/cv/download', (_req, res) => {
  if (!fs.existsSync(CV_PATH)) {
    fs.mkdirSync(path.dirname(CV_PATH), { recursive: true });
    fs.writeFileSync(CV_PATH, buildPlaceholderPdf());
  }
  res.download(CV_PATH, profile.cvFileName);
});

export default router;
