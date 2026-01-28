/**
 * Phase 5 Schema Update: Enhanced Logging
 * 
 * Adds normalized_input and response_tone to logs table
 */

import db from './database.js';

console.log('🔄 Phase 5: Updating logs schema...');

try {
    db.exec(`
        ALTER TABLE logs ADD COLUMN normalized_input TEXT;
    `);
    console.log('✅ Added normalized_input column to logs');
} catch (error) {
    if (error.message.includes('duplicate column')) {
        console.log('ℹ️  normalized_input column already exists');
    } else {
        console.error('❌ Error adding normalized_input:', error.message);
    }
}

try {
    db.exec(`
        ALTER TABLE logs ADD COLUMN response_tone TEXT;
    `);
    console.log('✅ Added response_tone column to logs');
} catch (error) {
    if (error.message.includes('duplicate column')) {
        console.log('ℹ️  response_tone column already exists');
    } else {
        console.error('❌ Error adding response_tone:', error.message);
    }
}

console.log('✅ Phase 5 schema update complete!');
