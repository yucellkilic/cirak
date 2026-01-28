import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

const QualityControl = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/tools/intent-analysis');
            const data = await res.json();
            setAnalysis(data);
        } catch (error) {
            console.error('Failed to fetch analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw size={32} className="spin" style={{ color: '#2563eb' }} />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Analyzing intents...</p>
            </div>
        );
    }

    if (!analysis) {
        return <div>Failed to load analysis</div>;
    }

    const filteredConflicts = filter === 'ALL'
        ? analysis.conflicts
        : analysis.conflicts.filter(c => c.severity === filter);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getSeverityBg = (severity) => {
        switch (severity) {
            case 'HIGH': return '#fee2e2';
            case 'MEDIUM': return '#fef3c7';
            case 'LOW': return '#dbeafe';
            default: return '#f1f5f9';
        }
    };

    return (
        <div className="admin-quality">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Intent Quality Control</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Detect keyword conflicts, overlaps, and quality issues
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={fetchAnalysis}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCw size={18} /> Re-analyze
                </button>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
                        {analysis.stats.totalIntents}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Total Intents</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                        {analysis.stats.totalKeywords}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Total Keywords</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: analysis.stats.totalConflicts > 0 ? '#f59e0b' : '#10b981' }}>
                        {analysis.stats.totalConflicts}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Total Conflicts</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                        {analysis.stats.conflictsBySeverity.HIGH}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '0.5rem' }}>High Severity</div>
                </div>
            </div>

            {/* Severity Filter */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    className={`admin-btn ${filter === 'ALL' ? 'admin-btn-primary' : ''}`}
                    onClick={() => setFilter('ALL')}
                >
                    All ({analysis.conflicts.length})
                </button>
                <button
                    className={`admin-btn ${filter === 'HIGH' ? 'admin-btn-primary' : ''}`}
                    onClick={() => setFilter('HIGH')}
                    style={{
                        background: filter === 'HIGH' ? '#ef4444' : 'transparent',
                        color: filter === 'HIGH' ? 'white' : '#ef4444',
                        border: `2px solid #ef4444`
                    }}
                >
                    High ({analysis.stats.conflictsBySeverity.HIGH})
                </button>
                <button
                    className={`admin-btn ${filter === 'MEDIUM' ? 'admin-btn-primary' : ''}`}
                    onClick={() => setFilter('MEDIUM')}
                    style={{
                        background: filter === 'MEDIUM' ? '#f59e0b' : 'transparent',
                        color: filter === 'MEDIUM' ? 'white' : '#f59e0b',
                        border: `2px solid #f59e0b`
                    }}
                >
                    Medium ({analysis.stats.conflictsBySeverity.MEDIUM})
                </button>
                <button
                    className={`admin-btn ${filter === 'LOW' ? 'admin-btn-primary' : ''}`}
                    onClick={() => setFilter('LOW')}
                    style={{
                        background: filter === 'LOW' ? '#3b82f6' : 'transparent',
                        color: filter === 'LOW' ? 'white' : '#3b82f6',
                        border: `2px solid #3b82f6`
                    }}
                >
                    Low ({analysis.stats.conflictsBySeverity.LOW})
                </button>
            </div>

            {/* Conflicts List */}
            {filteredConflicts.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto' }} />
                    <h3 style={{ marginTop: '1rem', color: '#10b981' }}>No Conflicts Found!</h3>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        {filter === 'ALL'
                            ? 'All intents are properly configured with no keyword conflicts.'
                            : `No ${filter.toLowerCase()} severity conflicts found.`}
                    </p>
                </div>
            ) : (
                <div className="admin-card">
                    <h3 style={{ marginBottom: '1rem' }}>
                        Detected Conflicts ({filteredConflicts.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredConflicts.map((conflict, idx) => (
                            <div
                                key={idx}
                                style={{
                                    border: `2px solid ${getSeverityColor(conflict.severity)}`,
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    background: getSeverityBg(conflict.severity)
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertTriangle size={20} style={{ color: getSeverityColor(conflict.severity) }} />
                                        <strong style={{ fontSize: '1.1rem' }}>
                                            {conflict.type.replace(/_/g, ' ')}
                                        </strong>
                                    </div>
                                    <span style={{
                                        background: getSeverityColor(conflict.severity),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600'
                                    }}>
                                        {conflict.severity}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <strong>Keyword:</strong> <code style={{ background: 'white', padding: '2px 6px', borderRadius: '4px' }}>{conflict.keyword}</code>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <strong>Affected Intents:</strong>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {conflict.intents.map((intent, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    background: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                <strong>{intent.title || intent.id}</strong>
                                                {intent.priority && (
                                                    <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                                                        (Priority: {intent.priority})
                                                    </span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    background: 'white',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                                        <Info size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <strong style={{ color: '#2563eb' }}>Recommendation:</strong>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#475569' }}>
                                                {conflict.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analysis Metadata */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                <strong>Last analyzed:</strong> {new Date(analysis.timestamp).toLocaleString()}
                {analysis.stats.affectedIntents.length > 0 && (
                    <>
                        {' | '}
                        <strong>Affected intents:</strong> {analysis.stats.affectedIntents.join(', ')}
                    </>
                )}
            </div>
        </div>
    );
};

export default QualityControl;
