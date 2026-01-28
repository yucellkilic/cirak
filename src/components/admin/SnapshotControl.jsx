import React, { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw, Database, CheckCircle, XCircle } from 'lucide-react';

const SnapshotControl = () => {
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rebuilding, setRebuilding] = useState(false);
    const [rollingBack, setRollingBack] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/snapshot/status');
            const data = await res.json();
            setSnapshot(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRebuild = async () => {
        setRebuilding(true);
        setMessage(null);
        try {
            const res = await fetch('http://localhost:5000/api/admin/snapshot/rebuild', {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Snapshot rebuilt successfully!' });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: data.error || 'Rebuild failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setRebuilding(false);
        }
    };

    const handleRollback = async () => {
        if (!confirm('Rollback to previous snapshot? This will revert all recent changes.')) return;

        setRollingBack(true);
        setMessage(null);
        try {
            const res = await fetch('http://localhost:5000/api/admin/snapshot/rollback', {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Rolled back to previous snapshot!' });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: data.error || 'Rollback failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' });
        } finally {
            setRollingBack(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-snapshot">
            <h1>Snapshot Control</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Manage the in-memory snapshot used by the intent matching engine.
            </p>

            {message && (
                <div style={{
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="admin-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Database size={32} style={{ color: '#2563eb' }} />
                    <div>
                        <h3 style={{ margin: 0 }}>Current Snapshot Status</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                            In-memory snapshot metadata
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Version
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {snapshot?.version || 'N/A'}
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Generated At
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                            {snapshot?.generatedAt ? new Date(snapshot.generatedAt).toLocaleString() : 'N/A'}
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Intent Count
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                            {snapshot?.intentCount || 0}
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Fallback Count
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                            {snapshot?.fallbackCount || 0}
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Rollback Available
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: snapshot?.hasPrevious ? '#10b981' : '#ef4444' }}>
                            {snapshot?.hasPrevious ? 'Yes' : 'No'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <h3>Actions</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    <strong>Rebuild:</strong> Generate new snapshot from current database state.<br />
                    <strong>Rollback:</strong> Revert to previous snapshot (if available).
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleRebuild}
                        disabled={rebuilding}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RefreshCw size={18} className={rebuilding ? 'spinning' : ''} />
                        {rebuilding ? 'Rebuilding...' : 'Rebuild Snapshot'}
                    </button>

                    <button
                        className="admin-btn"
                        onClick={handleRollback}
                        disabled={rollingBack || !snapshot?.hasPrevious}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RotateCcw size={18} />
                        {rollingBack ? 'Rolling Back...' : 'Rollback to Previous'}
                    </button>
                </div>

                {!snapshot?.hasPrevious && (
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                        ℹ️ No previous snapshot available for rollback. Rebuild at least twice to enable rollback.
                    </p>
                )}
            </div>
        </div>
    );
};

export default SnapshotControl;
