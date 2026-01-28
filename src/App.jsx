import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WidgetContainer from './components/widget/WidgetContainer';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import IntentManager from './components/admin/IntentManager';
import FallbackManager from './components/admin/FallbackManager';
import SnapshotControl from './components/admin/SnapshotControl';
import TestConsole from './components/admin/TestConsole';
import QualityControl from './components/admin/QualityControl';
import Analytics from './components/admin/Analytics';
import SnapshotDiff from './components/admin/SnapshotDiff';
import PricingManager from './components/admin/PricingManager';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>ÇIRAK Admin Paneli</h1>
            <a href="/admin" style={{ marginTop: '1rem', color: '#2563eb' }}>Panele Giriş</a>
          </div>
        } />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="intents" element={<IntentManager />} />
          <Route path="pricing" element={<PricingManager />} />
          <Route path="fallbacks" element={<FallbackManager />} />
          <Route path="snapshot" element={<SnapshotControl />} />
          <Route path="console" element={<TestConsole />} />
          <Route path="quality" element={<QualityControl />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="diff" element={<SnapshotDiff />} />
          <Route path="settings" element={<div>Settings coming soon...</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
