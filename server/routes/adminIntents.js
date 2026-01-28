
/**
 * Admin Intent Management Routes
 * Direct JSON file manipulation + Conflict Detection.
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeInput, reloadIntents } from '../services/intentDetector.js';
import { validateNewKey, getAllConflicts } from '../services/conflictDetector.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTENTS_DIR = path.join(__dirname, '../data/intents');

// Helper to get file path
const getFilePath = (intentName) => path.join(INTENTS_DIR, `${intentName}.json`);

// 1. GET All Intents
router.get('/intents', (req, res) => {
    try {
        const files = fs.readdirSync(INTENTS_DIR).filter(f => f.endsWith('.json'));
        const intents = [];

        files.forEach(file => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(INTENTS_DIR, file), 'utf-8'));
                if (data.intent) {
                    intents.push({
                        filename: file,
                        ...data
                    });
                }
            } catch (e) { }
        });

        intents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        res.json(intents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/conflicts
router.get('/conflicts', (req, res) => {
    try {
        const conflicts = getAllConflicts();
        res.json(conflicts);
    } catch (error) {
        console.error("Conflict check error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. PUT Update Intent Metadata
router.put('/intents/:intentName', (req, res) => {
    try {
        const { intentName } = req.params;
        const { label, description, enabled, priority } = req.body;

        const filePath = getFilePath(intentName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Intent not found' });

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (label !== undefined) data.label = label;
        if (description !== undefined) data.description = description;
        if (enabled !== undefined) data.enabled = enabled;
        if (priority !== undefined) data.priority = parseInt(priority);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        reloadIntents();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. POST Add Key (With Conflict Check)
router.post('/intents/:intentName/keys', (req, res) => {
    try {
        const { intentName } = req.params;
        const { display } = req.body;

        if (!display) return res.status(400).json({ error: 'Display key required' });

        const filePath = getFilePath(intentName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Intent not found' });

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Auto-normalize
        const normalized = normalizeInput(display);

        // 1. Check local duplicate (same intent)
        if (data.keys.some(k => k.normalized === normalized)) {
            return res.status(400).json({ error: 'Key already exists in this intent' });
        }

        // 2. Check global conflict (other intents) - CRITICAL ONLY
        const conflict = validateNewKey(display, data.intent);
        if (conflict && conflict.severity === 'critical') {
            return res.status(409).json({
                error: `Startling Conflict: ${conflict.message}`,
                conflict
            });
        }

        const newKey = { display, normalized };
        data.keys.push(newKey);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        reloadIntents();
        res.json(newKey);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE Key
router.delete('/intents/:intentName/keys/:normalizedKey', (req, res) => {
    try {
        const { intentName, normalizedKey } = req.params;

        const filePath = getFilePath(intentName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Intent not found' });

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const initialLength = data.keys.length;
        data.keys = data.keys.filter(k => k.normalized !== normalizedKey);

        if (data.keys.length === initialLength) {
            return res.status(404).json({ error: 'Key not found' });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        reloadIntents();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
