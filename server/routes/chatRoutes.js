import express from 'express';
import { matchIntent } from '../services/intentEngine.js';
import { buildPrompt } from '../services/promptBuilder.js';
import { generateResponse } from '../services/llmService.js';
import { validateResponse } from '../services/responseValidator.js';
import businessConfig from '../data/businessConfig.json' with { type: 'json' };

const router = express.Router();

// Intent Snapshot (Normalde DB'den gelir, şimdilik statik config'den türetelim)
// intentEngine'in beklediği formatta basit bir yapı oluşturuyoruz
const snapshot = {
    intents: [], // Kural tabanlı intentler şimdilik boş, dinamik LLM kullanacağız
    siteData: businessConfig,
    fallbacks: businessConfig.fallbacks.map(msg => ({ message: msg }))
};

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Mesaj boş olamaz" });
        }

        console.log(`[Chat] Yeni mesaj: "${message}"`);

        // 1. Intent Analizi (Basit Keyword Check - Context Belirlemek İçin)
        // intentEngine kullanarak kullanıcının ne hakkında konuştuğunu kabaca anla
        // Bu adım hangi veriyi LLM'e vereceğimizi seçer (Token tasarrufu ve odaklanma)
        const lowerMsg = message.toLowerCase();
        let contextData = {};
        let detectedTopic = "general";

        if (lowerMsg.includes("fiyat") || lowerMsg.includes("ücret") || lowerMsg.includes("paket") || lowerMsg.includes("kaç tl")) {
            detectedTopic = "pricing";
            contextData = { packages: businessConfig.packages, policies: businessConfig.policies };
        } else if (lowerMsg.includes("iletişim") || lowerMsg.includes("adres") || lowerMsg.includes("telefon") || lowerMsg.includes("nerede")) {
            detectedTopic = "contact";
            contextData = { company: businessConfig.company };
        } else {
            // Genel sorular için şirket bilgisi ve feature'lar yeterli
            detectedTopic = "general";
            contextData = {
                company: businessConfig.company,
                packageNames: businessConfig.packages.map(p => p.name) // Sadece isimleri ver, fiyatları verme
            };
        }

        console.log(`[Chat] Algılanan Konu: ${detectedTopic}`);

        // 2. LLM Üretimi
        const prompt = buildPrompt(detectedTopic, contextData, message);
        const rawResponse = await generateResponse(prompt);

        // 3. Validasyon & Güvenlik
        const validation = validateResponse(rawResponse, contextData);

        if (!validation.isValid) {
            console.warn(`[Chat] Güvenlik İhlali: ${validation.reason}`);
            // Fallback dön
            const fallbackMsg = businessConfig.fallbacks[0];
            return res.json({
                response: fallbackMsg,
                source: "fallback",
                debug: { reason: validation.reason }
            });
        }

        // Başarılı
        return res.json({
            response: rawResponse,
            source: "verified_llm",
            topic: detectedTopic
        });

    } catch (error) {
        console.error("[Chat] Sunucu hatası:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

export default router;
