/**
 * Admin CRUD Routes for ÇIRAK
 * 
 * Provides full CRUD operations for intents, keywords, and fallbacks
 */

import express from 'express';
import db from '../database.js';
import { rebuildSnapshot } from '../services/snapshotManager.js';

const router = express.Router();

// ============================================
// INTENT CRUD
// ============================================

/**
 * GET /api/admin/intents/:id
 * Get single intent by ID
 */
router.get('/intents/:id', (req, res) => {
    try {
        const intent = db.prepare(`
            SELECT * FROM intents WHERE id = ?
        `).get(req.params.id);

        if (!intent) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        // Get keywords
        const keywords = db.prepare(`
            SELECT * FROM keywords WHERE intent_id = ?
        `).all(intent.intent_id);

        res.json({ ...intent, keywords });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/admin/intents/:id
 * Update intent
 */
router.put('/intents/:id', (req, res) => {
    try {
        const { title, primary_response, secondary_response, cta_response, tone, priority } = req.body;

        const update = db.prepare(`
            UPDATE intents 
            SET title = ?, 
                primary_response = ?, 
                secondary_response = ?, 
                cta_response = ?, 
                tone = ?,
                priority = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = update.run(
            title,
            primary_response,
            secondary_response,
            cta_response,
            tone,
            priority || 5,
            req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        res.json({ message: 'Intent updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/admin/intents/:id
 * Delete intent (cascades to keywords)
 */
router.delete('/intents/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM intents WHERE id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        res.json({ message: 'Intent deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/admin/intents/:id/toggle
 * Toggle intent active status
 */
router.patch('/intents/:id/toggle', (req, res) => {
    try {
        const intent = db.prepare('SELECT is_active FROM intents WHERE id = ?').get(req.params.id);

        if (!intent) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        const newStatus = intent.is_active === 1 ? 0 : 1;
        db.prepare('UPDATE intents SET is_active = ? WHERE id = ?').run(newStatus, req.params.id);

        res.json({ message: 'Intent status toggled', is_active: newStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// KEYWORD CRUD
// ============================================

/**
 * GET /api/admin/keywords/:intentId
 * Get all keywords for an intent
 */
router.get('/keywords/:intentId', (req, res) => {
    try {
        const keywords = db.prepare(`
            SELECT * FROM keywords WHERE intent_id = ?
        `).all(req.params.intentId);

        res.json(keywords.map(kw => ({
            ...kw,
            synonyms: kw.synonyms ? JSON.parse(kw.synonyms) : [],
            misspellings: kw.misspellings ? JSON.parse(kw.misspellings) : []
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/admin/keywords
 * Add new keyword
 */
router.post('/keywords', (req, res) => {
    try {
        const { intent_id, keyword_text, weight, synonyms, misspellings } = req.body;

        const insert = db.prepare(`
            INSERT INTO keywords (intent_id, keyword_text, weight, synonyms, misspellings)
            VALUES (?, ?, ?, ?, ?)
        `);

        insert.run(
            intent_id,
            keyword_text,
            weight || 10,
            synonyms ? JSON.stringify(synonyms) : null,
            misspellings ? JSON.stringify(misspellings) : null
        );

        res.status(201).json({ message: 'Keyword added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/admin/keywords/:id
 * Update keyword
 */
router.put('/keywords/:id', (req, res) => {
    try {
        const { keyword_text, weight, synonyms, misspellings } = req.body;

        const update = db.prepare(`
            UPDATE keywords 
            SET keyword_text = ?, 
                weight = ?, 
                synonyms = ?, 
                misspellings = ?
            WHERE id = ?
        `);

        const result = update.run(
            keyword_text,
            weight || 10,
            synonyms ? JSON.stringify(synonyms) : null,
            misspellings ? JSON.stringify(misspellings) : null,
            req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }

        res.json({ message: 'Keyword updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/admin/keywords/:id
 * Delete keyword
 */
router.delete('/keywords/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM keywords WHERE id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Keyword not found' });
        }

        res.json({ message: 'Keyword deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// FALLBACK CRUD
// ============================================

/**
 * GET /api/admin/fallbacks
 * Get all fallbacks
 */
router.get('/fallbacks', (req, res) => {
    try {
        const fallbacks = db.prepare('SELECT * FROM fallbacks ORDER BY id DESC').all();
        res.json(fallbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/admin/fallbacks
 * Create fallback
 */
router.post('/fallbacks', (req, res) => {
    try {
        const { id, message, tone, active } = req.body;

        const insert = db.prepare(`
            INSERT INTO fallbacks (id, message, tone, active)
            VALUES (?, ?, ?, ?)
        `);

        insert.run(id, message, tone || 'friendly', active !== false ? 1 : 0);

        res.status(201).json({ message: 'Fallback created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/admin/fallbacks/:id
 * Update fallback
 */
router.put('/fallbacks/:id', (req, res) => {
    try {
        const { message, tone, active } = req.body;

        const update = db.prepare(`
            UPDATE fallbacks 
            SET message = ?, tone = ?, active = ?
            WHERE id = ?
        `);

        const result = update.run(
            message,
            tone || 'friendly',
            active !== false ? 1 : 0,
            req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Fallback not found' });
        }

        res.json({ message: 'Fallback updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/admin/fallbacks/:id
 * Delete fallback
 */
router.delete('/fallbacks/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM fallbacks WHERE id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Fallback not found' });
        }

        res.json({ message: 'Fallback deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SNAPSHOT ACTIONS
// ============================================

/**
 * POST /api/admin/snapshot/rebuild-and-return
 * Rebuild snapshot and return new status
 */
router.post('/snapshot/rebuild-and-return', (req, res) => {
    try {
        rebuildSnapshot();

        // Get updated status
        const snapshot = db.prepare(`
            SELECT * FROM snapshots ORDER BY id DESC LIMIT 1
        `).get();

        res.json({
            success: true,
            message: 'Snapshot rebuilt successfully',
            snapshot
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// DRAFT/PUBLISH WORKFLOW
// ============================================

/**
 * POST /api/admin/intents/:id/publish
 * Publish a draft intent
 */
router.post('/intents/:id/publish', (req, res) => {
    try {
        const { id } = req.params;

        // Update intent status to published
        const update = db.prepare(`
            UPDATE intents 
            SET status = 'published', published_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const result = update.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        // Auto-rebuild snapshot to include newly published intent
        rebuildSnapshot();

        res.json({
            success: true,
            message: 'Intent published and snapshot rebuilt'
        });
    } catch (error) {
        console.error('Publish error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/admin/intents/:id/unpublish
 * Unpublish an intent (set to draft)
 */
router.post('/intents/:id/unpublish', (req, res) => {
    try {
        const { id } = req.params;

        // Update intent status to draft
        const update = db.prepare(`
            UPDATE intents 
            SET status = 'draft'
            WHERE id = ?
        `);

        const result = update.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Intent not found' });
        }

        // Auto-rebuild snapshot to exclude unpublished intent
        rebuildSnapshot();

        res.json({
            success: true,
            message: 'Intent unpublished and snapshot rebuilt'
        });
    } catch (error) {
        console.error('Unpublish error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
