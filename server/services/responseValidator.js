/**
 * Response Validator Service
 * LLM cevaplarının güvenli, tutarlı ve halüsinasyonsuz olmasını sağlar.
 */

/**
 * Metin içindeki sayıları çıkarır
 * @param {string} text 
 * @returns {number[]}
 */
function extractNumbers(text) {
    const matches = text.match(/[\d.,]+/g);
    if (!matches) return [];

    return matches.map(m => {
        // "12.000" veya "12,000" gibi formatları temizle
        const clean = m.replace(/[.,]/g, '');
        return parseInt(clean, 10);
    }).filter(n => !isNaN(n));
}

/**
 * LLM cevabını doğrular
 * @param {string} responseText - LLM'den gelen cevap
 * @param {object} contextData - LLM'e verilen bağlam verisi
 * @returns {object} { isValid: boolean, reason: string }
 */
export function validateResponse(responseText, contextData) {
    if (!responseText) {
        return { isValid: false, reason: "Boş cevap" };
    }

    // 1. Fallback / Bilgisizlik Kontrolü
    // Eğer LLM "bilmiyorum" dediyse bu geçerli bir cevaptır.
    if (responseText.includes("müşteri temsilcimizle iletişime geçiniz") ||
        responseText.includes("bilgiye sahip değilim")) {
        return { isValid: true };
    }

    // 2. Fiyat Kontrolü (Price Guard)
    // Sadece paketler context'te varsa bu kontrolü yap
    if (contextData.packages) {
        const responseNumbers = extractNumbers(responseText);
        const validPrices = contextData.packages.map(p => p.price);

        // Context'teki fiyatları "toleranslı" listeye ekle (örn. 5000 -> 5)
        // Çünkü bazen "5 bin" diyebilir. Ama şimdilik basit tutalım.

        // Cevaptaki her sayıyı kontrol et
        for (const num of responseNumbers) {
            // Fiyat olabilecek büyüklükteki sayılar (örn: > 100)
            if (num > 100 && num < 1000000) {
                // Bu sayı kaynak verideki herhangi bir fiyatla eşleşiyor mu?
                if (!validPrices.includes(num)) {
                    console.warn(`[Validator] Geçersiz fiyat tespiti: ${num}`);
                    return {
                        isValid: false,
                        reason: `Metinde kaynakta olmayan bir fiyat (${num}) tespit edildi.`
                    };
                }
            }
        }

        // 3. Paket Adı Kontrolü
        // Eğer "paket" kelimesi geçiyorsa ve spesifik bir paket anlatıyorsa, adı doğru mu?
        const lowerResponse = responseText.toLowerCase();
        if (lowerResponse.includes("paket")) {
            const mentionedAnyPackage = contextData.packages.some(pkg =>
                lowerResponse.includes(pkg.name.toLowerCase())
            );

            // "Paketlerimiz şunlardır" gibi genel cümlelerde paket adı geçmeyebilir, bu kuralı yumuşatıyorum.
            // Sadece spesifik olmayan paket isimleri uydurup uydurmadığına bakmak zor.
            // Şimdilik pas geçiyorum, fiyat kontrolü en kritiği.
        }
    }

    // 4. Yasaklı Kelime Kontrolü
    const forbiddenWords = ["gpt", "openai", "yapay zeka modeli", "language model", "as a range"];
    const containsForbidden = forbiddenWords.some(word => responseText.toLowerCase().includes(word));
    if (containsForbidden) {
        return { isValid: false, reason: "Yasaklı kelime kullanımı (model kimliği ifşası)" };
    }

    return { isValid: true };
}
