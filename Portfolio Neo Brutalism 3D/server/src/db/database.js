import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH || './data/portfolio.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Skema tabel
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary_id TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    description_id TEXT NOT NULL,
    description_en TEXT NOT NULL,
    stack TEXT NOT NULL,           -- JSON array
    demo_url TEXT,
    repo_url TEXT,
    color TEXT DEFAULT '#FFE500'
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_id TEXT NOT NULL,
    title_en TEXT NOT NULL,
    excerpt_id TEXT NOT NULL,
    excerpt_en TEXT NOT NULL,
    tags TEXT NOT NULL,            -- JSON array
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    quote_id TEXT NOT NULL,
    quote_en TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    count INTEGER NOT NULL DEFAULT 0
  );
  INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0);
`);

export default db;
