import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const AdminAuth = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const auth = localStorage.getItem('cirak_admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'yucel190303') {
            localStorage.setItem('cirak_admin_auth', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Hatalı şifre.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('cirak_admin_auth');
        setIsAuthenticated(false);
    };

    if (isAuthenticated) {
        return (
            <div className="auth-wrapper">
                {typeof children === 'function'
                    ? children({ handleLogout })
                    : React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { handleLogout });
                        }
                        return child;
                    })
                }
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <div style={{
                    background: '#dbeafe',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    color: '#2563eb'
                }}>
                    <Lock size={32} />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Admin Girişi</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Yönetim paneline erişmek için şifre giriniz.</p>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <input
                            type="password"
                            placeholder="Şifre"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</div>}
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            background: '#2563eb',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Giriş Yap <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminAuth;
