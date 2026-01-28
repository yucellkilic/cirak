/**
 * CIRAK API Route
 * Implements the Guarded LLM Flow with Strict Conversation Rules and Deterministic Detection.
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPrompt } from '../services/promptBuilder.js';
import { generateResponse } from '../services/llmService.js';
import { validateResponse } from '../services/responseGuard.js';
import { detectIntent } from '../services/intentDetector.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Presets
const presetsPath = path.join(__dirname, '../data/presets.json');
const presets = JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));

/**
 * Returns the standard preset menu response
 */
function sendPresetMenu(res) {
    return res.json({
        response: presets.intro.message,
        options: presets.intro.options,
        source: "preset_menu"
    });
}

router.post('/message', async (req, res) => {
    try {
        const { message, isFirstMessage } = req.body;

        // 1. First Message Check (Strict Rule: NO LLM)
        if (isFirstMessage === true || isFirstMessage === 'true') {
            return sendPresetMenu(res);
        }

        if (!message) {
            return sendPresetMenu(res);
        }

        // 2. Deterministic Intent Detection (New Logic)
        const matchedIntent = detectIntent(message);

        // 3. Fallback: If no intent found, return Menu
        if (!matchedIntent) {
            console.log(`[Flow] No intent matched for: "${message}". Returning menu.`);
            return sendPresetMenu(res);
        }

        const intentName = matchedIntent.intent;
        console.log(`[Flow] Matched intent: ${intentName}`);

        // SPECIAL CASE: Pricing Details (Deterministic Bypass)
        if (intentName === 'pricing_details') {
            const { formatPricingResponse } = await import('../services/pricingService.js');
            return res.json({
                response: formatPricingResponse(),
                source: "deterministic_pricing_engine",
                intent: intentName
            });
        }

        // 4. Data Usage (Use data directly from the matched intent object if available)
        // The intent files now serve as both detection rules AND data source.
        let intentData = matchedIntent.data || {};

        // If data is empty for some reason, try reloading strictly (extra safety)
        if (Object.keys(intentData).length === 0) {
            // Try searching for a "price.json" style fallback if needed, but we migrated data.
            // If intent is 'corporate_packages', we expect 'data' field.
            console.warn(`[Data] Intent matched but no data found in object.`);
            return sendPresetMenu(res);
        }

        // 5. Call LLM (Guarded Flow)
        const prompt = buildPrompt(intentName, intentData, message);
        console.log(`[LLM] Calling for intent: ${intentName}`);

        const llmOutput = await generateResponse(prompt);

        if (!llmOutput) {
            return sendPresetMenu(res); // LLM failure fallback
        }

        // 6. Validate (Guard)
        const isValid = validateResponse(llmOutput, intentData);
        if (!isValid) {
            console.warn(`[Guard] Blocked response. Returning menu.`);
            return sendPresetMenu(res); // Validation failure fallback
        }

        // Success
        res.json({
            response: llmOutput,
            source: "verified_llm",
            intent: intentName
        });

    } catch (error) {
        console.error("[Server] Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
