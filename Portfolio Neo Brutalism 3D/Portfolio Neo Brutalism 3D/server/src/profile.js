// Data pribadi untuk sisi server (CV, seed, email). Ubah di sini, lalu jalankan ulang seed.
// Sesuaikan dengan client/src/config.js agar tampilan dan backend konsisten.
export const profile = {
  name: "Fajrur Robi Sya'bani",
  role: 'Full Stack Developer',
  email: process.env.PROFILE_EMAIL || 'email@contoh.com', // GANTI dengan emailmu
  github: process.env.PROFILE_GITHUB || 'github.com/username', // GANTI dengan username GitHub-mu
  location: 'Indonesia',
  cvFileName: 'CV-Fajrur-Robi-Syabani.pdf',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQLite', 'MongoDB', 'Git & GitHub', 'Three.js', 'GSAP']
};
