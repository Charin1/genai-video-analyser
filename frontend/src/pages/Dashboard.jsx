import React from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, TrendingUp, Share2, Download, Activity, Target, Zap } from 'lucide-react';

import config from '../config';

const Dashboard = () => {
    const location = useLocation();
    const data = location.state?.data;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Activity className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Data Stream Detected</h2>
                <p className="text-gray-600">Please initiate a new analysis from the upload portal.</p>
            </div>
        );
    }

    const { analysis, transcript } = data;
    const { report, domain } = analysis;

    const colorClasses = {
        green: {
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            text: 'text-green-400'
        },
        purple: {
            bg: 'bg-purple-500/20',
            border: 'border-purple-500/30',
            text: 'text-purple-400'
        },
        yellow: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400'
        },
        blue: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            text: 'text-blue-400'
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => {
        const colors = colorClasses[color] || colorClasses.blue;
        return (
            <div className="cyber-card p-6 flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center border ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={colors.text} size={24} />
                </div>
                <div>
                    <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-medium">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in space-y-8">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 md:pb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="px-3 py-1 rounded-md bg-[var(--primary-neon)]/10 text-[var(--primary-neon)] text-xs font-bold uppercase tracking-widest border border-[var(--primary-neon)]/20">
                            {domain}
                        </span>
                        <span className="text-[var(--text-muted)] text-sm font-mono break-all">{data.filename}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Analysis Report</h1>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="btn-cyber flex items-center gap-2 !py-2 !px-4 !text-sm flex-1 md:flex-initial justify-center">
                        <Share2 size={16} /> Share
                    </button>
                    <a href={`${config.API_URL}/api/v1/download/${data.filename.replace('.', '_')}`} className="btn-cyber flex items-center gap-2 !py-2 !px-4 !text-sm !bg-[var(--primary-neon)] !text-black hover:!bg-white hover:!text-black flex-1 md:flex-initial justify-center">
                        <Download size={16} /> Export CSV
                    </a>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={Activity} label="Confidence" value="98.5%" color="green" />
                <StatCard icon={Target} label="Entities" value="12 Detected" color="purple" />
                <StatCard icon={Zap} label="Processing" value="1.2s" color="yellow" />
                <StatCard icon={TrendingUp} label="Sentiment" value="Positive" color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Report Content */}
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(report).map(([key, value], idx) => (
                        <div key={key} className="cyber-card p-8" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 bg-[var(--secondary-neon)] rounded-full shadow-[0_0_10px_var(--secondary-neon)]"></div>
                                <h3 className="text-xl font-bold capitalize text-white tracking-wide">
                                    {key.replace(/_/g, ' ')}
                                </h3>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {typeof value === 'string' ? (
                                    <p className="text-gray-300 leading-relaxed text-lg">{value}</p>
                                ) : Array.isArray(value) ? (
                                    <ul className="space-y-3">
                                        {value.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary-neon)] flex-shrink-0"></span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <pre className="bg-[#050505] p-4 rounded-xl border border-white/10 overflow-x-auto font-mono text-sm text-[var(--primary-neon)]">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Transcript Card */}
                    <div className="cyber-card p-6 flex flex-col h-[600px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                            <FileText size={20} className="text-[var(--primary-neon)]" />
                            Transcript Stream
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4">
                            <p className="text-sm text-gray-400 leading-relaxed font-mono">
                                {transcript}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider">
                            <span>{transcript.length} chars</span>
                            <span>Verified by Gemini</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
