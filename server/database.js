import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'data/cirak.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS intents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intent_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    primary_response TEXT NOT NULL,
    secondary_response TEXT,
    cta_response TEXT,
    tone TEXT DEFAULT 'nötr',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intent_id TEXT NOT NULL,
    keyword_text TEXT NOT NULL,
    FOREIGN KEY (intent_id) REFERENCES intents (intent_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

// Seed default settings if not exists
const seedSettings = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
seedSettings.run('name', 'ÇIRAK');
seedSettings.run('tagline', 'Çırak’tan bilgi alın');
seedSettings.run('welcomeMessage', 'Merhaba, Çırak burada. Size nasıl yardımcı olabilirim?');
seedSettings.run('fallbackResponse', 'Bu konuda size en doğru bilgiyi sunabilmem için lütfen mesajınızı biraz daha netleştirir misiniz?');

export default db;
