/**
 * Database Schema Update for ÇIRAK Intent Engine
 * 
 * Adds new tables and updates existing ones for snapshot-based architecture
 */

import db from './database.js';

console.log('🔄 Updating database schema...');

try {
    // Add priority column to intents if not exists
    db.exec(`
    ALTER TABLE intents ADD COLUMN priority INTEGER DEFAULT 5;
  `);
    console.log('✅ Added priority column to intents');
} catch (error) {
    if (error.message.includes('duplicate column')) {
        console.log('ℹ️  Priority column already exists');
    } else {
        console.error('❌ Error adding priority column:', error.message);
    }
}

try {
    // Add weight, synonyms, misspellings to keywords
    db.exec(`
    ALTER TABLE keywords ADD COLUMN weight INTEGER DEFAULT 10;
    ALTER TABLE keywords ADD COLUMN synonyms TEXT;
    ALTER TABLE keywords ADD COLUMN misspellings TEXT;
  `);
    console.log('✅ Added weight, synonyms, misspellings to keywords');
} catch (error) {
    if (error.message.includes('duplicate column')) {
        console.log('ℹ️  Keyword columns already exist');
    } else {
        console.error('❌ Error updating keywords:', error.message);
    }
}

// Create fallbacks table
try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS fallbacks (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      tone TEXT DEFAULT 'friendly',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log('✅ Created fallbacks table');

    // Insert default fallbacks
    const insertFallback = db.prepare(`
    INSERT OR IGNORE INTO fallbacks (id, message, tone)
    VALUES (?, ?, ?)
  `);

    insertFallback.run(
        'fallback_001',
        'Bu konuda size en doğru bilgiyi sunabilmem için lütfen mesajınızı biraz daha netleştirir misiniz?',
        'friendly'
    );

    insertFallback.run(
        'fallback_002',
        'Üzgünüm, bu soruyu tam olarak anlayamadım. Fiyat, hizmetler veya iletişim hakkında soru sorabilirsiniz.',
        'professional'
    );

    console.log('✅ Inserted default fallbacks');
} catch (error) {
    console.error('❌ Error creating fallbacks:', error.message);
}

// Create site_data table
try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS site_data (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log('✅ Created site_data table');

    // Insert sample site data
    const insertSiteData = db.prepare(`
    INSERT OR IGNORE INTO site_data (key, value, category)
    VALUES (?, ?, ?)
  `);

    insertSiteData.run(
        'web_design',
        JSON.stringify('Web Tasarım ve Geliştirme'),
        'services'
    );

    insertSiteData.run(
        'web_design',
        JSON.stringify({ min: 5900, max: 25000 }),
        'prices'
    );

    insertSiteData.run(
        'phone',
        JSON.stringify('+90 505 519 63 00'),
        'contact'
    );

    insertSiteData.run(
        'email',
        JSON.stringify('info@yucelkilic.tr'),
        'contact'
    );

    console.log('✅ Inserted sample site data');
} catch (error) {
    console.error('❌ Error creating site_data:', error.message);
}

// Create logs table
try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message TEXT NOT NULL,
      matched_intent_id TEXT,
      score REAL,
      is_fallback INTEGER DEFAULT 0,
      response_text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log('✅ Created logs table');
} catch (error) {
    console.error('❌ Error creating logs:', error.message);
}

// Create snapshots table for versioning
try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL,
      generated_at DATETIME NOT NULL,
      intent_count INTEGER,
      fallback_count INTEGER
    );
  `);
    console.log('✅ Created snapshots table');
} catch (error) {
    console.error('❌ Error creating snapshots:', error.message);
}

// Add new settings
try {
    const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value)
    VALUES (?, ?)
  `);

    insertSetting.run('themeColor', '#0066cc');
    insertSetting.run('widgetEnabled', '1');

    console.log('✅ Added new settings');
} catch (error) {
    console.error('❌ Error adding settings:', error.message);
}

console.log('✅ Database schema update complete!');
