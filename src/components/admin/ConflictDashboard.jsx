
import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, RefreshCw } from 'lucide-react';

const ConflictDashboard = () => {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchConflicts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/conflicts');
            const data = await res.json();
            setConflicts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConflicts();
    }, []);

    const countCritical = conflicts.filter(c => c.severity === 'critical').length;
    const countWarning = conflicts.filter(c => c.severity === 'warning').length;

    return (
        <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} /> Conflict Dashboard
                </h3>
                <button
                    onClick={fetchConflicts}
                    disabled={loading}
                    className="admin-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
                </button>
            </div>

            {/* Summary Counters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', background: '#fee2e2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertOctagon size={24} color="#991b1b" />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>{countCritical}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7f1d1d', fontWeight: 'bold' }}>CRITICAL ERRORS</div>
                    </div>
                </div>
                <div style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', background: '#fef3c7', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertTriangle size={24} color="#92400e" />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>{countWarning}</div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: 'bold' }}>WARNINGS</div>
                    </div>
                </div>
            </div>

            {/* Conflict List */}
            {conflicts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#10b981', background: '#f0fdf4', borderRadius: '0.5rem' }}>
                    Run 100% Clean. No conflicts detected.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {conflicts.map((conflict, idx) => (
                        <div key={idx} style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            borderLeft: `4px solid ${conflict.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderLeftWidth: '4px' // Ensure check
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    color: conflict.severity === 'critical' ? '#ef4444' : '#d97706',
                                    background: conflict.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {conflict.type.replace('_', ' ')}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                                {conflict.message}
                            </div>
                            {conflict.type === 'KEY_DUPLICATION' && (
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                    Key: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{conflict.key}</code>
                                </div>
                            )}
                            {conflict.type === 'AMBIGUOUS_INPUT' && (
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div>Input: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{conflict.input}</code></div>
                                    <div>Trigger: <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{conflict.triggerKey}</code> ({conflict.winningIntent})</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConflictDashboard;
