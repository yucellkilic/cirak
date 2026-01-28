/**
 * ÇIRAK Snapshot Builder
 * 
 * Builds in-memory snapshot from SQLite database
 * Snapshot is immutable and versioned
 */

import db from '../database.js';

/**
 * Build complete snapshot from database
 * @returns {object} Snapshot object
 */
export function buildSnapshot() {
    try {
        // Get all active AND published intents only
        const intentsRaw = db.prepare(`
      SELECT 
        intent_id as id,
        title as name,
        primary_response,
        secondary_response,
        cta_response,
        tone,
        is_active as active,
        priority,
        status
      FROM intents
      WHERE is_active = 1 AND (status = 'published' OR status IS NULL)
    `).all();

        // Build intents with keywords
        const intents = intentsRaw.map(intent => {
            // Get keywords for this intent
            const keywordsRaw = db.prepare(`
        SELECT 
          keyword_text as text,
          weight,
          synonyms,
          misspellings
        FROM keywords
        WHERE intent_id = ?
      `).all(intent.id);

            // Parse JSON fields
            const keywords = keywordsRaw.map(kw => ({
                text: kw.text,
                weight: kw.weight || 10,
                synonyms: kw.synonyms ? JSON.parse(kw.synonyms) : [],
                misspellings: kw.misspellings ? JSON.parse(kw.misspellings) : []
            }));

            return {
                id: intent.id,
                name: intent.name,
                priority: intent.priority || 5,
                active: intent.active === 1,
                keywords,
                response: {
                    main: intent.primary_response,
                    supporting: intent.secondary_response,
                    cta: intent.cta_response,
                    tone: intent.tone || 'professional'
                }
            };
        });

        // Get fallbacks
        const fallbacksRaw = db.prepare(`
      SELECT 
        id,
        message,
        tone,
        active
      FROM fallbacks
      WHERE active = 1
    `).all();

        const fallbacks = fallbacksRaw.map(f => ({
            id: f.id,
            message: f.message,
            tone: f.tone || 'friendly',
            active: f.active === 1
        }));

        // Get site data
        const siteDataRaw = db.prepare(`
      SELECT key, value, category
      FROM site_data
    `).all();

        const siteData = {
            services: {},
            prices: {},
            contact: {}
        };

        for (const item of siteDataRaw) {
            const value = JSON.parse(item.value);
            if (item.category === 'services') {
                siteData.services[item.key] = value;
            } else if (item.category === 'prices') {
                siteData.prices[item.key] = value;
            } else if (item.category === 'contact') {
                siteData.contact[item.key] = value;
            }
        }

        // Get settings
        const settingsRaw = db.prepare(`
      SELECT key, value
      FROM settings
    `).all();

        const settings = {};
        for (const setting of settingsRaw) {
            settings[setting.key] = setting.value;
        }

        // Build snapshot
        const snapshot = {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            intents,
            fallbacks,
            siteData,
            settings: {
                cirakName: settings.name || 'ÇIRAK',
                themeColor: settings.themeColor || '#0066cc',
                widgetEnabled: settings.widgetEnabled !== '0'
            }
        };

        // Save snapshot metadata to DB
        saveSnapshotMetadata(snapshot);

        return snapshot;
    } catch (error) {
        console.error('Snapshot build error:', error);
        throw error;
    }
}

/**
 * Save snapshot metadata to database for versioning
 * @param {object} snapshot - Snapshot object
 */
function saveSnapshotMetadata(snapshot) {
    try {
        const insert = db.prepare(`
      INSERT INTO snapshots (version, generated_at, intent_count, fallback_count)
      VALUES (?, ?, ?, ?)
    `);

        insert.run(
            snapshot.version,
            snapshot.generatedAt,
            snapshot.intents.length,
            snapshot.fallbacks.length
        );
    } catch (error) {
        // Non-critical, just log
        console.warn('Failed to save snapshot metadata:', error.message);
    }
}

/**
 * Get snapshot history
 * @param {number} limit - Number of snapshots to retrieve
 * @returns {array} Array of snapshot metadata
 */
export function getSnapshotHistory(limit = 10) {
    try {
        const snapshots = db.prepare(`
      SELECT id, version, generated_at, intent_count, fallback_count
      FROM snapshots
      ORDER BY id DESC
      LIMIT ?
    `).all(limit);

        return snapshots;
    } catch (error) {
        console.warn('Failed to get snapshot history:', error.message);
        return [];
    }
}

/**
 * Validate snapshot structure
 * @param {object} snapshot - Snapshot to validate
 * @returns {boolean} True if valid
 */
export function validateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        return false;
    }

    if (!snapshot.version || !snapshot.generatedAt) {
        return false;
    }

    if (!Array.isArray(snapshot.intents)) {
        return false;
    }

    if (!Array.isArray(snapshot.fallbacks)) {
        return false;
    }

    if (!snapshot.siteData || typeof snapshot.siteData !== 'object') {
        return false;
    }

    return true;
}

export default {
    buildSnapshot,
    getSnapshotHistory,
    validateSnapshot
};
