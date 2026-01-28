/**
 * Logging Service - Async, Non-Blocking
 * 
 * Logs user messages and responses to database
 * Fire-and-forget pattern (no blocking)
 */

import db from '../database.js';

/**
 * Log a message interaction
 * @param {string} userMessage - User's message
 * @param {object} response - Response object from intent engine
 * @param {string} normalizedInput - Normalized user input
 */
export function logMessage(userMessage, response, normalizedInput = '') {
    // Fire and forget - don't await or block
    setImmediate(() => {
        try {
            const insert = db.prepare(`
        INSERT INTO logs (
          user_message, 
          normalized_input,
          matched_intent_id, 
          score, 
          is_fallback, 
          response_text,
          response_tone
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            insert.run(
                userMessage,
                normalizedInput,
                response.intentId,
                response.score,
                response.isFallback ? 1 : 0,
                response.message,
                response.tone || 'neutral'
            );
        } catch (error) {
            // Non-critical, just log to console
            console.error('Failed to log message:', error.message);
        }
    });
}

/**
 * Get recent logs
 * @param {number} limit - Number of logs to retrieve
 * @returns {array} Array of log entries
 */
export function getRecentLogs(limit = 50) {
    try {
        const logs = db.prepare(`
      SELECT 
        id,
        user_message,
        matched_intent_id,
        score,
        is_fallback,
        response_text,
        timestamp
      FROM logs
      ORDER BY id DESC
      LIMIT ?
    `).all(limit);

        return logs.map(log => ({
            ...log,
            is_fallback: log.is_fallback === 1
        }));
    } catch (error) {
        console.error('Failed to get logs:', error.message);
        return [];
    }
}

/**
 * Get analytics data
 * @returns {object} Analytics summary
 */
export function getAnalytics() {
    try {
        // Total messages today
        const today = new Date().toISOString().split('T')[0];
        const dailyCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE DATE(timestamp) = ?
    `).get(today);

        // Most matched intents
        const topIntents = db.prepare(`
      SELECT 
        matched_intent_id,
        COUNT(*) as count
      FROM logs
      WHERE matched_intent_id IS NOT NULL
      GROUP BY matched_intent_id
      ORDER BY count DESC
      LIMIT 5
    `).all();

        // Fallback rate
        const fallbackRate = db.prepare(`
      SELECT 
        SUM(CASE WHEN is_fallback = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as rate
      FROM logs
    `).get();

        // Recent messages
        const recentMessages = getRecentLogs(10);

        return {
            dailyMessageCount: dailyCount.count,
            topIntents,
            fallbackRate: fallbackRate.rate || 0,
            recentMessages
        };
    } catch (error) {
        console.error('Failed to get analytics:', error.message);
        return {
            dailyMessageCount: 0,
            topIntents: [],
            fallbackRate: 0,
            recentMessages: []
        };
    }
}

export default {
    logMessage,
    getRecentLogs,
    getAnalytics
};
