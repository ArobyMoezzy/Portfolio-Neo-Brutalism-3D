import 'dotenv/config';
import db from './database.js';

// Seed data awal. Ganti isinya dengan proyek dan data aslimu.
const projects = [
  {
    title: 'Portfolio Neo Brutalism 3D',
    category: 'fullstack',
    summary_id: 'Website portfolio ini: latar WebGL interaktif, logo teknologi 3D, dan transisi zoom.',
    summary_en: 'This very portfolio: interactive WebGL background, 3D tech logos, and a zoom transition.',
    description_id:
      'React + Vite di frontend, Express + SQLite di backend. Animasi dengan GSAP dan Motion, adegan 3D dengan Three.js, serta shader WebGL untuk latar yang bereaksi pada klik dan seret.',
    description_en:
      'React + Vite on the frontend, Express + SQLite on the backend. Animated with GSAP and Motion, 3D scene with Three.js, and a WebGL shader background that reacts to click and drag.',
    stack: ['React', 'Vite', 'Three.js', 'GSAP', 'Node.js', 'Express', 'SQLite'],
    demo_url: '',
    repo_url: 'https://github.com/',
    color: '#4D9DE0'
  },
  {
    title: 'Toko Kopi Nusantara',
    category: 'fullstack',
    summary_id: 'Platform e-commerce kopi lokal dengan keranjang dan pembayaran.',
    summary_en: 'Local coffee e-commerce platform with cart and checkout.',
    description_id:
      'Aplikasi e-commerce lengkap: katalog produk, keranjang, autentikasi JWT, dan dashboard admin untuk mengelola stok dan pesanan.',
    description_en:
      'Complete e-commerce app: product catalog, cart, JWT authentication, and an admin dashboard to manage stock and orders.',
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL'],
    demo_url: 'https://example.com',
    repo_url: 'https://github.com/',
    color: '#FFE500'
  },
  {
    title: 'TaskBoard Realtime',
    category: 'fullstack',
    summary_id: 'Papan tugas kolaboratif ala Kanban dengan update realtime.',
    summary_en: 'Collaborative Kanban-style task board with realtime updates.',
    description_id:
      'Drag and drop, komentar, dan sinkronisasi antar pengguna secara langsung menggunakan WebSocket.',
    description_en:
      'Drag and drop, comments, and live sync between users powered by WebSockets.',
    stack: ['React', 'Socket.IO', 'Node.js', 'MongoDB'],
    demo_url: 'https://example.com',
    repo_url: 'https://github.com/',
    color: '#FF6B9D'
  },
  {
    title: 'Cuaca Desa API',
    category: 'backend',
    summary_id: 'REST API prakiraan cuaca dengan cache dan rate limiting.',
    summary_en: 'Weather forecast REST API with caching and rate limiting.',
    description_id:
      'API ringan dengan dokumentasi OpenAPI, cache in-memory, dan pembatasan request per IP.',
    description_en:
      'Lightweight API with OpenAPI docs, in-memory caching, and per-IP request limiting.',
    stack: ['Node.js', 'Express', 'Redis'],
    demo_url: '',
    repo_url: 'https://github.com/',
    color: '#4D9DE0'
  },
  {
    title: 'Landing Page Brutal',
    category: 'frontend',
    summary_id: 'Kumpulan landing page bergaya neo brutalism yang responsif.',
    summary_en: 'A set of responsive neo brutalist landing pages.',
    description_id:
      'Komponen UI reusable dengan animasi mikro, dark mode, dan skor Lighthouse di atas 95.',
    description_en:
      'Reusable UI components with micro-animations, dark mode, and Lighthouse scores above 95.',
    stack: ['React', 'Vite', 'Framer Motion', 'CSS'],
    demo_url: 'https://example.com',
    repo_url: 'https://github.com/',
    color: '#7AE582'
  },
  {
    title: 'Absensi QR Sekolah',
    category: 'fullstack',
    summary_id: 'Sistem absensi siswa menggunakan QR code dan laporan otomatis.',
    summary_en: 'Student attendance system using QR codes and automatic reports.',
    description_id:
      'Scan QR untuk absen, rekap harian dan bulanan, serta ekspor laporan ke Excel dan PDF.',
    description_en:
      'Scan QR to check in, daily and monthly summaries, plus Excel and PDF report export.',
    stack: ['React', 'Express', 'MySQL'],
    demo_url: '',
    repo_url: 'https://github.com/',
    color: '#FFE500'
  },
  {
    title: 'Bot Pengingat Jadwal',
    category: 'backend',
    summary_id: 'Bot chat yang mengirim pengingat jadwal dan tugas otomatis.',
    summary_en: 'Chat bot that sends automatic schedule and task reminders.',
    description_id:
      'Penjadwalan dengan cron, integrasi webhook, dan penyimpanan preferensi per pengguna.',
    description_en:
      'Cron-based scheduling, webhook integration, and per-user preference storage.',
    stack: ['Node.js', 'Cron', 'SQLite'],
    demo_url: '',
    repo_url: 'https://github.com/',
    color: '#FF6B9D'
  }
];

const posts = [
  {
    title_id: 'Membuat Logo 3D dengan Three.js dan SVG',
    title_en: 'Building 3D Logos with Three.js and SVG',
    excerpt_id: 'Mengubah ikon SVG menjadi kartu 3D tebal yang bisa di-hover dan diputar.',
    excerpt_en: 'Turning SVG icons into thick 3D tiles you can hover and spin.',
    tags: ['threejs', 'frontend'],
    created_at: '2026-11-20'
  },
  {
    title_id: 'Kenapa Saya Jatuh Cinta pada Neo Brutalism',
    title_en: 'Why I Fell for Neo Brutalism',
    excerpt_id: 'Desain yang jujur, tegas, dan tidak malu-malu. Begini cara menerapkannya di CSS.',
    excerpt_en: 'Honest, bold, unapologetic design. Here is how to apply it in CSS.',
    tags: ['design', 'css'],
    created_at: '2026-10-12'
  },
  {
    title_id: 'Express + SQLite: Backend Kecil yang Cepat',
    title_en: 'Express + SQLite: A Small, Fast Backend',
    excerpt_id: 'Untuk proyek personal, SQLite sudah lebih dari cukup. Ini alasannya.',
    excerpt_en: 'For personal projects, SQLite is more than enough. Here is why.',
    tags: ['node', 'database'],
    created_at: '2026-09-28'
  },
  {
    title_id: 'Tips Optimasi React untuk Pemula',
    title_en: 'React Optimization Tips for Beginners',
    excerpt_id: 'Lazy loading, memoization, dan kapan sebaiknya tidak mengoptimasi.',
    excerpt_en: 'Lazy loading, memoization, and when you should not optimize.',
    tags: ['react', 'performance'],
    created_at: '2026-09-05'
  },
  {
    title_id: 'Belajar Konsisten Jadi Developer Full Stack',
    title_en: 'Staying Consistent as a Full Stack Developer',
    excerpt_id: 'Catatan perjalanan belajar frontend sampai backend tanpa burnout.',
    excerpt_en: 'Notes on learning frontend to backend without burning out.',
    tags: ['career', 'learning'],
    created_at: '2026-08-19'
  },
  {
    title_id: 'Animasi Hover yang Bikin Gemas dengan Framer Motion',
    title_en: 'Delightful Hover Animations with Framer Motion',
    excerpt_id: 'Dari tombol yang "tertekan" sampai kartu yang miring saat disentuh.',
    excerpt_en: 'From buttons that "press down" to cards that tilt on touch.',
    tags: ['react', 'animation'],
    created_at: '2026-07-30'
  }
];

const skills = [
  { name: 'React', level: 90, category: 'frontend', icon: '⚛️' },
  { name: 'JavaScript', level: 92, category: 'frontend', icon: '🟨' },
  { name: 'TypeScript', level: 75, category: 'frontend', icon: '🔷' },
  { name: 'HTML & CSS', level: 90, category: 'frontend', icon: '🎨' },
  { name: 'Node.js', level: 88, category: 'backend', icon: '🟩' },
  { name: 'Express', level: 88, category: 'backend', icon: '🚂' },
  { name: 'SQL / SQLite', level: 80, category: 'database', icon: '🗄️' },
  { name: 'MongoDB', level: 72, category: 'database', icon: '🍃' },
  { name: 'Git & GitHub', level: 85, category: 'tools', icon: '🐙' },
  { name: 'REST API', level: 90, category: 'backend', icon: '🔌' }
];

const testimonials = [
  {
    name: 'Rina Kusuma',
    role: 'Product Manager',
    quote_id: 'Robi cepat paham kebutuhan dan hasilnya rapi. Komunikasinya enak, deadline selalu aman.',
    quote_en: 'Robi quickly understands requirements and delivers clean work. Great communication, deadlines always safe.'
  },
  {
    name: 'Dimas Pratama',
    role: 'Startup Founder',
    quote_id: 'Dari frontend sampai backend dikerjakan sendiri dan kualitasnya konsisten. Sangat direkomendasikan.',
    quote_en: 'Handled everything from frontend to backend alone with consistent quality. Highly recommended.'
  },
  {
    name: 'Sari Wulandari',
    role: 'UI Designer',
    quote_id: 'Desain saya diterjemahkan ke kode hampir pixel perfect. Jarang ketemu developer seperti ini.',
    quote_en: 'My designs were translated to code almost pixel perfect. Rare to find a developer like this.'
  }
];

const seed = db.transaction(() => {
  db.exec('DELETE FROM projects; DELETE FROM posts; DELETE FROM skills; DELETE FROM testimonials;');

  const insProject = db.prepare(`INSERT INTO projects
    (title, category, summary_id, summary_en, description_id, description_en, stack, demo_url, repo_url, color)
    VALUES (@title, @category, @summary_id, @summary_en, @description_id, @description_en, @stack, @demo_url, @repo_url, @color)`);
  projects.forEach((p) => insProject.run({ ...p, stack: JSON.stringify(p.stack) }));

  const insPost = db.prepare(`INSERT INTO posts
    (title_id, title_en, excerpt_id, excerpt_en, tags, created_at)
    VALUES (@title_id, @title_en, @excerpt_id, @excerpt_en, @tags, @created_at)`);
  posts.forEach((p) => insPost.run({ ...p, tags: JSON.stringify(p.tags) }));

  const insSkill = db.prepare(
    'INSERT INTO skills (name, level, category, icon) VALUES (@name, @level, @category, @icon)'
  );
  skills.forEach((s) => insSkill.run(s));

  const insTesti = db.prepare(
    'INSERT INTO testimonials (name, role, quote_id, quote_en) VALUES (@name, @role, @quote_id, @quote_en)'
  );
  testimonials.forEach((t) => insTesti.run(t));
});

export function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM projects').get();
  if (c === 0) {
    seed();
    console.log('🌱 Database di-seed dengan data awal');
  }
}

// Jalankan langsung: npm run seed
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed();
  console.log('🌱 Seed selesai (data lama diganti)');
}
