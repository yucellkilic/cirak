import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, BarChart3, RefreshCw, Calendar } from 'lucide-react';

const Analytics = () => {
    const [fallbackData, setFallbackData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(7);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [fallbackRes, performanceRes] = await Promise.all([
                fetch(`http://localhost:5000/api/admin/analytics/fallbacks?days=${period}`),
                fetch(`http://localhost:5000/api/admin/analytics/intent-performance?days=${period}`)
            ]);

            const fallbacks = await fallbackRes.json();
            const performance = await performanceRes.json();

            setFallbackData(fallbacks);
            setPerformanceData(performance);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw size={32} className="spin" style={{ color: '#2563eb' }} />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading analytics...</p>
            </div>
        );
    }

    const fallbackRateColor = fallbackData?.fallbackRate > 15 ? '#ef4444' :
        fallbackData?.fallbackRate > 10 ? '#f59e0b' : '#10b981';

    return (
        <div className="admin-analytics">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Analytics & Insights</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Fallback analytics and intent performance metrics
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        className="admin-input"
                        value={period}
                        onChange={e => setPeriod(parseInt(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                    </select>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={fetchAnalytics}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>
            </div>

            {/* Fallback Analytics */}
            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <TrendingDown size={20} /> Fallback Analytics
                </h3>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
                            {fallbackData?.totalMessages || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Total Messages
                        </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                            {fallbackData?.fallbackCount || 0}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Fallbacks
                        </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: fallbackRateColor }}>
                            {fallbackData?.fallbackRate || 0}%
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Fallback Rate
                        </div>
                    </div>
                </div>

                {/* Fallback Rate Status */}
                {fallbackData && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        background: fallbackData.fallbackRate > 15 ? '#fee2e2' :
                            fallbackData.fallbackRate > 10 ? '#fef3c7' : '#dcfce7',
                        border: `2px solid ${fallbackRateColor}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: fallbackRateColor, fontWeight: '600' }}>
                            {fallbackData.fallbackRate > 15 ? '❌' : fallbackData.fallbackRate > 10 ? '⚠️' : '✅'}
                            {fallbackData.fallbackRate > 15 ? 'High Fallback Rate - Action Required' :
                                fallbackData.fallbackRate > 10 ? 'Moderate Fallback Rate - Monitor Closely' :
                                    'Healthy Fallback Rate'}
                        </div>
                        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#475569' }}>
                            Target: &lt;15% | Current: {fallbackData.fallbackRate}%
                        </div>
                    </div>
                )}

                {/* Top Fallback Queries */}
                {fallbackData?.topFallbackQueries && fallbackData.topFallbackQueries.length > 0 && (
                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Top Fallback Queries</h4>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User Query</th>
                                    <th>Normalized</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fallbackData.topFallbackQueries.map((query, idx) => (
                                    <tr key={idx}>
                                        <td>{query.query}</td>
                                        <td>
                                            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }}>
                                                {query.normalized || '-'}
                                            </code>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: '#dbeafe',
                                                color: '#1e40af',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                fontSize: '0.875rem'
                                            }}>
                                                {query.count}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Zero Match Intents */}
                {fallbackData?.zeroMatchIntents && fallbackData.zeroMatchIntents.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                            Unused Intents ({fallbackData.zeroMatchIntents.length})
                        </h4>
                        <div style={{
                            background: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '0.5rem',
                            padding: '1rem'
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {fallbackData.zeroMatchIntents.map((intent, idx) => (
                                    <span key={idx} style={{
                                        background: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        border: '1px solid #fbbf24'
                                    }}>
                                        {intent.title}
                                    </span>
                                ))}
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#92400e' }}>
                                💡 These intents haven't matched any queries in the last {period} days. Consider adding more keywords or removing if not needed.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Intent Performance */}
            {performanceData && (
                <div className="admin-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <BarChart3 size={20} /> Intent Performance
                    </h3>

                    {/* Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                                {performanceData.summary.activeIntents}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                                {performanceData.summary.lowUsageIntents}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Low Usage</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                                {performanceData.summary.unusedIntents}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Unused</div>
                        </div>
                    </div>

                    {/* Performance Table */}
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Intent</th>
                                <th>Priority</th>
                                <th>Match Count</th>
                                <th>Avg Score</th>
                                <th>Last Matched</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performanceData.intents.map((intent, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <strong>{intent.title}</strong>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {intent.intentId}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            background: '#e0e7ff',
                                            color: '#3730a3',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontWeight: '600',
                                            fontSize: '0.875rem'
                                        }}>
                                            {intent.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                            {intent.matchCount}
                                        </span>
                                    </td>
                                    <td>{intent.avgScore.toFixed(1)}</td>
                                    <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {intent.lastMatchedAt
                                            ? new Date(intent.lastMatchedAt).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td>
                                        <span style={{
                                            background: intent.status === 'active' ? '#dcfce7' :
                                                intent.status === 'low' ? '#fef3c7' : '#fee2e2',
                                            color: intent.status === 'active' ? '#166534' :
                                                intent.status === 'low' ? '#92400e' : '#991b1b',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {intent.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Analytics;
