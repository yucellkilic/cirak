/**
 * ÇIRAK Intent Engine - Core Matching Logic
 * 
 * CRITICAL RULES:
 * - 100% synchronous (no async/await)
 * - In-memory only (no DB access)
 * - Deterministic (same input → same output)
 * - Pure functions (no side effects)
 */

/**
 * Normalize user input for consistent matching
 * @param {string} input - Raw user message
 * @returns {string} Normalized input
 */
function normalizeInput(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ''); // Remove special chars, keep Turkish
}

/**
 * Calculate score for a single intent based on keyword matches
 * @param {string} normalizedInput - Normalized user message
 * @param {object} intent - Intent object from snapshot
 * @param {boolean} detailed - Return detailed breakdown
 * @returns {number|object} Total score or detailed breakdown
 */
function scoreIntent(normalizedInput, intent, detailed = false) {
    let totalScore = 0;
    const breakdown = {
        matches: [],
        baseScore: 0,
        synonymBonus: 0,
        typoBonus: 0,
        finalScore: 0
    };

    if (!intent.keywords || !Array.isArray(intent.keywords)) {
        return detailed ? breakdown : 0;
    }

    for (const keyword of intent.keywords) {
        const keywordText = normalizeInput(keyword.text);
        const weight = keyword.weight || 10;
        let matchType = null;
        let matchedTerm = null;
        let scoreAdded = 0;

        // Exact match
        if (normalizedInput.includes(keywordText)) {
            matchType = 'exact';
            matchedTerm = keyword.text;
            scoreAdded = weight;
            totalScore += weight;
            breakdown.baseScore += weight;
        }
        // Synonym match (0.8x weight)
        else if (keyword.synonyms && Array.isArray(keyword.synonyms)) {
            for (const synonym of keyword.synonyms) {
                const normalizedSynonym = normalizeInput(synonym);
                if (normalizedInput.includes(normalizedSynonym)) {
                    matchType = 'synonym';
                    matchedTerm = synonym;
                    scoreAdded = weight * 0.8;
                    totalScore += scoreAdded;
                    breakdown.baseScore += weight;
                    breakdown.synonymBonus += scoreAdded - weight; // negative
                    break;
                }
            }
        }
        // Misspelling match (0.6x weight)
        else if (keyword.misspellings && Array.isArray(keyword.misspellings)) {
            for (const misspelling of keyword.misspellings) {
                const normalizedMisspelling = normalizeInput(misspelling);
                if (normalizedInput.includes(normalizedMisspelling)) {
                    matchType = 'typo';
                    matchedTerm = misspelling;
                    scoreAdded = weight * 0.6;
                    totalScore += scoreAdded;
                    breakdown.baseScore += weight;
                    breakdown.typoBonus += scoreAdded - weight; // negative
                    break;
                }
            }
        }

        if (matchType && detailed) {
            breakdown.matches.push({
                keyword: keyword.text,
                matchType,
                matchedTerm,
                weight,
                scoreAdded: Math.round(scoreAdded * 10) / 10
            });
        }
    }

    breakdown.finalScore = Math.round(totalScore * 10) / 10;

    return detailed ? breakdown : totalScore;
}

/**
 * Score all intents and return scores map
 * @param {string} normalizedInput - Normalized user message
 * @param {array} intents - Array of intent objects from snapshot
 * @returns {object} Map of intent_id → score
 */
function scoreAllIntents(normalizedInput, intents) {
    const scores = {};

    for (const intent of intents) {
        if (!intent.active) {
            continue; // Skip inactive intents
        }
        scores[intent.id] = scoreIntent(normalizedInput, intent);
    }

    return scores;
}

/**
 * Select best matching intent based on priority and score
 * @param {object} scores - Map of intent_id → score
 * @param {array} intents - Array of intent objects from snapshot
 * @returns {object|null} Selected intent or null if no match
 */
function selectBestIntent(scores, intents) {
    // Filter candidates with score > 0
    const candidates = intents.filter(intent => scores[intent.id] > 0);

    if (candidates.length === 0) {
        return null;
    }

    // Sort by priority (desc), then by score (desc)
    candidates.sort((a, b) => {
        const priorityA = a.priority || 5;
        const priorityB = b.priority || 5;

        if (priorityA !== priorityB) {
            return priorityB - priorityA; // Higher priority first
        }

        return scores[b.id] - scores[a.id]; // Higher score first
    });

    return candidates[0];
}

/**
 * Round-robin fallback selector
 * Uses a simple counter to cycle through fallbacks deterministically
 */
let fallbackCounter = 0;

function selectFallback(fallbacks) {
    if (!fallbacks || fallbacks.length === 0) {
        return {
            id: 'default_fallback',
            message: 'Üzgünüm, size yardımcı olamıyorum.',
            tone: 'friendly'
        };
    }

    // Filter active fallbacks
    const activeFallbacks = fallbacks.filter(f => f.active !== false);

    if (activeFallbacks.length === 0) {
        return fallbacks[0]; // Return first if none active
    }

    // Round-robin selection
    const selected = activeFallbacks[fallbackCounter % activeFallbacks.length];
    fallbackCounter++;

    return selected;
}

/**
 * Interpolate response template with site data
 * @param {string} template - Response template with placeholders
 * @param {object} siteData - Site data from snapshot
 * @returns {string} Interpolated response
 */
function interpolateResponse(template, siteData = {}) {
    if (!template || typeof template !== 'string') {
        return '';
    }

    let output = template;

    // Replace {service.key}
    if (siteData.services) {
        output = output.replace(/\{service\.(\w+)\}/g, (match, key) => {
            return siteData.services[key] || match;
        });
    }

    // Replace {price.key.min} and {price.key.max}
    if (siteData.prices) {
        output = output.replace(/\{price\.(\w+)\.min\}/g, (match, key) => {
            return siteData.prices[key]?.min || match;
        });
        output = output.replace(/\{price\.(\w+)\.max\}/g, (match, key) => {
            return siteData.prices[key]?.max || match;
        });
    }

    // Replace {contact.key}
    if (siteData.contact) {
        output = output.replace(/\{contact\.(\w+)\}/g, (match, key) => {
            return siteData.contact[key] || match;
        });
    }

    return output;
}

/**
 * Build response object from intent
 * @param {object} intent - Selected intent
 * @param {number} score - Match score
 * @param {object} siteData - Site data for interpolation
 * @returns {object} Response object
 */
function buildIntentResponse(intent, score, siteData) {
    const response = intent.response || {};

    return {
        intentId: intent.id,
        intentName: intent.name,
        message: interpolateResponse(response.main, siteData),
        supportingMessage: response.supporting
            ? interpolateResponse(response.supporting, siteData)
            : null,
        ctaMessage: response.cta
            ? interpolateResponse(response.cta, siteData)
            : null,
        tone: response.tone || 'professional',
        score: score,
        isFallback: false
    };
}

/**
 * Build fallback response object
 * @param {object} fallback - Selected fallback
 * @param {object} siteData - Site data for interpolation
 * @returns {object} Response object
 */
function buildFallbackResponse(fallback, siteData) {
    return {
        intentId: null,
        intentName: 'fallback',
        message: interpolateResponse(fallback.message, siteData),
        supportingMessage: null,
        ctaMessage: null,
        tone: fallback.tone || 'friendly',
        score: 0,
        isFallback: true
    };
}

/**
 * Main intent matching function
 * @param {string} userMessage - Raw user message
 * @param {object} snapshot - Complete snapshot object
 * @returns {object} Response object
 */
export function matchIntent(userMessage, snapshot) {
    // Normalize input
    const normalizedInput = normalizeInput(userMessage);

    // Score all intents
    const scores = scoreAllIntents(normalizedInput, snapshot.intents || []);

    // Select best intent
    const selectedIntent = selectBestIntent(scores, snapshot.intents || []);

    // Build response
    if (selectedIntent) {
        return buildIntentResponse(
            selectedIntent,
            scores[selectedIntent.id],
            snapshot.siteData || {}
        );
    } else {
        const fallback = selectFallback(snapshot.fallbacks || []);
        return buildFallbackResponse(fallback, snapshot.siteData || {});
    }
}

/**
 * Test function that returns detailed scoring info
 * Used by admin test console
 * @param {string} userMessage - Raw user message
 * @param {object} snapshot - Complete snapshot object
 * @returns {object} Detailed test result
 */
export function testIntent(userMessage, snapshot) {
    const normalizedInput = normalizeInput(userMessage);
    const scores = scoreAllIntents(normalizedInput, snapshot.intents || []);
    const selectedIntent = selectBestIntent(scores, snapshot.intents || []);

    // Get detailed breakdown for selected intent
    let scoreBreakdown = null;
    if (selectedIntent) {
        scoreBreakdown = scoreIntent(normalizedInput, selectedIntent, true);
    }

    // Get all intents with their breakdowns (top 5)
    const allIntentsWithBreakdown = (snapshot.intents || [])
        .filter(intent => scores[intent.id] > 0)
        .map(intent => ({
            id: intent.id,
            name: intent.name,
            score: scores[intent.id],
            priority: intent.priority || 5,
            breakdown: scoreIntent(normalizedInput, intent, true)
        }))
        .sort((a, b) => {
            if (a.priority !== b.priority) return b.priority - a.priority;
            return b.score - a.score;
        })
        .slice(0, 5);

    return {
        normalizedInput,
        allScores: scores,
        selectedIntent: selectedIntent ? {
            id: selectedIntent.id,
            name: selectedIntent.name,
            score: scores[selectedIntent.id],
            priority: selectedIntent.priority || 5,
            scoreBreakdown
        } : null,
        allIntentsWithBreakdown,
        response: selectedIntent
            ? buildIntentResponse(selectedIntent, scores[selectedIntent.id], snapshot.siteData || {})
            : buildFallbackResponse(selectFallback(snapshot.fallbacks || []), snapshot.siteData || {}),
        isFallback: !selectedIntent
    };
}

export default {
    matchIntent,
    testIntent,
    normalizeInput,
    scoreIntent,
    scoreAllIntents,
    selectBestIntent,
    selectFallback,
    interpolateResponse
};
