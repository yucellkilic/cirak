/**
 * Phase 6 Schema Update: Draft/Publish Workflow
 * 
 * Adds status and published_at columns to intents table
 */

import db from './database.js';

console.log('🔄 Phase 6: Adding draft/publish workflow...');

try {
    db.exec(`
        ALTER TABLE intents ADD COLUMN status TEXT DEFAULT 'published';
    `);
    console.log('✅ Added status column to intents');
} catch (error) {
    if (error.message.includes('duplicate column')) {
        console.log('ℹ️  status column already exists');
    } else {
        console.error('❌ Error adding status:', error.message);
    }
}

try {
    db.exec(`
        ALTER TABLE intents ADD COLUMN published_at DATETIME;
    `);
    console.log('✅ Added published_at column to intents');
} catch (error) {
    if (error.message.includes('duplicate column')) {
        console.log('ℹ️  published_at column already exists');
    } else {
        console.error('❌ Error adding published_at:', error.message);
    }
}

// Set published_at for existing published intents
try {
    db.exec(`
        UPDATE intents 
        SET published_at = CURRENT_TIMESTAMP 
        WHERE status = 'published' AND published_at IS NULL;
    `);
    console.log('✅ Set published_at for existing intents');
} catch (error) {
    console.error('❌ Error updating published_at:', error.message);
}

console.log('✅ Phase 6 schema update complete!');
