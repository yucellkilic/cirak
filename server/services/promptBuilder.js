/**
 * Prompt Builder Service
 * Injects data into the mandatory template.
 */
import { SYSTEM_PROMPT } from '../config/llm.js';

export function buildPrompt(intentName, jsonData, userQuery) {
    // Escape JSON string to prevent prompt injection
    const jsonString = JSON.stringify(jsonData, null, 2);

    const userContent = `INTENT:
${intentName}

DATA:
${jsonString}

TASK:
Explain the information above to the user using ONLY the data.`;

    // Note: We ignore the actual userQuery content in the "DATA" section context 
    // to strictly prevent the LLM from focusing on user instructions.
    // However, for a Q&A style, we might need to know WHAT the user asked.
    // The prompt template in requirements says:
    // INTENT, DATA, TASK. It doesn't explicitly have a "USER QUERY" field 
    // but usually, the LLM needs to know what to extract.
    // BUT the requirement says "Explain the information above to the user".
    // This implies summarizing the intent data relevant to the user's implicit need.
    // If the user asks specific questions, the current strict prompt structure might just dump the data.
    // Let's stick EXACTLY to the User Prompt Template provided in the request.

    return {
        system: SYSTEM_PROMPT,
        user: userContent
    };
}
