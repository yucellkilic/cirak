/**
 * Snapshot Manager - In-Memory Snapshot Cache
 * 
 * Manages snapshot lifecycle:
 * - Load snapshot into memory
 * - Cache for fast access
 * - Rebuild on demand
 * - Keep previous snapshot for rollback
 */

import { buildSnapshot, validateSnapshot } from './snapshotBuilder.js';

// In-memory snapshot cache
let currentSnapshot = null;
let previousSnapshot = null;

/**
 * Load snapshot into memory
 * @param {boolean} force - Force rebuild even if cached
 * @returns {object} Current snapshot
 */
export function loadSnapshot(force = false) {
    if (currentSnapshot && !force) {
        return currentSnapshot;
    }

    // Build new snapshot
    const newSnapshot = buildSnapshot();

    // Validate
    if (!validateSnapshot(newSnapshot)) {
        throw new Error('Invalid snapshot generated');
    }

    // Keep previous for rollback
    if (currentSnapshot) {
        previousSnapshot = currentSnapshot;
    }

    // Update current
    currentSnapshot = newSnapshot;

    console.log(`📸 Snapshot loaded: ${newSnapshot.intents.length} intents, ${newSnapshot.fallbacks.length} fallbacks`);

    return currentSnapshot;
}

/**
 * Get current snapshot (read-only)
 * @returns {object|null} Current snapshot or null
 */
export function getSnapshot() {
    if (!currentSnapshot) {
        return loadSnapshot();
    }
    return currentSnapshot;
}

/**
 * Rebuild snapshot from database
 * @returns {object} New snapshot
 */
export function rebuildSnapshot() {
    console.log('🔄 Rebuilding snapshot from database...');
    return loadSnapshot(true);
}

/**
 * Rollback to previous snapshot
 * @returns {object|null} Previous snapshot or null
 */
export function rollbackSnapshot() {
    if (!previousSnapshot) {
        console.warn('⚠️  No previous snapshot available for rollback');
        return null;
    }

    console.log('⏪ Rolling back to previous snapshot...');
    const temp = currentSnapshot;
    currentSnapshot = previousSnapshot;
    previousSnapshot = temp;

    return currentSnapshot;
}

/**
 * Get snapshot metadata
 * @returns {object} Snapshot metadata
 */
export function getSnapshotMetadata() {
    if (!currentSnapshot) {
        return null;
    }

    return {
        version: currentSnapshot.version,
        generatedAt: currentSnapshot.generatedAt,
        intentCount: currentSnapshot.intents.length,
        fallbackCount: currentSnapshot.fallbacks.length,
        hasPrevious: previousSnapshot !== null
    };
}

/**
 * Initialize snapshot on server start
 */
export function initializeSnapshot() {
    try {
        loadSnapshot();
        console.log('✅ Snapshot initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize snapshot:', error);
        throw error;
    }
}

/**
 * Get previous snapshot (for diff comparison)
 * @returns {object|null} Previous snapshot or null
 */
export function getPreviousSnapshot() {
    return previousSnapshot;
}

export default {
    loadSnapshot,
    getSnapshot,
    getPreviousSnapshot,
    rebuildSnapshot,
    rollbackSnapshot,
    getSnapshotMetadata,
    initializeSnapshot
};
