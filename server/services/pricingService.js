import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICING_FILE = path.join(__dirname, '../data/pricing.json');

export function getPricing() {
    try {
        if (!fs.existsSync(PRICING_FILE)) {
            return { currency: "TL", packages: [] };
        }
        return JSON.parse(fs.readFileSync(PRICING_FILE, 'utf-8'));
    } catch (error) {
        console.error("Error reading pricing:", error);
        return { currency: "TL", packages: [] };
    }
}

export function updatePricing(newData) {
    try {
        // Validation: Ensure structure integrity
        if (!newData.packages || !Array.isArray(newData.packages)) {
            throw new Error("Invalid pricing data structure");
        }

        fs.writeFileSync(PRICING_FILE, JSON.stringify(newData, null, 2));
        return true;
    } catch (error) {
        console.error("Error updating pricing:", error);
        throw error;
    }
}

export function formatPricingResponse() {
    const data = getPricing();
    let response = "Kurumsal web sitesi paketlerimiz:\n";

    data.packages.forEach(pkg => {
        response += `- ${pkg.name}: ${pkg.price} ${data.currency}\n`;
    });

    return response.trim();
}
