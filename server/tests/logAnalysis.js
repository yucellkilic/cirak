/**
 * Log Analysis Script for Post-Launch Optimization
 * 
 * Analyzes user interaction logs to identify:
 * - Frequent fallbacks
 * - Weak intents
 * - Common query patterns
 * - Optimization opportunities
 */

import db from '../database.js';

console.log('📊 ÇIRAK Post-Launch Log Analysis\n');
console.log('='.repeat(80));

// Fetch all logs
const logs = db.prepare(`
    SELECT * FROM logs 
    ORDER BY timestamp DESC 
    LIMIT 1000
`).all();

console.log(`\n📋 Total logs analyzed: ${logs.length}\n`);

if (logs.length === 0) {
    console.log('⚠️  No logs found. System may be new or logs not yet generated.');
    console.log('\n💡 To generate sample logs for analysis, run test queries via:');
    console.log('   - Widget');
    console.log('   - Test Console');
    console.log('   - API endpoint: POST /api/cirak/message\n');
    process.exit(0);
}

// Analysis metrics
const totalMessages = logs.length;
const fallbackLogs = logs.filter(log => log.is_fallback === 1);
const matchedLogs = logs.filter(log => log.is_fallback === 0);

const fallbackRate = ((fallbackLogs.length / totalMessages) * 100).toFixed(1);
const matchRate = ((matchedLogs.length / totalMessages) * 100).toFixed(1);

console.log('='.repeat(80));
console.log('📈 OVERALL STATISTICS');
console.log('='.repeat(80));
console.log(`\nTotal Messages: ${totalMessages}`);
console.log(`Matched: ${matchedLogs.length} (${matchRate}%)`);
console.log(`Fallbacks: ${fallbackLogs.length} (${fallbackRate}%)`);
console.log(`\nTarget Match Rate: >85%`);
console.log(`Target Fallback Rate: <15%`);

if (parseFloat(matchRate) >= 85) {
    console.log(`✅ Match rate is EXCELLENT!`);
} else if (parseFloat(matchRate) >= 70) {
    console.log(`⚠️  Match rate is GOOD but can be improved`);
} else {
    console.log(`❌ Match rate is LOW - needs optimization`);
}

// Intent distribution
console.log('\n' + '='.repeat(80));
console.log('🎯 INTENT DISTRIBUTION');
console.log('='.repeat(80) + '\n');

const intentCounts = {};
matchedLogs.forEach(log => {
    const intent = log.matched_intent_id || 'unknown';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
});

const sortedIntents = Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1]);

console.log('| Intent ID | Count | Percentage |');
console.log('|-----------|-------|------------|');
sortedIntents.forEach(([intent, count]) => {
    const percentage = ((count / matchedLogs.length) * 100).toFixed(1);
    console.log(`| ${intent.padEnd(30)} | ${count.toString().padStart(5)} | ${percentage.padStart(9)}% |`);
});

// Weak intents (low score matches)
console.log('\n' + '='.repeat(80));
console.log('⚠️  WEAK MATCHES (Score < 15)');
console.log('='.repeat(80) + '\n');

const weakMatches = matchedLogs.filter(log => log.score < 15 && log.score > 0);

if (weakMatches.length > 0) {
    console.log(`Found ${weakMatches.length} weak matches:\n`);
    console.log('| User Message | Intent | Score |');
    console.log('|--------------|--------|-------|');

    weakMatches.slice(0, 10).forEach(log => {
        const msg = log.user_message.substring(0, 40).padEnd(40);
        const intent = (log.matched_intent_id || 'none').padEnd(25);
        console.log(`| ${msg} | ${intent} | ${log.score.toString().padStart(5)} |`);
    });

    if (weakMatches.length > 10) {
        console.log(`\n... and ${weakMatches.length - 10} more`);
    }
} else {
    console.log('✅ No weak matches found!');
}

// Fallback analysis
console.log('\n' + '='.repeat(80));
console.log('🔴 FALLBACK ANALYSIS');
console.log('='.repeat(80) + '\n');

if (fallbackLogs.length > 0) {
    console.log(`Analyzing ${fallbackLogs.length} fallback queries:\n`);

    // Group similar fallback queries
    const fallbackMessages = fallbackLogs.map(log => log.user_message.toLowerCase());
    const uniqueFallbacks = [...new Set(fallbackMessages)];

    console.log('| Fallback Query | Frequency |');
    console.log('|----------------|-----------|');

    const fallbackFrequency = {};
    fallbackMessages.forEach(msg => {
        fallbackFrequency[msg] = (fallbackFrequency[msg] || 0) + 1;
    });

    const sortedFallbacks = Object.entries(fallbackFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    sortedFallbacks.forEach(([msg, count]) => {
        const msgShort = msg.substring(0, 50).padEnd(50);
        console.log(`| ${msgShort} | ${count.toString().padStart(9)} |`);
    });
} else {
    console.log('✅ No fallbacks! Perfect match rate!');
}

// Recommendations
console.log('\n' + '='.repeat(80));
console.log('💡 OPTIMIZATION RECOMMENDATIONS');
console.log('='.repeat(80) + '\n');

const recommendations = [];

// Recommendation 1: High fallback rate
if (parseFloat(fallbackRate) > 15) {
    recommendations.push({
        priority: 'HIGH',
        category: 'Fallback Rate',
        issue: `Fallback rate is ${fallbackRate}% (target: <15%)`,
        action: 'Analyze top fallback queries and add keywords to existing intents or create new intents'
    });
}

// Recommendation 2: Weak matches
if (weakMatches.length > totalMessages * 0.1) {
    recommendations.push({
        priority: 'MEDIUM',
        category: 'Weak Matches',
        issue: `${weakMatches.length} queries matched with low scores (<15)`,
        action: 'Review weak matches and add stronger keywords or synonyms'
    });
}

// Recommendation 3: Intent imbalance
const maxIntentUsage = Math.max(...Object.values(intentCounts));
const minIntentUsage = Math.min(...Object.values(intentCounts));
if (maxIntentUsage > minIntentUsage * 10) {
    recommendations.push({
        priority: 'LOW',
        category: 'Intent Balance',
        issue: 'Some intents are used much more than others',
        action: 'Review underused intents - may need better keywords or may not be relevant'
    });
}

// Recommendation 4: Specific keyword suggestions from fallbacks
if (fallbackLogs.length > 0) {
    const fallbackKeywords = new Set();
    fallbackLogs.forEach(log => {
        const words = log.user_message.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3 && !['için', 'nedir', 'nasıl', 'kadar'].includes(word)) {
                fallbackKeywords.add(word);
            }
        });
    });

    if (fallbackKeywords.size > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Missing Keywords',
            issue: `Common words in fallback queries: ${[...fallbackKeywords].slice(0, 10).join(', ')}`,
            action: 'Add these keywords to relevant intents'
        });
    }
}

if (recommendations.length === 0) {
    console.log('✅ System is performing optimally! No critical recommendations.\n');
    console.log('💡 Continue monitoring logs and iterate on keywords as needed.');
} else {
    console.log(`Found ${recommendations.length} optimization opportunities:\n`);

    recommendations.forEach((rec, idx) => {
        console.log(`${idx + 1}. [${rec.priority}] ${rec.category}`);
        console.log(`   Issue: ${rec.issue}`);
        console.log(`   Action: ${rec.action}\n`);
    });
}

// Score distribution
console.log('='.repeat(80));
console.log('📊 SCORE DISTRIBUTION');
console.log('='.repeat(80) + '\n');

const scoreRanges = {
    '0-5': 0,
    '6-10': 0,
    '11-15': 0,
    '16-20': 0,
    '21-30': 0,
    '31+': 0
};

matchedLogs.forEach(log => {
    const score = log.score;
    if (score <= 5) scoreRanges['0-5']++;
    else if (score <= 10) scoreRanges['6-10']++;
    else if (score <= 15) scoreRanges['11-15']++;
    else if (score <= 20) scoreRanges['16-20']++;
    else if (score <= 30) scoreRanges['21-30']++;
    else scoreRanges['31+']++;
});

console.log('| Score Range | Count | Percentage |');
console.log('|-------------|-------|------------|');
Object.entries(scoreRanges).forEach(([range, count]) => {
    const percentage = matchedLogs.length > 0
        ? ((count / matchedLogs.length) * 100).toFixed(1)
        : '0.0';
    console.log(`| ${range.padEnd(11)} | ${count.toString().padStart(5)} | ${percentage.padStart(9)}% |`);
});

console.log('\n💡 Ideal distribution: Most scores should be >15');

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ ANALYSIS COMPLETE');
console.log('='.repeat(80) + '\n');

console.log('📝 Next Steps:');
console.log('1. Review fallback queries above');
console.log('2. Add missing keywords to intents');
console.log('3. Improve weak-scoring intents');
console.log('4. Rebuild snapshot after changes');
console.log('5. Re-run this analysis after 1 week\n');

console.log('🔄 To re-run analysis:');
console.log('   node server/tests/logAnalysis.js\n');
