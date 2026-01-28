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
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Demo View */}
        <Route path="/" element={
          <div className="demo-stage">
            <div className="demo-content">
              <h1>ÇIRAK Demo Stage</h1>
              <p>Integration & Admin Panel Testing</p>
            </div>
            <WidgetContainer />
          </div>
        } />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="intents" element={<IntentManager />} />
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
