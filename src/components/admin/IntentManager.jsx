
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, ChevronRight, AlertCircle, Save } from 'lucide-react';
// import { normalizeInput } from '../../../server/services/intentDetector'; // REMOVED: Backend import not allowed in frontend
import ConflictDashboard from './ConflictDashboard';

// ... (rest of imports and component logic)
// We can't import backend files in frontend directly usually, but let's replicate logic or rely on API. 
// Actually, duplicating short logic is safer here to show instant preview.

const normalizePreview = (input) => {
    if (!input) return '';
    return input.toLowerCase().trim()
        .replace(/[.,?!:;()\-]/g, '')
        .replace(/ç/g, 'c').replace(/ğ/g, 'g')
        .replace(/ı/g, 'i').replace(/ö/g, 'o')
        .replace(/ş/g, 's').replace(/ü/g, 'u');
};

const IntentManager = () => {
    // Views: 'list', 'detail'
    const [view, setView] = useState('list');
    const [intents, setIntents] = useState([]);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Detail Form State
    const [detailForm, setDetailForm] = useState({});

    // Key Add State
    const [newKeyDisplay, setNewKeyDisplay] = useState('');

    useEffect(() => {
        fetchIntents();
    }, []);

    const fetchIntents = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/admin/intents');
            const data = await res.json();
            setIntents(data);
        } catch (err) {
            setError('Failed to load intents');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectIntent = (intent) => {
        setSelectedIntent(intent);
        setDetailForm({
            label: intent.label,
            description: intent.description,
            priority: intent.priority,
            enabled: intent.enabled
        });
        setView('detail');
        setNewKeyDisplay('');
        setError('');
        setSuccess('');
    };

    const handleSaveMetadata = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/intents/${selectedIntent.intent}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailForm)
            });

            if (res.ok) {
                setSuccess('Metadata updated successfully');
                fetchIntents();
                // Update local selected intent to reflect changes
                setSelectedIntent({ ...selectedIntent, ...detailForm });
            } else {
                setError('Failed to update metadata');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleAddKey = async (e) => {
        e.preventDefault();
        if (!newKeyDisplay) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/intents/${selectedIntent.intent}/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display: newKeyDisplay })
            });

            if (res.ok) {
                const addedKey = await res.json();
                // Update local state
                const updatedKeys = [...(selectedIntent.keys || []), addedKey];
                setSelectedIntent({ ...selectedIntent, keys: updatedKeys });
                setNewKeyDisplay('');
                setSuccess('Key added successfully');
            } else {
                const errData = await res.json();
                setError(errData.error || 'Failed to add key');
            }
        } catch (err) {
            setError('Network error adding key');
        }
    };

    const handleDeleteKey = async (normalizedKey) => {
        if (!window.confirm('Are you sure you want to delete this key?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/intents/${selectedIntent.intent}/keys/${normalizedKey}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const updatedKeys = selectedIntent.keys.filter(k => k.normalized !== normalizedKey);
                setSelectedIntent({ ...selectedIntent, keys: updatedKeys });
                setSuccess('Key removed');
            } else {
                setError('Failed to remove key');
            }
        } catch (err) {
            setError('Network error deleting key');
        }
    };

    if (loading && view === 'list') return <div className="p-8 text-center">Loading intents...</div>;

    return (
        <div className="admin-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Deterministic Intent Manager</h1>
                    <p style={{ color: '#64748b' }}>Manage strict keyword matching rules.</p>
                </div>
                {view === 'detail' && (
                    <button
                        onClick={() => setView('list')}
                        className="admin-btn"
                        style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    >
                        ← Back to List
                    </button>
                )}
            </div>

            {/* Notifications */}
            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #ef4444' }}>{error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #22c55e' }}>{success}</div>}

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="admin-card" style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Label</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Intent Key</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Priority</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#475569', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {intents.map(intent => (
                                <tr key={intent.intent} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500', color: '#0f172a' }}>{intent.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{intent.description}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.85rem' }}>{intent.intent}</code>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{intent.priority}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {intent.enabled ? (
                                            <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>Active</span>
                                        ) : (
                                            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>Disabled</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleSelectIntent(intent)}
                                            style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer', color: '#475569' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DETAIL VIEW */}
            {view === 'detail' && selectedIntent && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                    {/* Left Column: Metadata */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>Intent Settings</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#475569' }}>Label</label>
                            <input
                                className="admin-input"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                                value={detailForm.label || ''}
                                onChange={e => setDetailForm({ ...detailForm, label: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#475569' }}>Description</label>
                            <textarea
                                className="admin-input"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                                rows="3"
                                value={detailForm.description || ''}
                                onChange={e => setDetailForm({ ...detailForm, description: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#475569' }}>Priority</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                                    value={detailForm.priority || 0}
                                    onChange={e => setDetailForm({ ...detailForm, priority: e.target.value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                                <select
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                                    value={detailForm.enabled}
                                    onChange={e => setDetailForm({ ...detailForm, enabled: e.target.value === 'true' })}
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveMetadata}
                            style={{ width: '100%', background: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Save size={18} /> Update Metadata
                        </button>
                    </div>

                    {/* Right Column: Key Editor */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>Detection Keys</h3>

                        {/* Add Key Form */}
                        <form onSubmit={handleAddKey} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#475569' }}>TURKISH KEY (INPUT)</label>
                                    <input
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                                        placeholder="e.g. kurumsal paketler"
                                        value={newKeyDisplay}
                                        onChange={e => setNewKeyDisplay(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#94a3b8' }}>NORMALIZED (AUTO)</label>
                                    <input
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#f1f5f9', color: '#64748b' }}
                                        value={normalizePreview(newKeyDisplay)}
                                        disabled
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer', height: '38px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                        </form>

                        {/* Keys Table */}
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Display Key</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Normalized Key</th>
                                        <th style={{ padding: '0.75rem', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedIntent.keys && selectedIntent.keys.map((key, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: '500' }}>{key.display || key}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem', color: '#475569' }}>
                                                    {key.normalized || normalizePreview(key)}
                                                </code>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDeleteKey(key.normalized || normalizePreview(key))}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                                    title="Remove Key"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!selectedIntent.keys || selectedIntent.keys.length === 0) && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                                No keys defined. This intent will not trigger.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* Conflict Dashboard Section */}
            <ConflictDashboard />
        </div>
    );
};

export default IntentManager;
