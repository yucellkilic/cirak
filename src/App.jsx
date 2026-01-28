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
          <div className="demo-stage">
            <div className="demo-content">
              <h1>ÇIRAK Demo Stage</h1>
              <p>Integration & Admin Panel Testing</p>
              <a href="/admin" className="admin-link-btn" style={{
                marginTop: '1rem',
                color: '#2563eb',
                display: 'inline-block',
                padding: '10px 20px',
                background: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>Panele Giriş</a>
            </div>
            <WidgetContainer />
          </div>
        } />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
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
