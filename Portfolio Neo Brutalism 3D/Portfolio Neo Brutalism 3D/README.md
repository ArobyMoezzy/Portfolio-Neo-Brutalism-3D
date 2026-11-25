# Portfolio Neo Brutalism: Fajrur Robi Sya'bani

Stack: **React (Vite)** di frontend, **Node.js + Express + SQLite** di backend.

Library frontend: **Three.js** (scene 3D), **GSAP** (intro film + ScrollTrigger + SplitText),
**Motion** (Framer Motion generasi baru, `motion/react`), **React Bits** (LogoLoop, SplitText, Magnet,
ClickSpark, CountUp, ScrollVelocity), **Lucide** (ikon UI), **react-icons / Simple Icons** (logo teknologi),
dan **Google Fonts** (Archivo Black, Bebas Neue, Space Grotesk, Space Mono).

## Struktur folder

```
portfolio/
├── package.json            # skrip gabungan (npm run dev)
├── client/                 # React + Vite
│   ├── index.html          # meta SEO + Open Graph
│   ├── public/             # og-image.jpg, _redirects (Netlify)
│   ├── vercel.json         # SPA rewrite (Vercel)
│   └── src/
│       ├── config.js       # DATA PRIBADI (nama, email, sosmed, daftar logo teknologi)
│       ├── lib/gsap.js     # registrasi plugin GSAP
│       ├── api.js          # klien fetch
│       ├── assets/         # profile.jpg + profile-spidey.jpg
│       ├── i18n/           # teks Indonesia / Inggris
│       ├── hooks/          # useTheme, useLang, useFetch, useTyping, useKonami
│       ├── components/     # ui.jsx (BrutalButton, BrutalCard, Sticker, Badge,
│       │                   #   Marquee, Modal, Reveal), Intro (film), HeroScene (Three.js),
│       │                   #   Tilt (3D), TechLogos + techIcons (logo brand), ProfilePhoto, dll.
│       │   └── reactbits/  # komponen React Bits (lihat LICENSE-REACTBITS.md)
│       ├── pages/          # Home, NotFound (404)
│       └── styles/global.css
└── server/                 # Express API
    ├── .env.example
    ├── assets/             # taruh cv.pdf di sini
    └── src/
        ├── index.js        # helmet, cors, rate limit, error handler
        ├── db/             # database.js (skema) + seed.js
        ├── middleware/
        └── routes/         # content, interactive (contact/guestbook/visitors), cv
```

## Instalasi dan menjalankan

Prasyarat: Node.js 18+ (diuji di Node 22).

```bash
npm run install:all                      # install root + server + client
cp server/.env.example server/.env       # lalu isi jika perlu
npm run dev                              # API :5000 dan web :5173 sekaligus
```

Buka http://localhost:5173. Database SQLite dan data awal dibuat otomatis saat server pertama jalan.
Untuk mengulang seed: `npm --prefix server run seed`.

## Kenapa SQLite?

Untuk portfolio, SQLite (better-sqlite3) cukup: tanpa server database terpisah, satu file, cepat,
dan mudah di-backup. Kalau nanti trafik/fitur membesar, skema tinggal dipindah ke PostgreSQL/MongoDB.
Catatan: di hosting gratis dengan disk sementara (mis. Render free), data guestbook/visitor bisa
hilang saat redeploy. Pakai persistent disk atau pindah ke database terkelola jika itu penting.

## Mengganti foto dan data pribadi

| Yang diganti | Lokasi |
|---|---|
| Foto asli / foto Spider-Man | timpa `client/src/assets/profile.jpg` dan `profile-spidey.jpg` (rasio 1:1, ideal 900x900, pose/posisi sama agar transisi mulus) |
| Gambar latar grid biru | timpa `client/src/assets/bg-grid.jpg` (dipakai sebagai tekstur WebGL dan fallback CSS) |
| Gambar preview link (OG) | `client/public/og-image.jpg` |
| Nama, email, sosmed | `client/src/config.js` |
| Teks UI, "Tentang", Perjalanan (pengalaman), teks intro | `client/src/i18n/translations.js` |
| Judul besar di intro film | `client/src/components/Intro.jsx` |
| Logo teknologi di cincin 3D | `techStack` di `client/src/config.js` (id logo ada di `components/techIcons.jsx`) |
| Data sisi server (nama, email, GitHub, isi CV placeholder) | `server/src/profile.js` (atau `PROFILE_EMAIL` / `PROFILE_GITHUB` di `server/.env`) |
| Proyek, skill, catatan, testimoni | array di `server/src/db/seed.js`, lalu `npm --prefix server run seed` |
| CV | letakkan PDF di `server/assets/cv.pdf` (jika tidak ada, dibuat CV placeholder) |
| Email form kontak | isi `SMTP_*` dan `MAIL_TO` di `server/.env` (Gmail: pakai App Password) |

> Data proyek, skill, testimoni, pengalaman, dan fun facts di dalam project ini hanyalah **contoh**.
> Ganti dengan data aslimu sebelum dipublikasikan.

## Fitur V3: latar interaktif dan gerbang PROJECT

- **Latar gambar neo brutalism** (grid biru + pita kuning) dirender lewat WebGL2 di belakang seluruh halaman. Klik membuat riak, seret menggeser latar dengan inersia, hover memberi efek lensa, scroll memberi parallax.
- **Gerbang "PROJECT"**: tulisan raksasa di-pin saat scroll, lalu di-zoom menembus huruf O seperti pindah halaman. Di dalam lubang O latar berubah menjadi **contour line** (garis hitam di kertas putih, dibalik di dark mode) dan tetap dipakai untuk sisa halaman. Kartu "Proyek" lalu muncul zoom-out.
- Urutan: Proyek, Perjalanan, Catatan, Kata Mereka, Game Iseng, Buku Tamu, Hubungi Saya, SEE YOU, TIGER (semua fitur V2 tetap).
- Fallback: tanpa WebGL dipakai gambar CSS; `prefers-reduced-motion` menampilkan gerbang statis tanpa zoom.
- Contour dibuat prosedural (shader), jadi tajam di semua ukuran layar. Berkas: `components/PageBackground.jsx`, `components/ProjectGate.jsx`, `styles/v3.css`.

## Fitur V3.1: logo 3D dan interaksi

- **Logo teknologi 3D di hero** (`HeroScene.jsx`): kartu tebal berkontur dengan logo JavaScript, GitHub, React, TypeScript, Node.js, Three.js, GSAP, Git. Melayang, miring mengikuti kursor, membesar saat di-hover, berputar 360 derajat saat diklik. Ubah daftar/warna di `HeroScene.jsx` (`TILE` dan pemanggilan `add(...)`).
- **Lebih hidup**: jejak kursor berupa kotak warna (`CursorTrail.jsx`), lencana "Terbuka untuk proyek" dengan jam WIB (`LiveBadge.jsx`), huruf nama yang memantul saat di-hover, kartu yang terangkat dan badge yang bergoyang.

## Fitur

- **Intro ala film** (GSAP timeline): hitung mundur film leader 3-2-1, butiran film dan goresan, letterbox sinematik, title card "PRESENTS" lalu judul besar, tirai panel berwarna. Bisa dilewati (tombol Lewati, Esc, Enter, atau klik); hanya diputar sekali per sesi; tombol "Putar ulang intro" ada di footer; pengguna `prefers-reduced-motion` hanya melihat fade singkat
- **Elemen 3D**: latar hero Three.js (bentuk geometris flat berkontur tebal, mengikuti mouse dan scroll, otomatis berhenti saat tidak terlihat), kartu skill/proyek miring 3D dengan kilau, frame foto 3D berlapis, dan cincin logo teknologi 3D (LogoLoop layout orbit)
- **Logo teknologi**: JavaScript, TypeScript, React, HTML, CSS, Node.js, Express, MongoDB, SQLite, Git, GitHub, Vite, Three.js, GSAP, Motion, Tailwind (edit daftar di `config.js`)

- Efek foto Spider-Man: hover di desktop, tap di mobile, Enter/Space via keyboard; halftone, garis kecepatan, glitch, jaring SVG, sticker THWIP!, parallax kecil
- Dark/light mode (localStorage), toggle bahasa ID/EN, custom cursor, scroll progress bar
- Marquee, typing animation, scroll reveal, loading screen, halaman 404
- Proyek (filter + modal), skill bar blok, timeline sticky-note, catatan dengan pencarian, carousel testimoni
- Mini game "Catch the Spider", guestbook, visitor counter, download CV
- Easter egg: kode Konami (↑↑↓↓←→←→ B A) atau klik logo FRS 5x
- Aksesibilitas: skip link, focus state, label ARIA, `prefers-reduced-motion`

## API

`GET /api/projects`, `/api/projects/:id`, `/api/posts?q=`, `/api/skills`, `/api/testimonials`,
`POST /api/contact`, `GET|POST /api/guestbook`, `GET|POST /api/visitors`, `GET /api/cv/download`,
`GET /api/health`.

## Deploy

**Backend (Render / Railway)**
1. Push repo ke GitHub. Buat Web Service, root directory `server`.
2. Build: `npm install`, Start: `npm start`.
3. Environment: `CLIENT_ORIGIN=https://domain-frontendmu.vercel.app`, `NODE_ENV=production`, plus `SMTP_*`/`MAIL_TO` bila perlu. Tambahkan persistent disk dan set `DB_PATH` ke path disk itu bila ingin data awet.

**Frontend (Vercel / Netlify)**
1. Root directory `client`, build `npm run build`, output `dist`.
2. Environment: `VITE_API_URL=https://url-backendmu.onrender.com/api`.
3. `vercel.json` dan `public/_redirects` sudah menangani routing SPA (404 page tetap jalan).

**Satu server saja (opsional):** jalankan `npm run build`, lalu `npm start`. Express otomatis
menyajikan `client/dist` selain API.

## Lisensi komponen pihak ketiga

Folder `client/src/components/reactbits/` berisi komponen dari [React Bits](https://github.com/DavidHDev/react-bits)
(lisensi MIT + Commons Clause, lihat `LICENSE-REACTBITS.md`). Boleh dipakai di website/aplikasi, termasuk komersial,
tetapi komponennya tidak boleh dijual atau dibagikan ulang secara terpisah. Library lain (Three.js, GSAP, Motion,
Lucide, react-icons) memiliki lisensinya masing-masing; GSAP gratis untuk proyek yang tidak menjual produk/layanan
yang bersaing dengan GSAP, silakan cek [gsap.com/standard-license](https://gsap.com/standard-license).
