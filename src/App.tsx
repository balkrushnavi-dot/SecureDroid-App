import React, { useState } from 'react';
import {
    Shield,
    LayoutGrid,
    Settings as SettingsIcon,
    ChevronRight,
    Info,
    Wifi,
    AlertTriangle,
    ScrollText,
    Home,
    ShieldCheck,
    Lock,
    Activity
} from 'lucide-react';
import { useSecureDroid } from './hooks/useSecureDroid';
import { ThreatModelCenterScreen } from './components/security/ThreatModelCenterScreen';
import { SecurityAuditLogScreen } from './components/security/SecurityAuditLogScreen';
import { AppSecurityAuditorScreen } from './components/security/AppSecurityAuditorScreen';
import { NetworkControlScreen } from './components/NetworkControlScreen';

import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip
} from './components/ui/designSystem';

type Screen = 'home' | 'threat_model' | 'app_auditor' | 'security_log' | 'network' | 'settings';

interface NavItem {
    id: Screen;
    label: string;
    icon: React.ElementType;
    badge?: number;
}

// Premium Home Screen
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
    const { apps, risks, loading, connected, error, score, reload } = useSecureDroid();

    // Count risks by severity
    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
    const totalRisks = risks.length;

    // Determine protection status
    const getProtectionStatus = () => {
        if (!connected) return { label: 'Disconnected', color: 'text-red-400', bg: 'bg-red-500/10' };
        if (loading) return { label: 'Loading...', color: 'text-amber-400', bg: 'bg-amber-500/10' };
        if (highRiskCount > 0) return { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/10' };
        if (totalRisks > 0) return { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-500/10' };
        if (score >= 70) return { label: 'Protected', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        return { label: 'Needs Review', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    };

    const protection = getProtectionStatus();

    // Navigation cards
    const cards: { id: Screen; title: string; description: string; icon: React.ElementType; badge?: number }[] = [
        {
            id: 'app_auditor',
            title: 'App Security Auditor',
            description: `${apps.length} apps analyzed`,
            icon: ShieldCheck,
            badge: totalRisks
        },
        {
            id: 'threat_model',
            title: 'Threat Model Center',
            description: `${highRiskCount} high risk, ${mediumRiskCount} medium`,
            icon: AlertTriangle,
            badge: totalRisks
        },
        {
            id: 'network',
            title: 'Network Protection',
            description: 'VPN status & control',
            icon: Wifi,
        },
        {
            id: 'security_log',
            title: 'Security Audit Log',
            description: 'View security timeline',
            icon: ScrollText,
        },
    ];

    return (
        <div className="p-4 space-y-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">SecureDroid</h1>
                    <p className="text-sm text-slate-400">Security for your phone</p>
                </div>
                <button
                    onClick={reload}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Connection Status */}
            <div className={`p-3 rounded-xl border ${connected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium">
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                    {loading && <span className="text-xs text-slate-500">Loading...</span>}
                    {error && <span className="text-xs text-red-400 ml-2">{error}</span>}
                </div>
            </div>

            {/* Security Score */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-slate-100">{score}</span>
                            <span className="text-sm text-slate-500">/ 100</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-medium ${protection.color}`}>{protection.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${protection.bg} ${protection.color}`}>
                                {totalRisks} issues
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Apps</div>
                        <div className="text-2xl font-semibold text-slate-100">{apps.length}</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-slate-100">{apps.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Apps</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className={`text-lg font-bold ${totalRisks > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {totalRisks}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risks Found</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-slate-100">
                        {apps.filter(a => !a.isSystemApp).length}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">User Apps</div>
                </div>
            </div>

            {/* Security Tools */}
            <SecureDroidSectionHeader title="Security Tools" isLight={false} />

            <div className="space-y-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.id}
                            onClick={() => onNavigate(card.id)}
                            className="w-full text-left"
                        >
                            <SecureDroidCard className="p-4 hover:border-slate-600 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-sky-500/10 p-2.5">
                                        <Icon className="w-5 h-5 text-sky-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-100">{card.title}</span>
                                            {card.badge !== undefined && card.badge > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                                                    {card.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-400 truncate">{card.description}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </div>
                            </SecureDroidCard>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Settings Screen
function SettingsScreen() {
    return (
        <div className="p-4 pb-24 space-y-4">
            <SecureDroidSectionHeader title="Settings" isLight={false} />

            <SecureDroidCard className="p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                        <div className="font-semibold text-slate-100">About SecureDroid</div>
                        <div className="text-sm text-slate-400 mt-1 leading-relaxed">
                            SecureDroid reports on real, checkable signals about your device and installed
                            apps. It does not perform malware scanning, hardware attestation, or bootloader
                            verification, and does not claim capabilities it does not have.
                        </div>
                    </div>
                </div>
            </SecureDroidCard>

            <SecureDroidCard className="p-4">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                        <div className="font-semibold text-slate-100">Privacy Policy</div>
                        <div className="text-sm text-slate-400 mt-1 leading-relaxed">
                            All security analysis is performed locally on your device. No data is sent
                            to external servers unless explicitly configured.
                        </div>
                    </div>
                </div>
            </SecureDroidCard>

            <div className="text-xs text-slate-500 text-center p-4">
                SecureDroid v1.0.0 • Built with ❤️
            </div>
        </div>
    );
}

// Main App Component
export default function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');

    const navigateTo = (screen: Screen) => setCurrentScreen(screen);
    const handleBack = () => setCurrentScreen('home');

    const NAV_ITEMS: NavItem[] = [
        { id: 'home', label: 'HOME', icon: Home },
        { id: 'app_auditor', label: 'APPS', icon: ShieldCheck },
        { id: 'threat_model', label: 'THREATS', icon: AlertTriangle },
        { id: 'network', label: 'NETWORK', icon: Wifi },
        { id: 'security_log', label: 'LOG', icon: ScrollText },
        { id: 'settings', label: 'SETTINGS', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-7xl mx-auto">
            <SecureDroidTopBar
                title={currentScreen === 'home' ? 'SecureDroid' : currentScreen.replace('_', ' ').toUpperCase()}
                onBack={currentScreen !== 'home' ? handleBack : undefined}
            />

            <main className="flex-1 overflow-y-auto">
                {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
                {currentScreen === 'threat_model' && <ThreatModelCenterScreen onBack={handleBack} />}
                {currentScreen === 'app_auditor' && <AppSecurityAuditorScreen onBack={handleBack} />}
                {currentScreen === 'security_log' && <SecurityAuditLogScreen onBack={handleBack} />}
                {currentScreen === 'network' && <NetworkControlScreen onBack={handleBack} />}
                {currentScreen === 'settings' && <SettingsScreen />}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-7xl mx-auto">
                <div className="flex items-center justify-around h-16 px-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentScreen === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentScreen(item.id)}
                                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all relative ${isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold tracking-wider mt-0.5">{item.label}</span>
                                {isActive && (
                                    <div className="absolute top-0 w-6 h-0.5 bg-sky-400 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

// Add missing import
import { RefreshCw } from 'lucide-react';
