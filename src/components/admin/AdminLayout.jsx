import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, AlertTriangle, Activity, Camera, Settings, DollarSign, LogOut } from 'lucide-react';
import AdminAuth from './AdminAuth';
import '../../styles/admin.css';

const AdminLayout = () => {
    return (
        <AdminAuth>
            {({ handleLogout }) => (
                <div className="admin-layout">
                    <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="admin-brand">
                            <h2>ÇIRAK <span style={{ fontWeight: 'normal', fontSize: '0.8em' }}>Admin</span></h2>
                        </div>

                        <nav className="admin-nav" style={{ flex: 1 }}>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <LayoutDashboard size={20} /> Dashboard
                            </NavLink>
                            <NavLink to="/admin/intents" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <MessageSquare size={20} /> Intent Yönetimi
                            </NavLink>
                            <NavLink to="/admin/pricing" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <DollarSign size={20} /> Fiyatlandırma
                            </NavLink>
                            <NavLink to="/admin/fallbacks" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <AlertTriangle size={20} /> Fallback Yönetimi
                            </NavLink>
                            <NavLink to="/admin/snapshot" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <Camera size={20} /> Snapshot Kontrol
                            </NavLink>
                            <NavLink to="/admin/quality" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <Activity size={20} /> Kalite Kontrol
                            </NavLink>
                            <NavLink to="/admin/settings" className={({ isActive }) => ["admin-nav-item", isActive ? 'active' : ''].join(' ')}>
                                <Settings size={20} /> Ayarlar
                            </NavLink>
                        </nav>

                        <div style={{ padding: '1rem' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    width: '100%',
                                    fontSize: '0.9rem'
                                }}>
                                <LogOut size={18} /> Çıkış Yap
                            </button>
                        </div>
                    </aside>

                    <main className="admin-content">
                        <Outlet />
                    </main>
                </div>
            )}
        </AdminAuth>
    );
};

export default AdminLayout;
