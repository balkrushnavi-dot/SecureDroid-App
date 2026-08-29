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
    Zap,
    CheckCircle2,
    XCircle,
    Clock,
    Database,
    Users,
    Bell,
    Moon,
    Globe,
    ShieldOff,
    Server,
    Smartphone,
    Search,
    Filter,
    ArrowUpDown,
    Package,
    BarChart,
    PieChart,
    Award,
    Target,
    Compass,
    MessageSquare,
    Bot,
    User,
    Sparkles,
    Gift,
    Star,
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
    SecureDroidStatusChip,
    SecureDroidButton,
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

// ============================================================
// LOADING SCREEN
// ============================================================
function LoadingScreen({ message }: { message?: string }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-sky-400/30 border-t-sky-400 animate-spin mx-auto" />
                <h1 className="text-2xl font-bold text-white">SecureDroid</h1>
                <p className="text-sm text-slate-400">{message || 'Loading security data...'}</p>
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
                <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                <h2 className="text-xl font-bold text-white">Connection Error</h2>
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

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
    const { apps, risks, loading, connected, error, score, reload, usingMock } = useSecureDroid();

    const safeApps = Array.isArray(apps) ? apps : [];
    const safeRisks = Array.isArray(risks) ? risks : [];

    const highRiskCount = safeRisks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = safeRisks.filter(r => r.riskLevel === 'MEDIUM').length;
    const totalRisks = safeRisks.length;
    const userApps = safeApps.filter(a => !a.isSystemApp).length;
    const systemApps = safeApps.length - userApps;

    const protectionStatus = (() => {
        if (!connected) return { label: 'Disconnected', color: 'text-rose-400', icon: XCircle };
        if (loading) return { label: 'Loading...', color: 'text-amber-400', icon: RefreshCw };
        if (highRiskCount > 0) return { label: 'At Risk', color: 'text-rose-400', icon: AlertTriangle };
        if (totalRisks > 0) return { label: 'Needs Attention', color: 'text-amber-400', icon: AlertTriangle };
        if (score >= 70) return { label: 'Protected', color: 'text-emerald-400', icon: ShieldCheck };
        return { label: 'Needs Review', color: 'text-amber-400', icon: Shield };
    })();

    const statusColor = protectionStatus.color.replace('text-', '');
    const ringColor = statusColor === 'emerald-400' ? 'emerald' : statusColor === 'amber-400' ? 'amber' : statusColor === 'rose-400' ? 'rose' : 'sky';

    const quickActions = [
        { id: 'scan', label: 'Scan Device', icon: Zap, color: 'bg-sky-500/10 text-sky-400' },
        { id: 'network', label: 'Network', icon: Wifi, color: 'bg-emerald-500/10 text-emerald-400' },
        { id: 'app_auditor', label: 'App Security', icon: ShieldCheck, color: 'bg-purple-500/10 text-purple-400' },
        { id: 'privacy_radar', label: 'Privacy', icon: Eye, color: 'bg-amber-500/10 text-amber-400' },
    ];

    const cards = [
        { id: 'app_auditor' as Screen, title: 'App Security Auditor', description: `${safeApps.length} apps analyzed`, icon: ShieldCheck, badge: totalRisks },
        { id: 'threat_model' as Screen, title: 'Threat Model Center', description: `${highRiskCount} high, ${mediumRiskCount} medium`, icon: AlertTriangle, badge: totalRisks },
        { id: 'device_security' as Screen, title: 'Device Security', description: 'Screen lock, encryption, patch', icon: Lock },
        { id: 'network' as Screen, title: 'Network Protection', description: 'VPN status & control', icon: Wifi },
        { id: 'privacy_radar' as Screen, title: 'Privacy Radar', description: 'Apps accessing your data', icon: Eye },
        { id: 'security_log' as Screen, title: 'Security Audit Log', description: 'View security timeline', icon: ScrollText },
    ];

    return (
        <div className="p-4 space-y-4 pb-24 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">SecureDroid</h1>
                    <p className="text-sm text-slate-400">Security for your phone</p>
                </div>
                <button
                    onClick={reload}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Mock warning */}
            {usingMock && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/50 text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Using demo data — native bridge unavailable. Real data appears once connected.</span>
                </div>
            )}

            {/* Connection Status */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${connected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-xs font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
                {loading && <span className="text-xs text-slate-500">Loading...</span>}
                {error && <span className="text-xs text-rose-400 ml-2">{error}</span>}
            </div>

            {/* Security Score Card */}
            <SecureDroidGlassCard className="p-6">
                <div className="flex items-center gap-6">
                    <SecureDroidProgressRing value={score} size={88} strokeWidth={7} color={ringColor}>
                        <span className="text-2xl font-bold text-zinc-100">{score}</span>
                    </SecureDroidProgressRing>
                    <div>
                        <div className="flex items-center gap-2">
                            <protectionStatus.icon className={`w-4 h-4 ${protectionStatus.color}`} />
                            <span className={`text-sm font-semibold ${protectionStatus.color}`}>
                                {protectionStatus.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">Defense Index</span>
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

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
                <SecureDroidStatCard label="Total" value={safeApps.length} icon={Database} color="slate" />
                <SecureDroidStatCard label="Risks" value={totalRisks} icon={AlertTriangle} color={totalRisks > 0 ? 'amber' : 'emerald'} />
                <SecureDroidStatCard label="User" value={userApps} icon={Users} color="emerald" />
                <SecureDroidStatCard label="System" value={systemApps} icon={Server} color="sky" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={() => {
                                if (action.id === 'scan') reload();
                                else onNavigate(action.id as Screen);
                            }}
                            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all text-center group"
                        >
                            <div className={`w-9 h-9 rounded-full ${action.color} flex items-center justify-center mx-auto mb-1.5 group-hover:scale-105 transition-transform`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{action.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Security Tools */}
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
                                            <span className="font-semibold text-zinc-100">{card.title}</span>
                                            {card.badge !== undefined && card.badge > 0 && (
                                                <SecureDroidBadge count={card.badge} />
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-400 truncate">{card.description}</div>
                                    </div>
                                    <Chevron
