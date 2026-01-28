import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Edit3, Check, X, RefreshCw } from 'lucide-react';

const PricingManager = () => {
    const [pricing, setPricing] = useState({ packages: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/pricing');
            if (!res.ok) throw new Error("API Error");
            const data = await res.json();
            setPricing(data);
        } catch (err) {
            setNotification({ type: 'error', message: 'Fiyatlar yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePackageChange = (idx, field, value) => {
        const newPackages = [...pricing.packages];
        newPackages[idx][field] = value;
        setPricing({ ...pricing, packages: newPackages });
    };

    const handleSave = async () => {
        setSaving(true);
        setNotification(null);
        try {
            const res = await fetch('http://localhost:5000/api/admin/pricing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pricing)
            });

            if (res.ok) {
                setNotification({ type: 'success', message: 'Fiyatlar başarıyla güncellendi.' });
            } else {
                setNotification({ type: 'error', message: 'Kaydetme başarısız.' });
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Ağ hatası.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Fiyatlandırma Yönetimi</h1>
                    <p style={{ color: '#64748b' }}>Paket fiyatlarını ve içeriklerini düzenleyin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: '#2563eb',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontWeight: '600',
                        cursor: saving ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            {notification && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    background: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: notification.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${notification.type === 'success' ? '#22c55e' : '#ef4444'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {notification.message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {pricing.packages.map((pkg, idx) => (
                    <div key={pkg.id || idx} style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>{pkg.id}</span>
                            <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Aktif
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Paket Adı</label>
                                <input
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                                    value={pkg.name}
                                    onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Fiyat ({pricing.currency})</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}
                                    value={pkg.price}
                                    onChange={(e) => handlePackageChange(idx, 'price', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingManager;
