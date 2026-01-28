import React, { useState, useEffect } from 'react';
import { GitCompare, Plus, Minus, Edit, RefreshCw, AlertCircle } from 'lucide-react';

const SnapshotDiff = () => {
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiff();
    }, []);

    const fetchDiff = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/tools/snapshot/diff');
            const data = await res.json();
            setDiff(data);
        } catch (error) {
            console.error('Failed to fetch diff:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw size={32} className="spin" style={{ color: '#2563eb' }} />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading snapshot diff...</p>
            </div>
        );
    }

    if (diff?.error) {
        return (
            <div className="admin-snapshot-diff">
                <h1>Snapshot Changes</h1>
                <div className="admin-card" style={{
                    background: '#fef3c7',
                    border: '2px solid #f59e0b',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <AlertCircle size={48} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: '#92400e' }}>{diff.error}</h3>
                    <p style={{ color: '#78350f', marginTop: '0.5rem' }}>
                        Make changes to intents and rebuild snapshot to see diff.
                    </p>
                </div>
            </div>
        );
    }

    const totalChanges = (diff?.changes.intentsAdded.length || 0) +
        (diff?.changes.intentsRemoved.length || 0) +
        (diff?.changes.intentsModified.length || 0);

    return (
        <div className="admin-snapshot-diff">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GitCompare size={28} /> Snapshot Changes
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Compare current snapshot with previous version
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={fetchDiff}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Snapshot Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ background: '#f0fdf4', border: '2px solid #10b981' }}>
                    <h4 style={{ color: '#166534', marginBottom: '1rem' }}>Current Snapshot</h4>
                    <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                        <div><strong>Version:</strong> {diff?.current.version}</div>
                        <div><strong>Generated:</strong> {new Date(diff?.current.generatedAt).toLocaleString()}</div>
                        <div><strong>Intents:</strong> {diff?.current.intentCount}</div>
                    </div>
                </div>
                <div className="admin-card" style={{ background: '#f8fafc', border: '2px solid #64748b' }}>
                    <h4 style={{ color: '#475569', marginBottom: '1rem' }}>Previous Snapshot</h4>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                        <div><strong>Version:</strong> {diff?.previous.version}</div>
                        <div><strong>Generated:</strong> {new Date(diff?.previous.generatedAt).toLocaleString()}</div>
                        <div><strong>Intents:</strong> {diff?.previous.intentCount}</div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="admin-card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', color: totalChanges > 0 ? '#f59e0b' : '#10b981' }}>
                    {totalChanges}
                </h3>
                <div style={{ color: '#64748b' }}>Total Changes</div>
            </div>

            {/* Added Intents */}
            {diff?.changes.intentsAdded.length > 0 && (
                <div className="admin-card" style={{ borderLeft: '4px solid #10b981', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1rem' }}>
                        <Plus size={20} /> Added Intents ({diff.changes.intentsAdded.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {diff.changes.intentsAdded.map((intent, idx) => (
                            <div key={idx} style={{
                                background: '#f0fdf4',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #bbf7d0'
                            }}>
                                <div style={{ fontWeight: '600', color: '#166534' }}>{intent.name}</div>
                                <div style={{ fontSize: '0.875rem', color: '#15803d', marginTop: '0.25rem' }}>
                                    ID: {intent.id} • {intent.keywordCount} keywords
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Removed Intents */}
            {diff?.changes.intentsRemoved.length > 0 && (
                <div className="admin-card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem' }}>
                        <Minus size={20} /> Removed Intents ({diff.changes.intentsRemoved.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {diff.changes.intentsRemoved.map((intent, idx) => (
                            <div key={idx} style={{
                                background: '#fee2e2',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #fecaca'
                            }}>
                                <div style={{ fontWeight: '600', color: '#991b1b' }}>{intent.name}</div>
                                <div style={{ fontSize: '0.875rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                                    ID: {intent.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modified Intents */}
            {diff?.changes.intentsModified.length > 0 && (
                <div className="admin-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '1rem' }}>
                        <Edit size={20} /> Modified Intents ({diff.changes.intentsModified.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {diff.changes.intentsModified.map((intent, idx) => (
                            <div key={idx} style={{
                                background: '#fef3c7',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #fde68a'
                            }}>
                                <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.75rem' }}>
                                    {intent.name}
                                </div>
                                <div style={{ fontSize: '0.875rem' }}>
                                    {intent.changes.responseChanged && (
                                        <div style={{ color: '#78350f', marginBottom: '0.5rem' }}>
                                            ✏️ Response text changed
                                        </div>
                                    )}
                                    {intent.changes.keywordsAdded && (
                                        <div style={{ color: '#15803d', marginBottom: '0.5rem' }}>
                                            + Keywords: {intent.changes.keywordsAdded.join(', ')}
                                        </div>
                                    )}
                                    {intent.changes.keywordsRemoved && (
                                        <div style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>
                                            - Keywords: {intent.changes.keywordsRemoved.join(', ')}
                                        </div>
                                    )}
                                    {intent.changes.priorityChanged && (
                                        <div style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
                                            🔄 Priority: {intent.changes.priorityChanged.from} → {intent.changes.priorityChanged.to}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Changes */}
            {totalChanges === 0 && (
                <div className="admin-card" style={{
                    background: '#f0fdf4',
                    border: '2px solid #10b981',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ color: '#166534' }}>No Changes</h3>
                    <p style={{ color: '#15803d', marginTop: '0.5rem' }}>
                        Current and previous snapshots are identical.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SnapshotDiff;
