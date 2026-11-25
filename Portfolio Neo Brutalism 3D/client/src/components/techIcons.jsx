import {
  SiCss,
  SiExpress,
  SiFramer,
  SiGit,
  SiGithub,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVite
} from 'react-icons/si';
import { Plug } from 'lucide-react';

// Logo brand asli (react-icons / Simple Icons) dengan warna resmi.
// color: null berarti pakai warna teks (untuk logo hitam agar tetap terlihat di dark mode).
export const TECH = {
  javascript: { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E' },
  typescript: { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  react: { name: 'React', Icon: SiReact, color: '#61DAFB' },
  html: { name: 'HTML5', Icon: SiHtml5, color: '#E34F26' },
  css: { name: 'CSS3', Icon: SiCss, color: '#1572B6' },
  node: { name: 'Node.js', Icon: SiNodedotjs, color: '#339933' },
  express: { name: 'Express', Icon: SiExpress, color: null },
  mongodb: { name: 'MongoDB', Icon: SiMongodb, color: '#47A248' },
  sqlite: { name: 'SQLite', Icon: SiSqlite, color: '#0F80CC' },
  postgres: { name: 'PostgreSQL', Icon: SiPostgresql, color: '#4169E1' },
  git: { name: 'Git', Icon: SiGit, color: '#F05032' },
  github: { name: 'GitHub', Icon: SiGithub, color: null },
  vite: { name: 'Vite', Icon: SiVite, color: '#646CFF' },
  three: { name: 'Three.js', Icon: SiThreedotjs, color: null },
  gsap: { name: 'GSAP', Icon: SiGreensock, color: '#88CE02' },
  framer: { name: 'Motion', Icon: SiFramer, color: '#0055FF' },
  tailwind: { name: 'Tailwind', Icon: SiTailwindcss, color: '#06B6D4' }
};

// Nama skill dari API -> id logo
const BY_SKILL = {
  react: 'react',
  javascript: 'javascript',
  typescript: 'typescript',
  'html & css': 'html',
  'node.js': 'node',
  express: 'express',
  'sql / sqlite': 'sqlite',
  mongodb: 'mongodb',
  'git & github': 'github'
};

/** Ikon skill: logo brand jika ada, selain itu ikon Lucide (REST API) atau emoji bawaan data. */
export function SkillLogo({ skill, size = 28 }) {
  const id = BY_SKILL[skill.name.toLowerCase()];
  if (id) {
    const { Icon, color, name } = TECH[id];
    return <Icon size={size} color={color || undefined} aria-label={name} role="img" />;
  }
  if (skill.name.toLowerCase().includes('api')) return <Plug size={size} aria-hidden="true" />;
  return <span aria-hidden="true">{skill.icon}</span>;
}
