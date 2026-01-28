import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const FallbackManager = () => {
    const [fallbacks, setFallbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        message: '',
        tone: 'friendly',
        active: true
    });

    useEffect(() => {
        fetchFallbacks();
    }, []);

    const fetchFallbacks = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/fallbacks');
            const data = await res.json();
            setFallbacks(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/fallbacks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsAdding(false);
                setFormData({ id: '', message: '', tone: 'friendly', active: true });
                fetchFallbacks();
            }
        } catch (error) {
            console.error('Add error:', error);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const fallback = fallbacks.find(f => f.id === id);
            const res = await fetch(`http://localhost:5000/api/admin/fallbacks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fallback)
            });
            if (res.ok) {
                setEditingId(null);
                fetchFallbacks();
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this fallback?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/fallbacks/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchFallbacks();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-fallbacks">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Fallback Messages</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Fallbacks are shown when no intent matches the user query (round-robin).
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setIsAdding(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Add Fallback
                </button>
            </div>

            {isAdding && (
                <div className="admin-card" style={{ marginBottom: '2rem' }}>
                    <h3>Add New Fallback</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <div className="admin-form-group">
                            <label>Fallback ID</label>
                            <input
                                className="admin-input"
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                placeholder="e.g. fallback_003"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>Message</label>
                            <textarea
                                className="admin-input"
                                style={{ minHeight: '80px' }}
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter fallback message..."
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>Tone</label>
                            <select
                                className="admin-input"
                                value={formData.tone}
                                onChange={e => setFormData({ ...formData, tone: e.target.value })}
                            >
                                <option value="friendly">Friendly</option>
                                <option value="professional">Professional</option>
                                <option value="kurumsal">Kurumsal</option>
                                <option value="nötr">Nötr</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                />
                                Active
                            </label>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button className="admin-btn admin-btn-primary" onClick={handleAdd}>Save</button>
                        <button className="admin-btn" onClick={() => setIsAdding(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Message</th>
                            <th>Tone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fallbacks.map(fallback => (
                            <tr key={fallback.id}>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    {fallback.id}
                                </td>
                                <td>
                                    {editingId === fallback.id ? (
                                        <textarea
                                            className="admin-input"
                                            style={{ minHeight: '60px', width: '100%' }}
                                            value={fallback.message}
                                            onChange={e => setFallbacks(fallbacks.map(f =>
                                                f.id === fallback.id ? { ...f, message: e.target.value } : f
                                            ))}
                                        />
                                    ) : (
                                        <div style={{ maxWidth: '400px' }}>{fallback.message}</div>
                                    )}
                                </td>
                                <td>
                                    {editingId === fallback.id ? (
                                        <select
                                            className="admin-input"
                                            value={fallback.tone}
                                            onChange={e => setFallbacks(fallbacks.map(f =>
                                                f.id === fallback.id ? { ...f, tone: e.target.value } : f
                                            ))}
                                        >
                                            <option value="friendly">Friendly</option>
                                            <option value="professional">Professional</option>
                                            <option value="kurumsal">Kurumsal</option>
                                            <option value="nötr">Nötr</option>
                                        </select>
                                    ) : (
                                        <span style={{
                                            background: '#f1f5f9',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.875rem'
                                        }}>
                                            {fallback.tone}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span style={{
                                        color: fallback.active ? '#10b981' : '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        {fallback.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {editingId === fallback.id ? (
                                            <>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '0.5rem', color: '#10b981' }}
                                                    onClick={() => handleUpdate(fallback.id)}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '0.5rem' }}
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        fetchFallbacks();
                                                    }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '0.5rem' }}
                                                    onClick={() => setEditingId(fallback.id)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="admin-btn"
                                                    style={{ padding: '0.5rem', color: '#ef4444' }}
                                                    onClick={() => handleDelete(fallback.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FallbackManager;
