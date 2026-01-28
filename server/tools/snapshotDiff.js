/**
 * Snapshot Diff Tool
 * 
 * Compares current and previous snapshots to show changes
 */

import { getSnapshot, getPreviousSnapshot } from '../services/snapshotManager.js';

/**
 * Generate diff between current and previous snapshot
 * @returns {object} Diff object
 */
export function generateSnapshotDiff() {
    const current = getSnapshot();
    const previous = getPreviousSnapshot();

    if (!previous) {
        return {
            error: 'No previous snapshot available',
            current: {
                version: current.version,
                generatedAt: current.generatedAt,
                intentCount: current.intents.length
            }
        };
    }

    const diff = {
        current: {
            version: current.version,
            generatedAt: current.generatedAt,
            intentCount: current.intents.length
        },
        previous: {
            version: previous.version,
            generatedAt: previous.generatedAt,
            intentCount: previous.intents.length
        },
        changes: {
            intentsAdded: [],
            intentsRemoved: [],
            intentsModified: []
        }
    };

    // Build ID sets
    const currentIds = new Set(current.intents.map(i => i.id));
    const previousIds = new Set(previous.intents.map(i => i.id));

    // Detect added intents
    current.intents.forEach(intent => {
        if (!previousIds.has(intent.id)) {
            diff.changes.intentsAdded.push({
                id: intent.id,
                name: intent.name,
                keywordCount: intent.keywords.length
            });
        }
    });

    // Detect removed intents
    previous.intents.forEach(intent => {
        if (!currentIds.has(intent.id)) {
            diff.changes.intentsRemoved.push({
                id: intent.id,
                name: intent.name
            });
        }
    });

    // Detect modified intents
    current.intents.forEach(currentIntent => {
        const prevIntent = previous.intents.find(i => i.id === currentIntent.id);
        if (!prevIntent) return;

        const changes = {};

        // Check response changes
        if (currentIntent.response.main !== prevIntent.response.main) {
            changes.responseChanged = true;
        }

        // Check keyword changes
        const currentKeywords = new Set(currentIntent.keywords.map(k => k.text));
        const prevKeywords = new Set(prevIntent.keywords.map(k => k.text));

        const keywordsAdded = [...currentKeywords].filter(k => !prevKeywords.has(k));
        const keywordsRemoved = [...prevKeywords].filter(k => !currentKeywords.has(k));

        if (keywordsAdded.length > 0) changes.keywordsAdded = keywordsAdded;
        if (keywordsRemoved.length > 0) changes.keywordsRemoved = keywordsRemoved;

        // Check priority change
        if (currentIntent.priority !== prevIntent.priority) {
            changes.priorityChanged = {
                from: prevIntent.priority,
                to: currentIntent.priority
            };
        }

        if (Object.keys(changes).length > 0) {
            diff.changes.intentsModified.push({
                id: currentIntent.id,
                name: currentIntent.name,
                changes
            });
        }
    });

    return diff;
}

export default {
    generateSnapshotDiff
};
