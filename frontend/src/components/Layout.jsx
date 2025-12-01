import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, BarChart2, Settings, Activity } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`
          relative flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300
          ${isActive
                        ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(0,243,255,0.2)] border border-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
        `}
            >
                <Icon size={18} className={isActive ? 'text-[var(--primary-neon)]' : ''} />
                <span className="font-medium tracking-wide text-sm md:text-base">{label}</span>
                {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[var(--primary-neon)] shadow-[0_0_10px_var(--primary-neon)] rounded-full"></span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[url('/grid.svg')]">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="cyber-card px-4 md:px-6 py-3 flex justify-between items-center bg-[#030014]/80">

                        {/* Logo */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[var(--primary-neon)] to-[var(--secondary-neon)] flex items-center justify-center shadow-[0_0_20px_rgba(188,19,254,0.4)]">
                                <Activity className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-white tracking-wider">NEXUS<span className="text-[var(--primary-neon)]">AI</span></h1>
                                <p className="text-[9px] md:text-[10px] text-[var(--primary-neon)] tracking-[0.2em] uppercase">Video Intelligence</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <NavItem to="/" icon={Video} label="Analyze" />
                            <NavItem to="/dashboard" icon={BarChart2} label="Insights" />
                        </div>

                        {/* Settings / Profile */}
                        <button className="hidden md:block p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 pt-32 pb-12 max-w-7xl relative z-10">
                {children}
            </main>

            {/* Background Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--secondary-neon)] opacity-[0.05] blur-[120px] rounded-full animate-float" style={{ animationDuration: '10s' }}></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--primary-neon)] opacity-[0.05] blur-[120px] rounded-full animate-float" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
            </div>
        </div>
    );
};

export default Layout;
