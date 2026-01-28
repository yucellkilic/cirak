/**
 * LLM Service
 * Direct interface with OpenRouter.
 */
import OpenAI from 'openai';
import { LLM_CONFIG } from '../config/llm.js';

const openai = new OpenAI({
    baseURL: LLM_CONFIG.baseURL,
    apiKey: LLM_CONFIG.apiKey,
    defaultHeaders: {
        "HTTP-Referer": "https://cirak-web.com",
        "X-Title": "Cirak AI"
    }
});

export async function generateResponse(promptObject) {
    try {
        const completion = await openai.chat.completions.create({
            model: LLM_CONFIG.model,
            messages: [
                { role: "system", content: promptObject.system },
                { role: "user", content: promptObject.user }
            ],
            temperature: LLM_CONFIG.temperature,
            top_p: LLM_CONFIG.top_p,
            max_tokens: LLM_CONFIG.max_tokens
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("[LLM Service] Error:", error);
        return null;
    }
}
