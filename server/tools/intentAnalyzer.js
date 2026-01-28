/**
 * Intent Analyzer Tool
 * 
 * Diagnostic tool for detecting intent quality issues:
 * - Keyword conflicts (same keyword in multiple intents)
 * - Synonym overlaps
 * - Priority collisions
 * 
 * Admin-only, no runtime impact
 */

import db from '../database.js';

/**
 * Analyze all intents for quality issues
 * @returns {object} Analysis results
 */
export function analyzeIntents() {
    // Fetch all intents with keywords
    const intents = db.prepare(`
        SELECT i.*, GROUP_CONCAT(k.keyword_text) as keywords
        FROM intents i
        LEFT JOIN keywords k ON i.intent_id = k.intent_id
        GROUP BY i.id
    `).all();

    // Fetch all keywords with details
    const allKeywords = db.prepare(`
        SELECT k.*, i.title as intent_title, i.priority
        FROM keywords k
        JOIN intents i ON k.intent_id = i.intent_id
    `).all();

    const conflicts = [];
    const keywordMap = new Map();

    // Build keyword map
    allKeywords.forEach(kw => {
        const text = kw.keyword_text.toLowerCase();

        if (!keywordMap.has(text)) {
            keywordMap.set(text, []);
        }

        keywordMap.get(text).push({
            intentId: kw.intent_id,
            intentTitle: kw.intent_title,
            priority: kw.priority,
            weight: kw.weight,
            synonyms: kw.synonyms ? JSON.parse(kw.synonyms) : [],
            misspellings: kw.misspellings ? JSON.parse(kw.misspellings) : []
        });
    });

    // Detect exact keyword conflicts
    keywordMap.forEach((usages, keyword) => {
        if (usages.length > 1) {
            const severity = usages.length >= 3 ? 'HIGH' : 'MEDIUM';

            conflicts.push({
                type: 'EXACT_MATCH',
                keyword,
                severity,
                intents: usages.map(u => ({
                    id: u.intentId,
                    title: u.intentTitle,
                    priority: u.priority,
                    weight: u.weight
                })),
                recommendation: severity === 'HIGH'
                    ? `Keyword "${keyword}" used in ${usages.length} intents - consider removing from lower-priority intents`
                    : `Keyword "${keyword}" shared between 2 intents - verify this is intentional`
            });
        }
    });

    // Detect synonym overlaps
    const synonymConflicts = detectSynonymOverlaps(allKeywords);
    conflicts.push(...synonymConflicts);

    // Detect priority collisions
    const priorityConflicts = detectPriorityCollisions(intents, keywordMap);
    conflicts.push(...priorityConflicts);

    // Calculate statistics
    const stats = {
        totalIntents: intents.length,
        totalKeywords: allKeywords.length,
        totalConflicts: conflicts.length,
        conflictsBySeverity: {
            HIGH: conflicts.filter(c => c.severity === 'HIGH').length,
            MEDIUM: conflicts.filter(c => c.severity === 'MEDIUM').length,
            LOW: conflicts.filter(c => c.severity === 'LOW').length
        },
        affectedIntents: [...new Set(conflicts.flatMap(c => c.intents.map(i => i.id)))]
    };

    return {
        conflicts,
        stats,
        timestamp: new Date().toISOString()
    };
}

/**
 * Detect synonym overlaps between intents
 */
function detectSynonymOverlaps(allKeywords) {
    const conflicts = [];
    const synonymMap = new Map();

    // Build synonym map
    allKeywords.forEach(kw => {
        const synonyms = kw.synonyms ? JSON.parse(kw.synonyms) : [];

        synonyms.forEach(syn => {
            const synLower = syn.toLowerCase();
            if (!synonymMap.has(synLower)) {
                synonymMap.set(synLower, []);
            }
            synonymMap.get(synLower).push({
                intentId: kw.intent_id,
                intentTitle: kw.intent_title,
                baseKeyword: kw.keyword_text
            });
        });
    });

    // Check if synonyms conflict with other intents' keywords
    allKeywords.forEach(kw => {
        const keywordLower = kw.keyword_text.toLowerCase();

        if (synonymMap.has(keywordLower)) {
            const synonymUsages = synonymMap.get(keywordLower);
            const otherIntents = synonymUsages.filter(u => u.intentId !== kw.intent_id);

            if (otherIntents.length > 0) {
                conflicts.push({
                    type: 'SYNONYM_OVERLAP',
                    keyword: kw.keyword_text,
                    severity: 'LOW',
                    intents: [
                        { id: kw.intent_id, title: kw.intent_title },
                        ...otherIntents.map(u => ({ id: u.intentId, title: u.intentTitle }))
                    ],
                    recommendation: `"${kw.keyword_text}" is a synonym in ${otherIntents[0].intentTitle} - may cause confusion`
                });
            }
        }
    });

    return conflicts;
}

/**
 * Detect priority collisions (same priority + overlapping keywords)
 */
function detectPriorityCollisions(intents, keywordMap) {
    const conflicts = [];
    const priorityGroups = new Map();

    // Group intents by priority
    intents.forEach(intent => {
        const priority = intent.priority || 5;
        if (!priorityGroups.has(priority)) {
            priorityGroups.set(priority, []);
        }
        priorityGroups.get(priority).push(intent);
    });

    // Check for keyword overlaps within same priority
    priorityGroups.forEach((group, priority) => {
        if (group.length < 2) return;

        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const intent1 = group[i];
                const intent2 = group[j];

                const keywords1 = intent1.keywords ? intent1.keywords.split(',') : [];
                const keywords2 = intent2.keywords ? intent2.keywords.split(',') : [];

                const overlap = keywords1.filter(k => keywords2.includes(k));

                if (overlap.length > 0) {
                    conflicts.push({
                        type: 'PRIORITY_COLLISION',
                        keyword: overlap.join(', '),
                        severity: 'MEDIUM',
                        intents: [
                            { id: intent1.intent_id, title: intent1.title, priority },
                            { id: intent2.intent_id, title: intent2.title, priority }
                        ],
                        recommendation: `Both intents have priority ${priority} and share keywords: ${overlap.join(', ')} - consider different priorities`
                    });
                }
            }
        }
    });

    return conflicts;
}

/**
 * Get intent quality score (0-100)
 */
export function getIntentQualityScore(intentId) {
    const keywords = db.prepare(`
        SELECT * FROM keywords WHERE intent_id = ?
    `).all(intentId);

    if (keywords.length === 0) return 0;

    let score = 0;

    // Base score: keyword count (max 30 points)
    score += Math.min(keywords.length * 5, 30);

    // Synonym coverage (max 30 points)
    const withSynonyms = keywords.filter(k => {
        const syns = k.synonyms ? JSON.parse(k.synonyms) : [];
        return syns.length > 0;
    }).length;
    score += Math.min((withSynonyms / keywords.length) * 30, 30);

    // Weight distribution (max 20 points)
    const avgWeight = keywords.reduce((sum, k) => sum + k.weight, 0) / keywords.length;
    score += Math.min(avgWeight * 2, 20);

    // Misspelling coverage (max 20 points)
    const withMisspellings = keywords.filter(k => {
        const miss = k.misspellings ? JSON.parse(k.misspellings) : [];
        return miss.length > 0;
    }).length;
    score += Math.min((withMisspellings / keywords.length) * 20, 20);

    return Math.round(score);
}

export default {
    analyzeIntents,
    getIntentQualityScore
};
