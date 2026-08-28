import React, { useState } from 'react';
import {
    Shield,
    ShieldCheck,
    AlertTriangle,
    ScrollText,
    Home,
    Lock,
    Wifi,
    Eye,
    Zap,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Settings as SettingsIcon,
    ChevronRight,
    Smartphone,
    Globe,
    Info,
    Bell,
    Moon,
    ArrowRight,
    FileText,
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
    SecureDroidProgressRing,
} from './components/ui/designSystem';

export type Screen =
    | 'home'
    | 'app_auditor'
    | 'threat_model'
    | 'network'
    | 'security_log'
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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="space-y-4">
                <div className="w-14 h-14 rounded-full border-3 border-sky-400/20 border-t-sky-400 animate-spin mx-auto" />
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">SecureDroid</h1>
                <p className="text-slate-400 text-sm">{message || 'Initializing security engine...'}</p>
            </div>
        </div>
    );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
    const {
        apps,
        risks,
        loading,
        connected,
        error,
        score,
        securityLogs,
        vpnStatus,
        reload,
        usingMock,
    } = useSecureDroid();

    const [isScanning, setIsScanning] = useState(false);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            await reload();
        } finally {
            setIsScanning(false);
        }
    };

    const safeApps = Array.isArray(apps) ? apps : [];
    const safeRisks = Array.isArray(risks) ? risks : [];
    const safeLogs = Array.isArray(securityLogs) ? securityLogs : [];

    const highRiskCount = safeRisks.filter(
        (r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
    ).length;
    const mediumRiskCount = safeRisks.filter((r) => r.riskLevel === 'MEDIUM').length;
    const totalRisks = safeRisks.length;
    const userRisks = safeRisks.filter((r) => !r.isSystemApp).length;
    const systemRisks = safeRisks.filter((r) => r.isSystemApp).length;

    // Quick Security Areas List
    const securityAreas = [
        {
            id: 'device_security' as Screen,
            title: 'Device Security',
            description: 'Screen lock, encryption, security patch',
            icon: Smartphone,
            color: 'text-sky-400 bg-sky-500/10',
        },
        {
            id: 'network' as Screen,
            title: 'Network Protection',
            description: vpnStatus?.isActive
                ? 'VPN active & network protected'
                : 'VPN status & network security',
            icon: Wifi,
            color: 'text-emerald-400 bg-emerald-500/10',
        },
        {
            id: 'privacy_radar' as Screen,
            title: 'Privacy Radar',
            description: 'Apps accessing your data',
            icon: Eye,
            color: 'text-amber-400 bg-amber-500/10',
        },
        {
            id: 'app_auditor' as Screen,
            title: 'App Security',
            description: 'Analyze installed apps for risks',
            icon: ShieldCheck,
            color: 'text-indigo-400 bg-indigo-500/10',
        },
        {
            id: 'threat_model' as Screen,
            title: 'Threat Model',
            description: 'Security threats and recommendations',
            icon: AlertTriangle,
            color: 'text-rose-400 bg-rose-500/10',
        },
    ];

    const isBusy = loading || isScanning;

    return (
        <div className="p-4 space-y-4 pb-28 max-w-xl mx-auto">
            {/* Top App Bar */}
            <div className="flex items-center justify-between pt-1">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">SecureDroid</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Security for your phone</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onNavigate('settings')}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
                        aria-label="Open Settings"
                        title="Settings"
                    >
                        <SettingsIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Connection / Monitoring Status Row */}
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        {connected && !isBusy && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                isBusy
                                    ? 'bg-amber-400'
                                    : connected
                                    ? 'bg-emerald-400'
                                    : 'bg-rose-400'
                            }`}
                        />
                    </span>
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200">
                            {isBusy
                                ? 'Connecting...'
                                : connected
                                ? 'Connected'
                                : 'Disconnected'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                            {isBusy
                                ? 'Scanning device...'
                                : connected
                                ? 'Real-time protection active'
                                : 'Protection offline'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleScan}
                    disabled={isBusy}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    aria-label="Refresh status"
                    title="Refresh status"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Notice banner if plugin/bridge error */}
            {error && !connected && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-rose-200">SecureDroid Service Unavailable</div>
                        <div className="text-[11px] text-rose-300/80 mt-0.5 leading-relaxed">
                            {error}
                        </div>
                    </div>
                    <button
                        onClick={handleScan}
                        className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700/50 rounded-lg text-[10px] font-medium text-rose-100 shrink-0"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Main Security Score: Defense Index */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 text-center relative overflow-hidden">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Defense Index
                </div>

                <div className="my-2 flex justify-center">
                    <SecureDroidProgressRing
                        value={score}
                        size={104}
                        strokeWidth={7}
                        isLight={false}
                    >
                        <span className="text-3xl font-bold text-zinc-100">{score}</span>
                    </SecureDroidProgressRing>
                </div>

                <div className="mt-3 text-sm font-semibold text-zinc-100">
                    {totalRisks === 0
                        ? 'No issues detected'
                        : `${totalRisks} ${totalRisks === 1 ? 'issue' : 'issues'} detected`}
                </div>

                <div className="text-xs text-slate-400 mt-0.5">
                    {totalRisks === 0
                        ? 'Device configuration matches baseline security rules'
                        : `${highRiskCount} high · ${mediumRiskCount} medium risk findings`}
                </div>
            </div>

            {/* Security Summary (Compact 4-metric grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                    <div
                        className={`text-lg font-bold ${
                            totalRisks > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                    >
                        {totalRisks}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                        Issues
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-zinc-100">{safeApps.length}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                        Apps
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                    <div
                        className={`text-lg font-bold ${
                            userRisks > 0 ? 'text-amber-400' : 'text-zinc-300'
                        }`}
                    >
                        {userRisks}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                        User risks
                    </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-center">
                    <div
                        className={`text-lg font-bold ${
                            systemRisks > 0 ? 'text-rose-400' : 'text-zinc-300'
                        }`}
                    >
                        {systemRisks}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                        System risks
                    </div>
                </div>
            </div>

            {/* Primary Action Button: Scan Device */}
            <button
                onClick={handleScan}
                disabled={isBusy}
                className="w-full py-3.5 px-4 bg-zinc-100 hover:bg-white active:bg-zinc-200 text-zinc-950 font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
            >
                <Zap className={`w-4 h-4 text-zinc-950 ${isBusy ? 'animate-bounce' : ''}`} />
                <span>{isBusy ? 'Scanning Device...' : 'Scan Device'}</span>
            </button>

            {/* Quick Security Areas */}
            <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Security Areas
                </div>
                <div className="space-y-2">
                    {securityAreas.map((area) => {
                        const Icon = area.icon;
                        return (
                            <button
                                key={area.id}
                                onClick={() => onNavigate(area.id)}
                                className="w-full bg-slate-900/80 hover:bg-slate-850 active:bg-slate-800 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-left transition-all group"
                            >
                                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${area.color}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                                            {area.title}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate mt-0.5">
                                            {area.description}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Security Audit Log Activity Preview */}
            <div className="pt-2">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <ScrollText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-zinc-200">Recent Activity</div>
                            <div className="text-[11px] text-slate-400 truncate">
                                {safeLogs.length === 0
                                    ? 'No security events recorded'
                                    : `${safeLogs.length} ${
                                          safeLogs.length === 1 ? 'event' : 'events'
                                      } recorded in timeline`}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('security_log')}
                        className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 ml-2 py-1 px-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                        <span>View log</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-3 pb-1">
                SecureDroid Security Engine • v1.0.0
            </div>
        </div>
    );
}

// ============================================================
// SETTINGS SCREEN
// ============================================================
function SettingsScreen({ onBack }: { onBack: () => void }) {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="p-4 pb-28 space-y-4 max-w-xl mx-auto">
            <div className="space-y-2.5">
                <SecureDroidCard className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Moon className="w-4 h-4 text-slate-400" />
                            <div>
                                <span className="text-sm font-medium text-zinc-200">Dark Theme</span>
                                <p className="text-xs text-slate-400">High-contrast security palette</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-11 h-6 rounded-full transition-colors ${
                                darkMode ? 'bg-sky-500' : 'bg-slate-600'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                    darkMode ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                            />
                        </button>
                    </div>
                </SecureDroidCard>

                <SecureDroidCard className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <div>
                                <span className="text-sm font-medium text-zinc-200">Security Notifications</span>
                                <p className="text-xs text-slate-400">Alerts for critical risk detections</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-11 h-6 rounded-full transition-colors ${
                                notifications ? 'bg-sky-500' : 'bg-slate-600'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                    notifications ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                            />
                        </button>
                    </div>
                </SecureDroidCard>
            </div>

            <SecureDroidSectionHeader title="About" />

            <div className="space-y-2.5">
                <SecureDroidCard className="p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="font-semibold text-zinc-100 text-sm">About SecureDroid</div>
                            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                                SecureDroid reports on real, checkable signals about your device and installed
                                apps. It adheres strictly to Android platform APIs and does not claim capabilities
                                it does not have.
                            </div>
                        </div>
                    </div>
                </SecureDroidCard>

                <SecureDroidCard className="p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="font-semibold text-zinc-100 text-sm">Privacy Commitment</div>
                            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                                All security evaluations are performed locally on your device. No telemetry or
                                application inventories are transmitted to external servers.
                            </div>
                        </div>
                    </div>
                </SecureDroidCard>

                <SecureDroidCard className="p-4">
                    <div className="flex items-start gap-3">
                        <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <div className="font-semibold text-zinc-100 text-sm">Version</div>
                            <div className="text-xs text-slate-400 mt-1">v1.0.0 • Production Build</div>
                        </div>
                    </div>
                </SecureDroidCard>
            </div>
        </div>
    );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
    const { loading, connected, error, reload } = useSecureDroid();
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    if (loading && !connected && !error) {
        return <LoadingScreen message="Loading security data..." />;
    }

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

    // Exactly 5 Primary Destinations for Fixed Bottom Bar
    const PRIMARY_NAV_ITEMS = [
        { id: 'home' as Screen, label: 'Home', icon: Home },
        { id: 'app_auditor' as Screen, label: 'Apps', icon: ShieldCheck },
        { id: 'threat_model' as Screen, label: 'Threats', icon: AlertTriangle },
        { id: 'network' as Screen, label: 'Network', icon: Wifi },
        { id: 'security_log' as Screen, label: 'Log', icon: ScrollText },
    ];

    const getTitle = () => {
        const titles: Record<Screen, string> = {
            home: 'SecureDroid',
            app_auditor: 'Apps',
            threat_model: 'Threats',
            network: 'Network',
            security_log: 'Log',
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

    const isSubScreen = ![
        'home',
        'app_auditor',
        'threat_model',
        'network',
        'security_log',
    ].includes(currentScreen);

    return (
        <div className="min-h-screen bg-slate-950 text-zinc-100 flex flex-col max-w-2xl mx-auto relative font-sans antialiased">
            {/* Top Bar for sub-screens or non-home tabs */}
            {currentScreen !== 'home' && (
                <SecureDroidTopBar
                    title={getTitle()}
                    onBack={handleBack}
                />
            )}

            <main className="flex-1 overflow-y-auto">
                {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
                {currentScreen === 'app_auditor' && (
                    <AppSecurityAuditorScreen
                        onBack={handleBack}
                        onAppSelect={handleAppDetail}
                    />
                )}
                {currentScreen === 'threat_model' && (
                    <ThreatModelCenterScreen onBack={handleBack} />
                )}
                {currentScreen === 'network' && (
                    <NetworkControlScreen onBack={handleBack} />
                )}
                {currentScreen === 'security_log' && (
                    <SecurityAuditLogScreen onBack={handleBack} />
                )}
                {currentScreen === 'device_security' && (
                    <DeviceSecurityScreen onBack={handleBack} />
                )}
                {currentScreen === 'privacy_radar' && (
                    <PrivacyRadarScreen onBack={handleBack} />
                )}
                {currentScreen === 'security_report' && (
                    <SecurityReportScreen onBack={handleBack} />
                )}
                {currentScreen === 'app_detail' && selectedApp && (
                    <AppDetailScreen
                        onBack={handleAppDetailBack}
                        packageName={selectedApp}
                    />
                )}
                {currentScreen === 'ai_assistant' && (
                    <AiAssistantScreen onBack={handleBack} />
                )}
                {currentScreen === 'family' && (
                    <FamilyScreen onBack={handleBack} />
                )}
                {currentScreen === 'settings' && (
                    <SettingsScreen onBack={handleBack} />
                )}
            </main>

            {/* Fixed Bottom Navigation (Exactly 5 Items: Home, Apps, Threats, Network, Log) */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 max-w-2xl mx-auto pb-safe">
                <div className="flex items-center justify-around h-16 px-1">
                    {PRIMARY_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            currentScreen === item.id ||
                            (item.id === 'app_auditor' && currentScreen === 'app_detail');
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentScreen(item.id)}
                                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors relative ${
                                    isActive
                                        ? 'text-sky-400'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                aria-label={item.label}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span
                                    className={`text-[11px] mt-1 font-medium tracking-tight ${
                                        isActive ? 'text-sky-400 font-semibold' : 'text-slate-400'
                                    }`}
                                >
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 w-8 h-0.5 bg-sky-400 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
