import express from 'express';
import { getPricing, updatePricing } from '../services/pricingService.js';

const router = express.Router();

router.get('/pricing', (req, res) => {
    try {
        const data = getPricing();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/pricing', (req, res) => {
    try {
        const newData = req.body;
        updatePricing(newData);
        res.json({ success: true, data: newData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
