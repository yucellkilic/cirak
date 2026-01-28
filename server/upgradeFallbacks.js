/**
 * Fallback Quality Upgrade Script
 * 
 * Replaces generic fallback messages with helpful, action-oriented ones
 */

import db from './database.js';

// Clear existing fallbacks
console.log('🗑️  Clearing old fallbacks...');
db.prepare('DELETE FROM fallbacks').run();

// High-quality fallback messages
const qualityFallbacks = [
    {
        id: 'fallback_001',
        message: 'Sorunuzu tam olarak anlayamadım. Size daha iyi yardımcı olabilmem için lütfen sorunuzu biraz daha detaylandırır mısınız?',
        tone: 'friendly',
        active: 1
    },
    {
        id: 'fallback_002',
        message: 'Bu konuda size yardımcı olmak isterim! Şu konulardan biri hakkında bilgi almak ister misiniz: Fiyatlar, Teslim Süresi, Paket İçeriği, İletişim Bilgileri?',
        tone: 'helpful',
        active: 1
    },
    {
        id: 'fallback_003',
        message: 'Aradığınız bilgiyi bulamadım. Detaylı bilgi için bize WhatsApp üzerinden ulaşabilir veya e-posta gönderebilirsiniz: info@yucelkilic.tr',
        tone: 'professional',
        active: 1
    },
    {
        id: 'fallback_004',
        message: 'Özel durumunuz için size özel bir çözüm sunabiliriz. +90 505 519 63 00 numaralı WhatsApp hattımızdan bize ulaşın, hemen yardımcı olalım!',
        tone: 'sales',
        active: 1
    },
    {
        id: 'fallback_005',
        message: 'Bu sorunuzun cevabını henüz ekleyemedim. Ancak size yardımcı olmak için buradayım! Lütfen sorunuzu farklı kelimelerle tekrar sorar mısınız?',
        tone: 'friendly',
        active: 1
    }
];

console.log('✨ Adding high-quality fallback messages...');

const insertFallback = db.prepare(`
    INSERT INTO fallbacks (id, message, tone, active)
    VALUES (?, ?, ?, ?)
`);

for (const fallback of qualityFallbacks) {
    insertFallback.run(
        fallback.id,
        fallback.message,
        fallback.tone,
        fallback.active
    );
    console.log(`  ✓ Added: ${fallback.id}`);
}

console.log('\n✅ Fallback upgrade complete!');
console.log(`📊 Total fallbacks: ${qualityFallbacks.length}`);
console.log('\n💡 Fallback Strategy:');
console.log('  1. Ask for clarification (friendly)');
console.log('  2. Suggest topics (helpful)');
console.log('  3. Provide contact info (professional)');
console.log('  4. Encourage direct contact (sales)');
console.log('  5. Request rephrase (friendly)');
console.log('\n🔄 Remember to rebuild snapshot for changes to apply!');
