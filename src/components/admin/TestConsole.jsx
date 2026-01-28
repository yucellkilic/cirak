import React, { useState } from 'react';
import { Play, AlertCircle, TrendingUp, Award, Zap } from 'lucide-react';

const TestConsole = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/test/intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });

            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getMatchTypeBadge = (type) => {
        const styles = {
            exact: { bg: '#dcfce7', color: '#166534', label: 'Exact' },
            synonym: { bg: '#dbeafe', color: '#1e40af', label: 'Synonym' },
            typo: { bg: '#fef3c7', color: '#92400e', label: 'Typo' }
        };
        const style = styles[type] || styles.exact;
        return (
            <span style={{
                background: style.bg,
                color: style.color,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div className="admin-console">
            <h1>Live Test Console</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Test ÇIRAK intent matching with detailed scoring breakdown.
            </p>

            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className="admin-input"
                        style={{ fontSize: '1.1rem', padding: '1rem' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                        placeholder="Enter a test query..."
                    />
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleTest}
                        disabled={loading || !query}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                    >
                        {loading ? 'Testing...' : <><Play size={18} /> Run Test</>}
                    </button>
                </div>
            </div>

            {results && (
                <div className="test-results">
                    {/* Normalized Input */}
                    <div className="admin-card" style={{ background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Normalized Input:
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                            "{results.normalizedInput}"
                        </div>
                    </div>

                    {/* Fallback Warning */}
                    {results.isFallback && (
                        <div style={{
                            background: '#fef2f2',
                            border: '2px solid #ef4444',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#991b1b',
                            marginTop: '1rem'
                        }}>
                            <AlertCircle size={20} />
                            <span><strong>No intent matched.</strong> System will use fallback response.</span>
                        </div>
                    )}

                    {/* Selected Intent with Score Breakdown */}
                    {results.selectedIntent && results.selectedIntent.scoreBreakdown && (
                        <div className="admin-card" style={{
                            marginTop: '1rem',
                            borderLeft: '4px solid #10b981'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Award size={20} /> Matched Intent
                                    </h4>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong style={{ fontSize: '1.1rem' }}>{results.selectedIntent.name}</strong>
                                    </div>
                                    <small style={{ color: '#64748b' }}>ID: {results.selectedIntent.id}</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                                        {results.selectedIntent.score}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Final Score
                                    </div>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginTop: '1rem'
                            }}>
                                <h5 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={18} /> Score Breakdown
                                </h5>

                                {/* Matched Keywords */}
                                {results.selectedIntent.scoreBreakdown.matches.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong style={{ fontSize: '0.875rem', color: '#475569' }}>
                                            Matched Keywords:
                                        </strong>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {results.selectedIntent.scoreBreakdown.matches.map((match, idx) => (
                                                <div key={idx} style={{
                                                    background: 'white',
                                                    padding: '0.75rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid #e2e8f0',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                                                            {match.keyword}
                                                        </code>
                                                        {getMatchTypeBadge(match.matchType)}
                                                        {match.matchType !== 'exact' && (
                                                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                                matched: "{match.matchedTerm}"
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                            weight: {match.weight}
                                                        </span>
                                                        <span style={{ fontWeight: '600', color: '#10b981' }}>
                                                            +{match.scoreAdded}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Score Summary */}
                                <div style={{
                                    background: 'white',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ padding: '0.5rem 0', color: '#475569' }}>Base Score (exact matches)</td>
                                                <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                    {results.selectedIntent.scoreBreakdown.baseScore}
                                                </td>
                                            </tr>
                                            {results.selectedIntent.scoreBreakdown.synonymBonus !== 0 && (
                                                <tr>
                                                    <td style={{ padding: '0.5rem 0', color: '#475569' }}>Synonym Penalty (×0.8)</td>
                                                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#f59e0b' }}>
                                                        {results.selectedIntent.scoreBreakdown.synonymBonus.toFixed(1)}
                                                    </td>
                                                </tr>
                                            )}
                                            {results.selectedIntent.scoreBreakdown.typoBonus !== 0 && (
                                                <tr>
                                                    <td style={{ padding: '0.5rem 0', color: '#475569' }}>Typo Penalty (×0.6)</td>
                                                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>
                                                        {results.selectedIntent.scoreBreakdown.typoBonus.toFixed(1)}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                                                <td style={{ padding: '0.5rem 0', fontWeight: '600' }}>Final Score</td>
                                                <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '1.1rem', color: '#10b981' }}>
                                                    {results.selectedIntent.scoreBreakdown.finalScore}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Priority Info */}
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#e0e7ff',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#3730a3'
                                }}>
                                    <strong>Priority:</strong> {results.selectedIntent.priority}
                                    <span style={{ marginLeft: '0.5rem', color: '#6366f1' }}>
                                        (Higher priority intents win ties)
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Competing Intents */}
                    {results.allIntentsWithBreakdown && results.allIntentsWithBreakdown.length > 0 && (
                        <div className="admin-card" style={{ marginTop: '1rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={18} /> All Competing Intents
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {results.allIntentsWithBreakdown.map((intent, idx) => (
                                    <div key={idx} style={{
                                        background: intent.id === results.selectedIntent?.id ? '#f0fdf4' : '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        border: intent.id === results.selectedIntent?.id ? '2px solid #10b981' : '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{intent.name}</strong>
                                                {intent.id === results.selectedIntent?.id && (
                                                    <span style={{
                                                        marginLeft: '0.5rem',
                                                        background: '#10b981',
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        WINNER
                                                    </span>
                                                )}
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                    {intent.breakdown.matches.length} keyword(s) matched • Priority: {intent.priority}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: intent.id === results.selectedIntent?.id ? '#10b981' : '#64748b' }}>
                                                {intent.score}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Response Preview */}
                    <div className="admin-card" style={{ marginTop: '1rem' }}>
                        <h4>Response Preview</h4>
                        <div style={{
                            background: '#f8fafc',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Message:</strong>
                                <p style={{ margin: '0.5rem 0', color: '#475569' }}>{results.response.message}</p>
                            </div>
                            {results.response.supportingMessage && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Supporting:</strong>
                                    <p style={{ margin: '0.5rem 0', color: '#64748b' }}>{results.response.supportingMessage}</p>
                                </div>
                            )}
                            {results.response.ctaMessage && (
                                <div>
                                    <strong>CTA:</strong>
                                    <p style={{ margin: '0.5rem 0', color: '#2563eb' }}>{results.response.ctaMessage}</p>
                                </div>
                            )}
                            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                <strong>Tone:</strong> {results.response.tone}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestConsole;
