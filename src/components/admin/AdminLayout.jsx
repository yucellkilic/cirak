import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, AlertTriangle, Database, Terminal, Settings, Shield, BarChart, GitCompare } from 'lucide-react';
import '../../styles/admin.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>ÇIRAK Admin</h2>
                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/intents" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <MessageSquare size={20} /> Intents
                    </NavLink>
                    <NavLink to="/admin/fallbacks" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <AlertTriangle size={20} /> Fallbacks
                    </NavLink>
                    <NavLink to="/admin/snapshot" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Database size={20} /> Snapshot
                    </NavLink>
                    <NavLink to="/admin/console" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Terminal size={20} /> Test Console
                    </NavLink>
                    <NavLink to="/admin/quality" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Shield size={20} /> Quality Control
                    </NavLink>
                    <NavLink to="/admin/analytics" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <BarChart size={20} /> Analytics
                    </NavLink>
                    <NavLink to="/admin/diff" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <GitCompare size={20} /> Snapshot Diff
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} /> Settings
                    </NavLink>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
