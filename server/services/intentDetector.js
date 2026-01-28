/**
 * Deterministic Intent Detector
 * STRICTLY key-based matching. NO LLM. NO Embeddings.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTENTS_DIR = path.join(__dirname, '../data/intents');

// Cache intents in memory
let cachedIntents = null;
let lastLoadTime = 0;

function loadIntents(force = false) {
    // Refresh cache every 10 seconds or if forced (e.g. admin update)
    if (!force && cachedIntents && (Date.now() - lastLoadTime < 10000)) {
        return cachedIntents;
    }

    // Filter out simple price.json if separate intents exist (it's business data vs intent rule)
    // We only load files that have "keys" structure.
    const files = fs.readdirSync(INTENTS_DIR).filter(file => file.endsWith('.json'));
    const intents = [];

    files.forEach(file => {
        try {
            const filePath = path.join(INTENTS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Only load enabled intents that have keys
            if (data.enabled !== false && data.intent && Array.isArray(data.keys)) {
                intents.push(data);
            }
        } catch (error) {
            console.error(`[IntentDetector] Error loading ${file}:`, error);
        }
    });

    // Sort by priority (higher first)
    intents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    cachedIntents = intents;
    lastLoadTime = Date.now();
    return intents;
}

/**
 * Normalizes input string for consistent matching
 * Rules: lowercase, trim, remove punctuation, normalize TR chars
 * @param {string} input 
 * @returns {string} Normalized string
 */
export function normalizeInput(input) {
    if (!input) return '';

    return input
        .toLowerCase()
        .trim()
        .replace(/[.,?!:;()\-]/g, '') // Remove punctuation
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');
}

/**
 * Detects intent from user message using simple string matching
 * @param {string} message 
 * @returns {object|null} Matched intent object or null
 */
export function detectIntent(message) {
    if (!message) return null;

    const normalizedMsg = normalizeInput(message);
    const intents = loadIntents();

    // Iterate all intents
    for (const intentObj of intents) {
        // Check all keys
        for (const keyObj of intentObj.keys) {
            // New structure: keyObj = { display: "...", normalized: "..." }
            // Logic: Does the normalized message include the normalized key?

            // Safety check if migration failed or legacy format exists
            const keyStr = typeof keyObj === 'string' ? keyObj : keyObj.normalized;

            // Since we pre-normalized keys in migration, we can trust 'normalized' field.
            // But let's be safe and re-normalize if needed.
            // If they match perfectly or inclusion?
            // "fiyat" in "fiyat ne kadar" -> Yes.

            if (normalizedMsg.includes(keyStr)) {
                return intentObj;
            }
        }
    }

    return null;
}

// Force reload helper for admin updates
export function reloadIntents() {
    loadIntents(true);
}
