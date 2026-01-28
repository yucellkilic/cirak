
import { loadIntents, normalizeInput } from './intentDetector.js';

export const CONFLICT_TYPES = {
    KEY_DUPLICATION: 'KEY_DUPLICATION', // Critical
    AMBIGUOUS_INPUT: 'AMBIGUOUS_INPUT', // Warning (Shadowing)
};

/**
 * Scans all intents for conflicts.
 * @returns {Array} List of conflict objects
 */
export function getAllConflicts() {
    const intents = loadIntents(); // Already sorted by priority
    const conflicts = [];

    const allKeys = []; // Array of { key: string, intent: string, priority: number }

    // 1. Flatten all keys
    intents.forEach(intent => {
        if (!intent.keys) return;
        intent.keys.forEach(k => {
            allKeys.push({
                key: k.normalized,
                original: k.display,
                intent: intent.intent,
                intentLabel: intent.label,
                priority: intent.priority || 0
            });
        });
    });

    // 2. Check for Duplicates (CRITICAL)
    // Map: key -> [intentNames]
    const keyMap = {};
    allKeys.forEach(entry => {
        if (!keyMap[entry.key]) keyMap[entry.key] = [];
        // Avoid duplicate intent entries for same key (if user added same key twice in same intent, that's local issue, but here we care about cross-intent)
        if (!keyMap[entry.key].some(i => i.intent === entry.intent)) {
            keyMap[entry.key].push(entry);
        }
    });

    for (const [key, entries] of Object.entries(keyMap)) {
        if (entries.length > 1) {
            conflicts.push({
                type: CONFLICT_TYPES.KEY_DUPLICATION,
                severity: 'critical',
                key: key,
                involvedIntents: entries.map(e => e.intentLabel || e.intent),
                message: `The key "${key}" is defined in multiple intents: ${entries.map(e => e.intent).join(', ')}.`
            });
        }
    }

    // 3. Check for Substring/Ambiguity (WARNING)
    // O(N^2) check? N is total keys. Typically small enough (<1000).
    // If Key A (Intent 1) is a substring of Key B (Intent 2), input "Key B" matches both.
    // If Intent 2 has higher priority -> Fine (Correctly catches specific case).
    // If Intent 1 has higher priority -> Problem (Specific case Key B will trigger General Intent 1).

    // We only care if specific key is shadowed by generic key with HIGHER priority.
    // i.e. Generic "fiyat" (Priority 10) vs Specific "fiyat teklifi" (Priority 5).
    // Input "Fiyat teklifi" -> Includes "fiyat". Matches Generic.
    // Expected: Matches Specific.
    // Conflict: Generic blocks Specific.

    allKeys.forEach(shorter => {
        allKeys.forEach(longer => {
            if (shorter.intent === longer.intent) return; // Same intent overlap is fine/internal
            if (shorter.key === longer.key) return; // Handled by duplication check

            if (longer.key.includes(shorter.key)) {
                // "shorter" matches inside "longer".
                // If "shorter" has HIGHER or EQUAL priority, it will steal the match from "longer".
                // (Assuming detector implementation iterates priority high->low OR finds all and sorts).
                // Our detector: "Iterate all intents... returns first match".
                // Detector usually iterates intents in order.

                // If shorter.priority >= longer.priority:
                // Input: longer.key
                // Match 1: shorter (succeeds because inclusions) -> RETURNED
                // Match 2: longer (ignored)
                // RESULT: Wrong intent? 

                if (shorter.priority > longer.priority) {
                    conflicts.push({
                        type: CONFLICT_TYPES.AMBIGUOUS_INPUT,
                        severity: 'warning',
                        input: longer.key,
                        triggerKey: shorter.key,
                        winningIntent: shorter.intentLabel,
                        shadowedIntent: longer.intentLabel,
                        message: `Input "${longer.original}" will match higher priority intent "${shorter.intentLabel}" (via key "${shorter.original}") instead of "${longer.intentLabel}".`
                    });
                }
            }
        });
    });

    return conflicts;
}

/**
 * Validates a single new key before insertion.
 * @param {string} newKeyDisplay 
 * @param {string} targetIntentName 
 * @returns {object|null} Conflict object if critical, null if safe
 */
export function validateNewKey(newKeyDisplay, targetIntentName) {
    const normalized = normalizeInput(newKeyDisplay);
    const intents = loadIntents();

    // Check exact duplication
    for (const intent of intents) {
        if (intent.intent === targetIntentName) continue; // Skip self

        for (const k of intent.keys) {
            if (k.normalized === normalized) {
                return {
                    type: CONFLICT_TYPES.KEY_DUPLICATION,
                    severity: 'critical',
                    key: normalized,
                    conflictingIntent: intent.label || intent.intent,
                    message: `Key "${newKeyDisplay}" already exists in "${intent.label}"`
                };
            }
        }
    }

    return null;
}
