import React, { useState, useEffect } from 'react';
import { Database, MessageSquare, AlertTriangle, Activity } from 'lucide-react';
import SnapshotControl from './SnapshotControl';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const analyticsRes = await fetch('http://localhost:5000/api/admin/analytics');
            const analyticsData = await analyticsRes.json();

            const intentsRes = await fetch('http://localhost:5000/api/admin/intents');
            const intentsData = await intentsRes.json();

            const fallbacksRes = await fetch('http://localhost:5000/api/admin/fallbacks');
            const fallbacksData = await fallbacksRes.json();

            setStats({
                totalIntents: intentsData.length,
                totalFallbacks: fallbacksData.length,
                dailyMessages: analyticsData.dailyMessageCount || 0,
                fallbackRate: analyticsData.fallbackRate || 0
            });

            setLogs(analyticsData.recentMessages || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-dashboard">
            <h1>Dashboard</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Overview of ÇIRAK system status and activity.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <MessageSquare size={32} />
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Intents</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalIntents || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <AlertTriangle size={32} />
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Fallbacks</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalFallbacks || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Activity size={32} />
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Messages Today</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.dailyMessages || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Database size={32} />
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Fallback Rate</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.fallbackRate?.toFixed(1) || 0}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <SnapshotControl />
            </div>

            <div className="admin-card">
                <h3>Recent Messages</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Last 10 user interactions
                </p>

                {logs.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                        No messages yet
                    </p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User Message</th>
                                <th>Matched Intent</th>
                                <th>Score</th>
                                <th>Fallback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                        {log.user_message}
                                    </td>
                                    <td>
                                        {log.matched_intent_id ? (
                                            <span style={{
                                                background: '#dcfce7',
                                                color: '#166534',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}>
                                                {log.matched_intent_id}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#94a3b8' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '600' }}>
                                            {log.score || 0}
                                        </span>
                                    </td>
                                    <td>
                                        {log.is_fallback ? (
                                            <span style={{ color: '#ef4444', fontWeight: '600' }}>Yes</span>
                                        ) : (
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>No</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
