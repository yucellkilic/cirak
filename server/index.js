import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';
import cirakRoutes from './routes/cirak.js';
import adminRoutes from './routes/admin.js';
import adminToolsRoutes from './routes/adminTools.js';
import analyticsRoutes from './routes/analytics.js';
import chatRoutes from './routes/chatRoutes.js';
import { initializeSnapshot } from './services/snapshotManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize snapshot on server start
try {
    initializeSnapshot();
} catch (error) {
    console.error('❌ Failed to initialize snapshot. Server may not work correctly.');
}

// ÇIRAK API Routes
// ÇIRAK API Routes
app.use('/api/cirak', cirakRoutes);
// app.use('/api/admin', cirakRoutes); // REMOVED: cirak.js is now strictly for Guarded Messaging
app.use('/api/admin', adminRoutes); // Admin CRUD routes
app.use('/api/admin', adminToolsRoutes); // Admin tools routes
app.use('/api/admin/analytics', analyticsRoutes); // Analytics routes
// app.use('/api/v2/cirak', chatRoutes); // REMOVED: Superseded by Guarded System

// Legacy Public API - For Widget (deprecated, use /api/cirak/message)
app.get('/api/public/config', (req, res) => {
    try {
        const settings = db.prepare('SELECT * FROM settings').all();
        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        const intents = db.prepare(`
      SELECT i.*, GROUP_CONCAT(k.keyword_text) as keywords
      FROM intents i
      LEFT JOIN keywords k ON i.intent_id = k.intent_id
      WHERE i.is_active = 1
      GROUP BY i.id
    `).all();

        const formattedIntents = intents.map(intent => ({
            ...intent,
            intent_keywords: intent.keywords ? intent.keywords.split(',') : []
        }));

        res.json({ config, intents: formattedIntents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

import adminIntentRoutes from './routes/adminIntents.js';
import adminPricingRoutes from './routes/adminPricing.js';

// ... (imports)

// Mount new admin intent routes (Replacing legacy inline ones)
app.use('/api/admin', adminIntentRoutes);
app.use('/api/admin', adminPricingRoutes);

// Legacy Intent Routes Removed (Delegated to adminIntents.js)


app.use('/api/admin/analytics', analyticsRoutes); // Analytics routes

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Widget API: http://localhost:${PORT}/api/cirak/message`);
    console.log(`🧪 Test API: http://localhost:${PORT}/api/admin/test/intent`);
});

