/**
 * Analytics Routes
 * 
 * Endpoints for fallback analytics and intent performance metrics
 */

import express from 'express';
import db from '../database.js';

const router = express.Router();

/**
 * GET /api/admin/analytics/fallbacks
 * Get fallback analytics
 */
router.get('/fallbacks', (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        const dateStr = dateThreshold.toISOString();

        // Total messages in period
        const totalResult = db.prepare(`
            SELECT COUNT(*) as total
            FROM logs
            WHERE timestamp >= ?
        `).get(dateStr);
        const totalMessages = totalResult.total;

        // Fallback count
        const fallbackResult = db.prepare(`
            SELECT COUNT(*) as count
            FROM logs
            WHERE is_fallback = 1 AND timestamp >= ?
        `).get(dateStr);
        const fallbackCount = fallbackResult.count;

        // Fallback rate
        const fallbackRate = totalMessages > 0
            ? ((fallbackCount / totalMessages) * 100).toFixed(1)
            : 0;

        // Top fallback queries
        const topFallbacks = db.prepare(`
            SELECT 
                user_message,
                normalized_input,
                COUNT(*) as count
            FROM logs
            WHERE is_fallback = 1 AND timestamp >= ?
            GROUP BY normalized_input
            ORDER BY count DESC
            LIMIT 15
        `).all(dateStr);

        // Intents with zero matches in period
        const allIntents = db.prepare(`
            SELECT intent_id, title FROM intents WHERE is_active = 1
        `).all();

        const matchedIntents = db.prepare(`
            SELECT DISTINCT matched_intent_id
            FROM logs
            WHERE is_fallback = 0 AND timestamp >= ?
        `).all(dateStr);

        const matchedIntentIds = new Set(matchedIntents.map(m => m.matched_intent_id));
        const zeroMatchIntents = allIntents.filter(i => !matchedIntentIds.has(i.intent_id));

        // Fallback trend (daily)
        const fallbackTrend = db.prepare(`
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as total,
                SUM(CASE WHEN is_fallback = 1 THEN 1 ELSE 0 END) as fallbacks
            FROM logs
            WHERE timestamp >= ?
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        `).all(dateStr);

        const trend = fallbackTrend.map(day => ({
            date: day.date,
            fallbackRate: day.total > 0 ? ((day.fallbacks / day.total) * 100).toFixed(1) : 0,
            totalMessages: day.total,
            fallbacks: day.fallbacks
        }));

        res.json({
            period: `Last ${days} days`,
            totalMessages,
            fallbackCount,
            fallbackRate: parseFloat(fallbackRate),
            topFallbackQueries: topFallbacks.map(f => ({
                query: f.user_message,
                normalized: f.normalized_input,
                count: f.count
            })),
            zeroMatchIntents: zeroMatchIntents.map(i => ({
                intentId: i.intent_id,
                title: i.title
            })),
            trend
        });
    } catch (error) {
        console.error('Fallback analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/admin/analytics/intent-performance
 * Get performance metrics per intent
 */
router.get('/intent-performance', (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        const dateStr = dateThreshold.toISOString();

        // Get all intents
        const allIntents = db.prepare(`
            SELECT intent_id, title, priority FROM intents WHERE is_active = 1
        `).all();

        // Get performance metrics
        const performance = allIntents.map(intent => {
            const stats = db.prepare(`
                SELECT 
                    COUNT(*) as matchCount,
                    AVG(score) as avgScore,
                    MAX(timestamp) as lastMatchedAt
                FROM logs
                WHERE matched_intent_id = ? AND is_fallback = 0 AND timestamp >= ?
            `).get(intent.intent_id, dateStr);

            return {
                intentId: intent.intent_id,
                title: intent.title,
                priority: intent.priority || 5,
                matchCount: stats.matchCount || 0,
                avgScore: stats.avgScore ? parseFloat(stats.avgScore.toFixed(1)) : 0,
                lastMatchedAt: stats.lastMatchedAt,
                status: stats.matchCount === 0 ? 'unused' : stats.matchCount < 5 ? 'low' : 'active'
            };
        });

        // Sort by match count descending
        performance.sort((a, b) => b.matchCount - a.matchCount);

        res.json({
            period: `Last ${days} days`,
            intents: performance,
            summary: {
                totalIntents: performance.length,
                activeIntents: performance.filter(p => p.status === 'active').length,
                lowUsageIntents: performance.filter(p => p.status === 'low').length,
                unusedIntents: performance.filter(p => p.status === 'unused').length
            }
        });
    } catch (error) {
        console.error('Intent performance error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
