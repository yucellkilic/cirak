
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTENTS_DIR = path.join(__dirname, '../data/intents');

function normalizeInput(input) {
    if (!input) return '';
    return input
        .toLowerCase()
        .trim()
        .replace(/[.,?!:;()\-]/g, '')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');
}

const files = fs.readdirSync(INTENTS_DIR).filter(file => file.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(INTENTS_DIR, file);
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        // Add new metadata fields if missing
        if (data.enabled === undefined) data.enabled = true;
        if (data.priority === undefined) data.priority = 1;

        // Convert keys array of strings to array of objects
        if (Array.isArray(data.keys)) {
            const newKeys = [];
            const seen = new Set();

            data.keys.forEach(k => {
                if (typeof k === 'string') {
                    const normalized = normalizeInput(k);
                    // Deduplicate based on display text
                    if (!seen.has(k)) {
                        newKeys.push({
                            display: k,
                            normalized: normalized
                        });
                        seen.add(k);
                    }
                } else {
                    // Already object? Keep it.
                    newKeys.push(k);
                }
            });
            data.keys = newKeys;
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Migrated ${file}`);
    } catch (e) {
        console.error(`Error migrating ${file}:`, e);
    }
});
