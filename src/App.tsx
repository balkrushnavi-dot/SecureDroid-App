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
    Activity,
    RefreshCw,
    Eye,
    FileText,
    MessageSquare,
    Users,
    Zap,
    CheckCircle2,
    XCircle,
    Clock,
    Server,
    Filter,
    Smartphone,
    Database,
    Network,
    User,
    Bell,
    Moon,
    Sun,
    Globe,
    ShieldOff,
} from 'lucide-react';
import { useSecureDroid } from './hooks/useSecureDroid';
import { ThreatModelCenterScreen } from './components/security/ThreatModelCenterScreen';
import { SecurityAuditLogScreen } from './components/security/SecurityAuditLogScreen';
import { AppSecurityAuditorScreen } from './components/security/AppSecurityAuditorScreen';
import { NetworkControlScreen } from './components/NetworkControlScreen';
import { DeviceSecurityScreen } from './components/DeviceSecurityScreen';
import { PrivacyRadarScreen } from './components/PrivacyRadarScreen';
import { SecurityReportScreen } from './components/SecurityReportScreen';
import { AppDetailScreen } from './components/AppDetailScreen';
import { AiAssistantScreen } from './components/AiAssistantScreen';
import { FamilyScreen } from './components/FamilyScreen';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
} from './components/ui/designSystem';

type Screen =
    | 'home'
    | 'threat_model'
    | 'app_auditor'
    | 'security_log'
    | 'network'
    | 'device_security'
    | 'privacy_radar'
    | 'security_report'
    | 'app_detail'
    | 'ai_assistant'
    | 'family'
    | 'settings';

// ============================================================
// LOADING SCREEN
// ============================================================
function LoadingScreen({ message }: { message?: string }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-sky-400/30 border-t-sky-400 animate-spin mx-auto" />
                <h1 className="text-3xl font-bold text-white">SecureDroid</h1>
                <p className="text-slate-400 text-sm">{message || 'Loading security data...'}</p>
            </div>
        </div>
    );
}

// ============================================================
// ERROR SCREEN
// ============================================================
function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-sm space-y-4">
                <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                <h2 className="text-xl font-bold text-white">Connection Error</h2>
                <p className="text-slate-400 text-sm">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}

// ============================================================
// HOME SCREEN (same as dummy but using real data)
// ============================================================
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
    const { apps, risks, loading, connected, error, score, reload } = useSecureDroid();

    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
    const totalRisks = risks.length;
    const userApps = apps.filter(a => !a.isSystemApp).length;

    const protectionStatus = (() => {
        if (!connected) return { label: 'Disconnected', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle };
        if (loading) return { label: 'Loading...', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: RefreshCw };
        if (highRiskCount > 0) return { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle };
        if (totalRisks > 0) return { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle };
        if (score >= 70) return { label: 'Protected', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck };
        return { label: 'Needs Review', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Shield };
    })();

    const ProtectionIcon = protectionStatus.icon;

    const quickActions = [
        { id: 'scan', label: 'Scan Device', icon: Zap, color: 'bg-sky-500/10 text-sky-400' },
        { id: 'network', label: 'Network Protection', icon: Wifi, color: 'bg-emerald-500/10 text-emerald-400' },
        { id: 'app_auditor', label: 'App Security', icon: ShieldCheck, color: 'bg-purple-500/10 text-purple-400' },
        { id: 'privacy_radar', label: 'Privacy Radar', icon: Eye, color: 'bg-amber-500/10 text-amber-400' },
    ];

    const cards = [
        { id: 'app_auditor' as Screen, title: 'App Security Auditor', description: `${apps.length} apps analyzed`, icon: ShieldCheck, badge: totalRisks, color: 'from-sky-500/10 to-sky-600/5' },
        { id: 'threat_model' as Screen, title: 'Threat Model Center', description: `${highRiskCount} high, ${mediumRiskCount} medium risks`, icon: AlertTriangle, badge: totalRisks, color: 'from-amber-500/10 to-amber-600/5' },
        { id: 'device_security' as Screen, title: 'Device Security', description: 'Screen lock, encryption, patch', icon: Lock, color: 'from-emerald-500/10 to-emerald-600/5' },
        { id: 'network' as Screen, title: 'Network Protection', description: 'VPN status & control', icon: Wifi, color: 'from-blue-500/10 to-blue-600/5' },
        { id: 'privacy_radar' as Screen, title: 'Privacy Radar', description: 'Apps accessing your data', icon: Eye, color: 'from-amber-500/10 to-amber-600/5' },
        { id: 'security_log' as Screen, title: 'Security Audit Log', description: 'View security timeline', icon: ScrollText, color: 'from-slate-500/10 to-slate-600/5' },
    ];

    return (
        <div className="p-4 space-y-4 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">SecureDroid</h1>
                    <p className="text-sm text-slate-400">Security for your phone</p>
                </div>
                <button
                    onClick={reload}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className={`p-3 rounded-xl border ${connected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
                    {loading && <span className="text-xs text-slate-500">Loading...</span>}
                    {error && <span className="text-xs text-red-400 ml-2">{error}</span>}
                </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="flex items-center justify-between relative">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-slate-100">{score}</span>
                            <span className="text-sm text-slate-500">/ 100</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <ProtectionIcon className={`w-4 h-4 ${protectionStatus.color}`} />
                            <span className={`text-sm font-medium ${protectionStatus.color}`}>{protectionStatus.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${protectionStatus.bg} ${protectionStatus.color}`}>
                                {totalRisks} issues
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Apps</div>
                        <div className="text-2xl font-semibold text-slate-100">{apps.length}</div>
                        <div className="text-xs text-slate-500">{userApps} user apps</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-slate-100">{apps.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className={`text-lg font-bold ${totalRisks > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{totalRisks}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risks</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-emerald-400">{userApps}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">User</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-lg font-bold text-sky-400">{apps.length - userApps}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">System</div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={() => { if (action.id === 'scan') reload(); else onNavigate(action.id as Screen); }}
                            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all text-center"
                        >
                            <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center mx-auto mb-1`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{action.label}</span>
                        </button>
                    );
                })}
            </div>

            <SecureDroidSectionHeader title="Security Tools" />

            <div className="space-y-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={card.id}
                            onClick={() => onNavigate(card.id)}
                            className="w-full text-left"
                        >
                            <div className={`bg-gradient-to-r ${card.color} p-4 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all`}>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-xl bg-slate-800/50 p-2.5">
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
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================
// SETTINGS SCREEN
// ============================================================
function SettingsScreen() {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="p-4 pb-24 space-y-4">
            <SecureDroidSectionHeader title="Settings" />
            <div className="space-y-3">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Moon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-200">Dark Mode</span>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-sky-500' : 'bg-slate-600'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-200">Notifications</span>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-sky-500' : 'bg-slate-600'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>
            <SecureDroidSectionHeader title="About" />
            <div className="space-y-3">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                            <div className="font-semibold text-slate-100">About SecureDroid</div>
                            <div className="text-sm text-slate-400 mt-1 leading-relaxed">
                                SecureDroid reports on real, checkable signals about your device and installed
                                apps. It does not perform malware scanning, hardware attestation, or bootloader
                                verification, and does not claim capabilities it does not have.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                            <div className="font-semibold text-slate-100">Privacy Policy</div>
                            <div className="text-sm text-slate-400 mt-1 leading-relaxed">
                                All security analysis is performed locally on your device. No data is sent
                                to external servers unless explicitly configured.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                            <div className="font-semibold text-slate-100">Version</div>
                            <div className="text-sm text-slate-400 mt-1">v1.0.0 • Built with ❤️</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
    const { loading, connected, error, reload } = useSecureDroid();
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    // Show loading while initial data is loading
    if (loading && !connected && !error) {
        return <LoadingScreen message="Loading security data..." />;
    }

    // Show error screen if connection failed
    if (!connected && error) {
        return <ErrorScreen message={error} onRetry={reload} />;
    }

    // Once connected, render the full app
    const navigateTo = (screen: Screen) => setCurrentScreen(screen);
    const handleBack = () => setCurrentScreen('home');
    const handleAppDetail = (packageName: string) => {
        setSelectedApp(packageName);
        setCurrentScreen('app_detail');
    };
    const handleAppDetailBack = () => {
        setSelectedApp(null);
        setCurrentScreen('app_auditor');
    };

    const NAV_ITEMS = [
        { id: 'home' as Screen, label: 'HOME', icon: Home },
        { id: 'app_auditor' as Screen, label: 'APPS', icon: ShieldCheck },
        { id: 'threat_model' as Screen, label: 'THREATS', icon: AlertTriangle },
        { id: 'network' as Screen, label: 'NETWORK', icon: Wifi },
        { id: 'security_log' as Screen, label: 'LOG', icon: ScrollText },
        { id: 'settings' as Screen, label: 'SETTINGS', icon: SettingsIcon },
    ];

    const getTitle = () => {
        const titles: Record<Screen, string> = {
            home: 'SecureDroid',
            threat_model: 'Threat Model Center',
            app_auditor: 'App Security Auditor',
            security_log: 'Security Audit Log',
            network: 'Network Protection',
            device_security: 'Device Security',
            privacy_radar: 'Privacy Radar',
            security_report: 'Security Report',
            app_detail: 'App Detail',
            ai_assistant: 'AI Assistant',
            family: 'Family Protection',
            settings: 'Settings',
        };
        return titles[currentScreen] || 'SecureDroid';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-7xl mx-auto">
            <SecureDroidTopBar
                title={getTitle()}
                onBack={currentScreen !== 'home' ? handleBack : undefined}
            />
            <main className="flex-1 overflow-y-auto">
                {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
                {currentScreen === 'threat_model' && <ThreatModelCenterScreen onBack={handleBack} />}
                {currentScreen === 'app_auditor' && (
                    <AppSecurityAuditorScreen onBack={handleBack} onAppSelect={handleAppDetail} />
                )}
                {currentScreen === 'security_log' && <SecurityAuditLogScreen onBack={handleBack} />}
                {currentScreen === 'network' && <NetworkControlScreen onBack={handleBack} />}
                {currentScreen === 'device_security' && <DeviceSecurityScreen onBack={handleBack} />}
                {currentScreen === 'privacy_radar' && <PrivacyRadarScreen onBack={handleBack} />}
                {currentScreen === 'security_report' && <SecurityReportScreen onBack={handleBack} />}
                {currentScreen === 'app_detail' && selectedApp && (
                    <AppDetailScreen onBack={handleAppDetailBack} packageName={selectedApp} />
                )}
                {currentScreen === 'ai_assistant' && <AiAssistantScreen onBack={handleBack} />}
                {currentScreen === 'family' && <FamilyScreen onBack={handleBack} />}
                {currentScreen === 'settings' && <SettingsScreen />}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-7xl mx-auto">
                <div className="flex items-center justify-around h-16 px-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentScreen === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentScreen(item.id)}
                                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all relative ${
                                    isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold tracking-wider mt-0.5">{item.label}</span>
                                {isActive && <div className="absolute top-0 w-6 h-0.5 bg-sky-400 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
