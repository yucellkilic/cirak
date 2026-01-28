/**
 * Determinism Test for ÇIRAK Intent Engine
 * 
 * Tests that same input produces same output 100 times
 */

const testMessage = "fiyat ne kadar";
const iterations = 100;
const results = [];

console.log(`🧪 Running determinism test: ${iterations} iterations`);
console.log(`📝 Test message: "${testMessage}"\n`);

async function runTest() {
    for (let i = 0; i < iterations; i++) {
        const response = await fetch('http://localhost:5000/api/cirak/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: testMessage })
        });

        const data = await response.json();
        results.push({
            iteration: i + 1,
            intentId: data.intentId,
            score: data.score,
            isFallback: data.isFallback
        });

        // Progress indicator
        if ((i + 1) % 10 === 0) {
            process.stdout.write(`✓ ${i + 1}/${iterations}\r`);
        }
    }

    console.log(`\n✅ Completed ${iterations} iterations\n`);

    // Analyze results
    const firstResult = results[0];
    let allIdentical = true;
    let differences = [];

    for (let i = 1; i < results.length; i++) {
        const current = results[i];
        if (
            current.intentId !== firstResult.intentId ||
            current.score !== firstResult.score ||
            current.isFallback !== firstResult.isFallback
        ) {
            allIdentical = false;
            differences.push({
                iteration: current.iteration,
                expected: firstResult,
                actual: current
            });
        }
    }

    // Report
    console.log('📊 DETERMINISM TEST RESULTS');
    console.log('═'.repeat(50));
    console.log(`Total iterations: ${iterations}`);
    console.log(`Expected result:`);
    console.log(`  - Intent ID: ${firstResult.intentId}`);
    console.log(`  - Score: ${firstResult.score}`);
    console.log(`  - Is Fallback: ${firstResult.isFallback}`);
    console.log('');

    if (allIdentical) {
        console.log('✅ PASS: All results are identical');
        console.log('✅ Engine is 100% deterministic');
    } else {
        console.log(`❌ FAIL: Found ${differences.length} different results`);
        console.log('\nDifferences:');
        differences.slice(0, 5).forEach(diff => {
            console.log(`  Iteration ${diff.iteration}:`);
            console.log(`    Expected: ${JSON.stringify(diff.expected)}`);
            console.log(`    Actual: ${JSON.stringify(diff.actual)}`);
        });
    }

    console.log('═'.repeat(50));
    process.exit(allIdentical ? 0 : 1);
}

runTest().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
