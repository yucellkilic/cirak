/**
 * Real User Scenario Testing Script
 * 
 * Tests 20+ realistic user queries against the intent engine
 * Outputs results table with recommendations
 */

const testQueries = [
    // Pricing queries (should match pricing_corporate)
    "web sitesi yaptırmak ne kadar tutar",
    "kurumsal site fiyatları nedir",
    "bütçem 10 bin tl site yapabilir misiniz",
    "en ucuz paket kaç para",

    // Delivery time queries (should match delivery_time)
    "siteyi ne kadar sürede teslim edersiniz",
    "kaç günde hazır olur",
    "acil bir projem var hemen yapabilir misiniz",

    // Services queries (should match included_services)
    "sitede neler var",
    "mobil uyumlu mu olacak",
    "seo çalışması dahil mi",

    // Process queries (should match process_flow)
    "nasıl çalışıyorsunuz",
    "önce ne yapıyoruz",
    "tasarım süreci nasıl",

    // Contact queries (should match contact_info)
    "size nasıl ulaşabilirim",
    "whatsapp numaranız var mı",
    "mail adresiniz nedir",

    // General web info (should match general_web_info)
    "neden web sitesi gerekli",
    "site yaptırmak mantıklı mı",

    // Site continuity (should match site_continuity)
    "site sonradan kapanır mı",
    "hosting ücreti var mı",
    "domain yenileme gerekir mi",

    // Edge cases / potential fallbacks
    "logo tasarımı yapıyor musunuz",
    "sosyal medya yönetimi hizmeti var mı",
    "e-ticaret sitesi yapıyor musunuz",
    "mobil uygulama geliştirme",
    "google reklamları veriyor musunuz",
    "instagram hesabı açar mısınız"
];

console.log('🧪 Starting Real User Scenario Testing...\n');
console.log(`📊 Total queries: ${testQueries.length}\n`);

const results = [];

async function testQuery(query) {
    try {
        const res = await fetch('http://localhost:5000/api/admin/test/intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query })
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`Error testing "${query}":`, error.message);
        return null;
    }
}

async function runTests() {
    for (let i = 0; i < testQueries.length; i++) {
        const query = testQueries[i];
        console.log(`[${i + 1}/${testQueries.length}] Testing: "${query}"`);

        const result = await testQuery(query);

        if (result) {
            const category = result.isFallback ? 'FALLBACK' :
                result.selectedIntent ? 'MATCH' : 'ERROR';

            results.push({
                query,
                category,
                intent: result.selectedIntent?.id || 'none',
                score: result.selectedIntent?.score || 0,
                isFallback: result.isFallback
            });

            console.log(`  → ${category}: ${result.selectedIntent?.id || 'fallback'} (score: ${result.selectedIntent?.score || 0})\n`);
        }

        // Small delay to avoid overwhelming server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary table
    console.log('\n' + '='.repeat(100));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('='.repeat(100) + '\n');

    console.log('| # | Query | Category | Intent | Score |');
    console.log('|---|-------|----------|--------|-------|');

    results.forEach((r, i) => {
        const queryShort = r.query.substring(0, 40).padEnd(40);
        const category = r.category.padEnd(8);
        const intent = r.intent.padEnd(20);
        console.log(`| ${(i + 1).toString().padStart(2)} | ${queryShort} | ${category} | ${intent} | ${r.score.toString().padStart(5)} |`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('📊 STATISTICS');
    console.log('='.repeat(100) + '\n');

    const matches = results.filter(r => r.category === 'MATCH').length;
    const fallbacks = results.filter(r => r.category === 'FALLBACK').length;
    const matchRate = ((matches / results.length) * 100).toFixed(1);
    const fallbackRate = ((fallbacks / results.length) * 100).toFixed(1);

    console.log(`✅ Correct Matches: ${matches} (${matchRate}%)`);
    console.log(`⚠️  Fallbacks: ${fallbacks} (${fallbackRate}%)`);
    console.log(`📈 Match Rate Target: >70%`);
    console.log(`📉 Fallback Rate Target: <30%\n`);

    // Recommendations
    console.log('='.repeat(100));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(100) + '\n');

    const fallbackQueries = results.filter(r => r.isFallback);

    if (fallbackQueries.length > 0) {
        console.log('🔴 Queries that triggered fallback:\n');
        fallbackQueries.forEach(r => {
            console.log(`  - "${r.query}"`);
        });

        console.log('\n📝 Suggested Actions:\n');

        // Analyze fallback patterns
        const logoQueries = fallbackQueries.filter(r => r.query.includes('logo'));
        const socialQueries = fallbackQueries.filter(r => r.query.includes('sosyal') || r.query.includes('instagram'));
        const ecommerceQueries = fallbackQueries.filter(r => r.query.includes('e-ticaret'));
        const mobileQueries = fallbackQueries.filter(r => r.query.includes('mobil uygulama'));
        const adsQueries = fallbackQueries.filter(r => r.query.includes('reklam') || r.query.includes('google'));

        if (logoQueries.length > 0) {
            console.log('  1. ADD KEYWORDS to existing intent or CREATE "additional_services" intent:');
            console.log('     - Keywords: logo, logo tasarımı, grafik tasarım');
        }

        if (socialQueries.length > 0) {
            console.log('  2. ADD KEYWORDS for social media queries:');
            console.log('     - Keywords: sosyal medya, instagram, facebook, social media management');
        }

        if (ecommerceQueries.length > 0) {
            console.log('  3. CONSIDER NEW INTENT for e-commerce:');
            console.log('     - Intent: ecommerce_inquiry');
            console.log('     - Keywords: e-ticaret, online satış, ürün satışı');
        }

        if (mobileQueries.length > 0) {
            console.log('  4. ADD CLARIFICATION for mobile app:');
            console.log('     - Response: "Mobil uygulama geliştirme hakkında detaylı bilgi için..."');
        }

        if (adsQueries.length > 0) {
            console.log('  5. ADD KEYWORDS for advertising queries:');
            console.log('     - Keywords: google ads, reklam, dijital pazarlama');
        }
    } else {
        console.log('✅ All queries matched successfully! No fallbacks triggered.');
    }

    console.log('\n' + '='.repeat(100));
    console.log('✅ Testing Complete!');
    console.log('='.repeat(100));
}

runTests().catch(console.error);
