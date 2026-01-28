/**
 * Admin Tools Routes
 * 
 * Diagnostic and quality control endpoints
 */

import express from 'express';
import { analyzeIntents, getIntentQualityScore } from '../tools/intentAnalyzer.js';
import { generateSnapshotDiff } from '../tools/snapshotDiff.js';

const router = express.Router();

/**
 * GET /api/admin/tools/intent-analysis
 * Analyze all intents for conflicts and quality issues
 */
router.get('/tools/intent-analysis', (req, res) => {
    try {
        const analysis = analyzeIntents();
        res.json(analysis);
    } catch (error) {
        console.error('Intent analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/tools/intent-quality/:intentId
 * Get quality score for specific intent
 */
router.get('/tools/intent-quality/:intentId', (req, res) => {
    try {
        const score = getIntentQualityScore(req.params.intentId);
        res.json({ intentId: req.params.intentId, qualityScore: score });
    } catch (error) {
        console.error('Quality score error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/tools/snapshot/diff
 * Get diff between current and previous snapshot
 */
router.get('/tools/snapshot/diff', (req, res) => {
    try {
        const diff = generateSnapshotDiff();
        res.json(diff);
    } catch (error) {
        console.error('Snapshot diff error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
