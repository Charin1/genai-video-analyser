import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import AudioRecorder from '../components/AudioRecorder';

const StrategicDashboard = () => {
    const [insights, setInsights] = useState([]);
    const [query, setQuery] = useState('');
    const [chatResult, setChatResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRecentInsights();
    }, []);

    const fetchRecentInsights = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/strategic/insights/recent`);
            const data = await res.json();
            setInsights(data);
        } catch (e) {
            console.error("Failed to fetch insights", e);
        }
    };

    const handleSmartSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/strategic/search/smart?query=${encodeURIComponent(query)}`, {
                method: 'POST'
            });
            const data = await res.json();
            setChatResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary-neon)] to-[var(--secondary-neon)]">
                    C-Suite Intelligence
                </h1>
                <AudioRecorder />
            </header>

            {/* Smart Search */}
            <section className="bg-white/50 backdrop-blur-md rounded-xl p-6 border border-[var(--glass-border)] shadow-sm">
                <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-4">Ask Your Data</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="e.g., Who did I meet last week about AI?"
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-neon)] transition-colors shadow-inner"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                    />
                    <button
                        onClick={handleSmartSearch}
                        disabled={loading}
                        className="btn-cyber text-white disabled:opacity-50"
                    >
                        {loading ? 'Thinking...' : 'Ask'}
                    </button>
                </div>

                {chatResult && (
                    <div className="mt-6 bg-white rounded-lg p-6 border border-gray-100 shadow-sm animate-fade-in">
                        <h3 className="text-lg font-medium text-[var(--primary-neon)] mb-2">Answer</h3>
                        <p className="text-[var(--text-main)] text-lg leading-relaxed">{chatResult.answer}</p>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Sources (Graph Nodes)</h4>
                            <div className="flex flex-wrap gap-2">
                                {chatResult.results.map((r, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                        {JSON.stringify(r)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Strategic Network (Graph Visualization Placeholder) */}
            <section className="bg-white/50 backdrop-blur-md rounded-xl p-6 border border-[var(--glass-border)] shadow-sm min-h-[400px]">
                <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-6">Strategic Network</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Connections */}
                    <div className="col-span-1 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-[var(--secondary-neon)] mb-4">Top Entities</h3>
                        <ul className="space-y-3">
                            {insights.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                    <span className="text-gray-700 group-hover:text-black">{item.name}</span>
                                    <span className="px-2 py-0.5 bg-[var(--primary-neon)]/10 text-[var(--primary-neon)] text-xs rounded-full border border-[var(--primary-neon)]/20">
                                        {item.type} ({item.connections})
                                    </span>
                                </li>
                            ))}
                            {insights.length === 0 && <p className="text-gray-500">No data available yet.</p>}
                        </ul>
                    </div>

                    {/* Placeholder for actual Graph Viz */}
                    <div className="col-span-2 bg-gray-50 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-center">
                            Knowledge Graph Visualization<br />
                            <span className="text-sm">(Integration with D3/React-Force-Graph would go here)</span>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StrategicDashboard;
