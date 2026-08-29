import React, { useState } from 'react';
import {
    Shield,
    Settings as SettingsIcon,
    ChevronRight,
    Info,
    Wifi,
    AlertTriangle,
    ScrollText,
    Home,
    ShieldCheck,
    Lock,
    RefreshCw,
    Eye,
    Zap,
    XCircle,
    Database,
    Users,
    Bell,
    Moon,
    Globe,
    Server,
    Smartphone,
} from 'lucide-react';

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
    SecureDroidBadge,
    SecureDroidProgressRing,
    SecureDroidStatCard,
    SecureDroidGlassCard,
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

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-sky-400/30 border-t-sky-400 animate-spin mx-auto" />
                <h1 className="text-2xl font-bold text-white">
                    SecureDroid
                </h1>
                <p className="text-sm text-slate-400">
                    Loading security data...
                </p>
            </div>
        </div>
    );
}

function ErrorScreen({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-sm space-y-4">
                <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                <h2 className="text-xl font-bold text-white">
                    Connection Error
                </h2>
                <p className="text-sm text-slate-400">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}

function HomeScreen({
    onNavigate,
}: {
    onNavigate: (screen: Screen) => void;
}) {
    const [loading, setLoading] = useState(false);

    const apps: any[] = [];
    const risks: any[] = [];
    const connected = true;
    const error: string | null = null;
    const score = 100;
    const usingMock = true;

    const reload = () => {
        setLoading(true);
        window.setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    const safeApps = Array.isArray(apps) ? apps : [];
    const safeRisks = Array.isArray(risks) ? risks : [];

    const highRiskCount = safeRisks.filter(
        (r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
    ).length;

    const mediumRiskCount = safeRisks.filter(
        (r) => r.riskLevel === 'MEDIUM'
    ).length;

    const totalRisks = safeRisks.length;
    const userApps = safeApps.filter((a) => !a.isSystemApp).length;
    const systemApps = safeApps.length - userApps;

    const protectionStatus = (() => {
        if (!connected) {
            return {
                label: 'Disconnected',
                color: 'text-rose-400',
                icon: XCircle,
            };
        }

        if (loading) {
            return {
                label: 'Loading...',
                color: 'text-amber-400',
                icon: RefreshCw,
            };
        }

        if (highRiskCount > 0) {
            return {
                label: 'At Risk',
                color: 'text-rose-400',
                icon: AlertTriangle,
            };
        }

        if (totalRisks > 0) {
            return {
                label: 'Needs Attention',
                color: 'text-amber-400',
                icon: AlertTriangle,
            };
        }

        if (score >= 70) {
            return {
                label: 'Protected',
                color: 'text-emerald-400',
                icon: ShieldCheck,
            };
        }

        return {
            label: 'Needs Review',
            color: 'text-amber-400',
            icon: Shield,
        };
    })();

    const ProtectionIcon = protectionStatus.icon;

    const statusColor = protectionStatus.color.replace('text-', '');

    const ringColor =
        statusColor === 'emerald-400'
            ? 'emerald'
            : statusColor === 'amber-400'
              ? 'amber'
              : statusColor === 'rose-400'
                ? 'rose'
                : 'sky';

    const quickActions = [
        {
            id: 'scan',
            label: 'Scan Device',
            icon: Zap,
            color: 'bg-sky-500/10 text-sky-400',
        },
        {
            id: 'network',
            label: 'Network',
            icon: Wifi,
            color: 'bg-emerald-500/10 text-emerald-400',
        },
        {
            id: 'app_auditor',
            label: 'App Security',
            icon: ShieldCheck,
            color: 'bg-purple-500/10 text-purple-400',
        },
        {
            id: 'privacy_radar',
            label: 'Privacy',
            icon: Eye,
            color: 'bg-amber-500/10 text-amber-400',
        },
    ];

    const cards = [
        {
            id: 'app_auditor' as Screen,
            title: 'App Security Auditor',
            description: `${safeApps.length} apps analyzed`,
            icon: ShieldCheck,
            badge: totalRisks,
        },
        {
            id: 'threat_model' as Screen,
            title: 'Threat Model Center',
            description: `${highRiskCount} high, ${mediumRiskCount} medium`,
            icon: AlertTriangle,
            badge: totalRisks,
        },
        {
            id: 'device_security' as Screen,
            title: 'Device Security',
            description: 'Screen lock, encryption, patch',
            icon: Lock,
        },
        {
            id: 'network' as Screen,
            title: 'Network Protection',
            description: 'VPN status & control',
            icon: Wifi,
        },
        {
            id: 'privacy_radar' as Screen,
            title: 'Privacy Radar',
            description: 'Apps accessing your data',
            icon: Eye,
        },
        {
            id: 'security_log' as Screen,
            title: 'Security Audit Log',
            description: 'View security timeline',
            icon: ScrollText,
        },
    ];

    return (
        <div className="p-4 space-y-4 pb-24 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">
                        SecureDroid
                    </h1>
                    <p className="text-sm text-slate-400">
                        Security for your phone
                    </p>
                </div>

                <button
                    onClick={reload}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw
                        className={`w-4 h-4 text-slate-400 ${
                            loading ? 'animate-spin' : ''
                        }`}
                    />
                </button>
            </div>

            {usingMock && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/50 text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                        Demo mode — native security data is temporarily
                        disabled.
                    </span>
                </div>
            )}

            <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-zinc-200">
                    Connected
                </span>

                {loading && (
                    <span className="text-xs text-slate-500">
                        Loading...
                    </span>
                )}

                {error && (
                    <span className="text-xs text-rose-400 ml-2">
                        {error}
                    </span>
                )}
            </div>

            <SecureDroidGlassCard className="p-6">
                <div className="flex items-center gap-6">
                    <SecureDroidProgressRing
                        value={score}
                        size={88}
                        strokeWidth={7}
                        color={ringColor}
                    >
                        <span className="text-2xl font-bold text-zinc-100">
                            {score}
                        </span>
                    </SecureDroidProgressRing>

                    <div>
                        <div className="flex items-center gap-2">
                            <ProtectionIcon
                                className={`w-4 h-4 ${protectionStatus.color}`}
                            />

                            <span
                                className={`text-sm font-semibold ${protectionStatus.color}`}
                            >
                                {protectionStatus.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">
                                Defense Index
                            </span>

                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400">
                                {totalRisks} issues
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5" />
                                {safeApps.length} apps
                            </span>

                            <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {userApps} user
                            </span>

                            <span className="flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5" />
                                {systemApps} system
                            </span>
                        </div>
                    </div>
                </div>
            </SecureDroidGlassCard>

            <div className="grid grid-cols-4 gap-2">
                <SecureDroidStatCard
                    label="Total"
                    value={safeApps.length}
                    icon={Database}
                    color="slate"
                />

                <SecureDroidStatCard
                    label="Risks"
                    value={totalRisks}
                    icon={AlertTriangle}
                    color={totalRisks > 0 ? 'amber' : 'emerald'}
                />

                <SecureDroidStatCard
                    label="User"
                    value={userApps}
                    icon={Users}
                    color="emerald"
                />

                <SecureDroidStatCard
                    label="System"
                    value={systemApps}
                    icon={Server}
                    color="sky"
                />
            </div>

            <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.id}
                            onClick={() => {
                                if (action.id === 'scan') {
                                    reload();
                                } else {
                                    onNavigate(action.id as Screen);
                                }
                            }}
                            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all text-center group"
                        >
                            <div
                                className={`w-9 h-9 rounded-full ${action.color} flex items-center justify-center mx-auto mb-1.5 group-hover:scale-105 transition-transform`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>

                            <span className="text-[10px] text-slate-400 font-medium">
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <SecureDroidSectionHeader title="Security Tools" />

            <div className="space-y-2.5">
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
                                    <div className="rounded-xl bg-slate-800/50 p-2.5">
                                        <Icon className="w-5 h-5 text-sky-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-zinc-100">
                                                {card.title}
                                            </span>

                                            {card.badge !== undefined &&
                                                card.badge > 0 && (
                                                    <SecureDroidBadge
                                                        count={card.badge}
                                                    />
                                                )}
                                        </div>

                                        <div className="text-sm text-slate-400 truncate">
                                            {card.description}
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </div>
                            </SecureDroidCard>
                        </button>
                    );
                })}
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 pb-1">
                v1.0.0 • Demo mode
            </div>
        </div>
    );
}

function SettingsScreen() {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="p-4 pb-24 space-y-4 max-w-7xl mx-auto">
            <SecureDroidSectionHeader title="Settings" />

            <div className="space-y-2.5">
                <SecureDroidCard className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Moon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-zinc-200">
                                Dark Mode
                            </span>
                        </div>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-11 h-6 rounded-full transition-colors ${
                                darkMode ? 'bg-sky-500' : 'bg-slate-600'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                    darkMode
                                        ? 'translate-x-5'
                                        : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </SecureDroidCard>

                <SecureDroidCard className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-zinc-200">
                                Notifications
                            </span>
                        </div>

                        <button
                            onClick={() =>
                                setNotifications(!notifications)
                            }
                            className={`w-11 h-6 rounded-full transition-colors ${
                                notifications
                                    ? 'bg-sky-500'
                                    : 'bg-slate-600'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                    notifications
                                        ? 'translate-x-5'
                                        : 'translate-x-0'
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
                        <Info className="w-4 h-4 text-slate-400 mt-0.5" />

                        <div>
                            <div className="font-semibold text-zinc-100">
                                About SecureDroid
                            </div>

                            <div className="text-sm text-slate-400 mt-1 leading-relaxed">
                                SecureDroid reports on real, checkable signals
                                about your device and installed apps.
                            </div>
                        </div>
                    </div>
                </SecureDroidCard>

                <SecureDroidCard className="p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-slate-400 mt-0.5" />

                        <div>
                            <div className="font-semibold text-zinc-100">
                                Privacy Policy
                            </div>

                            <div className="text-sm text-slate-400 mt-1 leading-relaxed">
                                Security analysis is performed locally on
                                your device.
                            </div>
                        </div>
                    </div>
                </SecureDroidCard>

                <SecureDroidCard className="p-4">
                    <div className="flex items-start gap-3">
                        <Globe className="w-4 h-4 text-slate-400 mt-0.5" />

                        <div>
                            <div className="font-semibold text-zinc-100">
                                Version
                            </div>

                            <div className="text-sm text-slate-400 mt-1">
                                v1.0.0
                            </div>
                        </div>
                    </div>
                </SecureDroidCard>
            </div>
        </div>
    );
}

export default function App() {
    const [currentScreen, setCurrentScreen] =
        useState<Screen>('home');

    const [selectedApp, setSelectedApp] =
        useState<string | null>(null);

    const navigateTo = (screen: Screen) => {
        setCurrentScreen(screen);
    };

    const handleBack = () => {
        setCurrentScreen('home');
    };

    const handleAppDetail = (packageName: string) => {
        setSelectedApp(packageName);
        setCurrentScreen('app_detail');
    };

    const handleAppDetailBack = () => {
        setSelectedApp(null);
        setCurrentScreen('app_auditor');
    };

    const NAV_ITEMS = [
        {
            id: 'home' as Screen,
            label: 'HOME',
            icon: Home,
        },
        {
            id: 'app_auditor' as Screen,
            label: 'APPS',
            icon: ShieldCheck,
        },
        {
            id: 'threat_model' as Screen,
            label: 'THREATS',
            icon: AlertTriangle,
        },
        {
            id: 'network' as Screen,
            label: 'NETWORK',
            icon: Wifi,
        },
        {
            id: 'security_log' as Screen,
            label: 'LOG',
            icon: ScrollText,
        },
        {
            id: 'settings' as Screen,
            label: 'SETTINGS',
            icon: SettingsIcon,
        },
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
        <div className="min-h-screen bg-slate-950 text-zinc-100 flex flex-col max-w-7xl mx-auto">
            <SecureDroidTopBar
                title={getTitle()}
                onBack={
                    currentScreen !== 'home'
                        ? handleBack
                        : undefined
                }
            />

            <main className="flex-1 overflow-y-auto">
                {currentScreen === 'home' && (
                    <HomeScreen onNavigate={navigateTo} />
                )}

                {currentScreen === 'threat_model' && (
                    <ThreatModelCenterScreen onBack={handleBack} />
                )}

                {currentScreen === 'app_auditor' && (
                    <AppSecurityAuditorScreen
                        onBack={handleBack}
                        onAppSelect={handleAppDetail}
                    />
                )}

                {currentScreen === 'security_log' && (
                    <SecurityAuditLogScreen onBack={handleBack} />
                )}

                {currentScreen === 'network' && (
                    <NetworkControlScreen onBack={handleBack} />
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
                    <SettingsScreen />
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-7xl mx-auto">
                <div className="flex items-center justify-around h-16 px-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            currentScreen === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() =>
                                    setCurrentScreen(item.id)
                                }
                                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all relative ${
                                    isActive
                                        ? 'text-sky-400'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Icon className="w-5 h-5" />

                                <span className="text-[10px] font-bold tracking-wider mt-0.5">
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
