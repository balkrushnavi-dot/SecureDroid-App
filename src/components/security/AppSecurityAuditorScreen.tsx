import React, { useState, useMemo } from 'react';
import {
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronDown,
    Search,
    Filter,
    RefreshCw,
    Package,
    Clock,
    Database,
    Users,
    Server,
    Smartphone,
    Wifi,
    Globe,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Activity,
    Zap,
    Info,
    ArrowUpDown,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidSearchBar,
    SecureDroidBadge,
    SecureDroidStatCard,
    SecureDroidGlassCard,
} from '../ui/designSystem';
import { useSecureDroid } from '../../hooks/useSecureDroid';
import type { AppInfo, RiskInfo } from '../../hooks/useSecureDroid';

interface AppSecurityAuditorScreenProps {
    onBack: () => void;
    onAppSelect: (packageName: string) => void;
    isLight?: boolean;
}

type SortOption = 'risk' | 'name' | 'install' | 'size';

export const AppSecurityAuditorScreen: React.FC<AppSecurityAuditorScreenProps> = ({
    onBack,
    onAppSelect,
    isLight = false,
}) => {
    const { apps, risks, loading, connected, reload } = useSecureDroid();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('risk');
    const [expandedApp, setExpandedApp] = useState<string | null>(null);

    const userApps = useMemo(() => apps.filter(app => !app.isSystemApp), [apps]);

    const appRiskMap = useMemo(() => {
        const map = new Map<string, RiskInfo>();
        risks.forEach(risk => map.set(risk.packageName, risk));
        return map;
    }, [risks]);

    const filteredApps = useMemo(() => {
        let result = userApps;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(app =>
                app.appName.toLowerCase().includes(q) ||
                app.packageName.toLowerCase().includes(q)
            );
        }

        result = [...result].sort((a, b) => {
            const riskA = appRiskMap.get(a.packageName)?.riskLevel || 'LOW';
            const riskB = appRiskMap.get(b.packageName)?.riskLevel || 'LOW';
            const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

            switch (sortBy) {
                case 'risk':
                    return (riskOrder[riskA as keyof typeof riskOrder] || 4) - (riskOrder[riskB as keyof typeof riskOrder] || 4);
                case 'name':
                    return a.appName.localeCompare(b.appName);
                case 'install':
                    return b.firstInstallTime - a.firstInstallTime;
                default:
                    return 0;
            }
        });

        return result;
    }, [userApps, searchQuery, sortBy, appRiskMap]);

    const stats = {
        total: userApps.length,
        high: risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length,
        medium: risks.filter(r => r.riskLevel === 'MEDIUM').length,
        low: risks.filter(r => r.riskLevel === 'LOW').length,
    };

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'risk', label: 'Risk Level' },
        { value: 'name', label: 'Name' },
        { value: 'install', label: 'Recently Installed' },
    ];

    const getRiskColor = (level?: string) => {
        if (!level) return 'text-slate-400 bg-slate-500/10';
        switch (level.toUpperCase()) {
            case 'CRITICAL':
            case 'HIGH':
                return 'text-rose-400 bg-rose-500/10';
            case 'MEDIUM':
                return 'text-amber-400 bg-amber-500/10';
            case 'LOW':
                return 'text-emerald-400 bg-emerald-500/10';
            default:
                return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getRiskLabel = (level?: string) => {
        if (!level) return 'Unknown';
        switch (level.toUpperCase()) {
            case 'CRITICAL':
            case 'HIGH':
                return 'High';
            case 'MEDIUM':
                return 'Medium';
            case 'LOW':
                return 'Low';
            default:
                return 'Unknown';
        }
    };

    const toggleExpanded = (packageName: string) => {
        setExpandedApp(expandedApp === packageName ? null : packageName);
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="App Security Auditor"
                subtitle="Review installed applications"
                onBack={onBack}
                isLight={isLight}
                rightAction={
                    <button
                        onClick={reload}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <SecureDroidStatCard label="Total" value={stats.total} icon={Package} color="slate" />
                    <SecureDroidStatCard label="High" value={stats.high} icon={AlertTriangle} color={stats.high > 0 ? 'rose' : 'emerald'} />
                    <SecureDroidStatCard label="Medium" value={stats.medium} icon={AlertTriangle} color={stats.medium > 0 ? 'amber' : 'emerald'} />
                    <SecureDroidStatCard label="Low" value={stats.low} icon={CheckCircle2} color="emerald" />
                </div>

                {/* Search & Sort */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                        <SecureDroidSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search installed apps by name..."
                            isLight={isLight}
                            onClear={() => setSearchQuery('')}
                        />
                    </div>
                    <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSortBy(option.value)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                    sortBy === option.value
                                        ? 'bg-slate-800 text-zinc-100'
                                        : 'text-slate-400 hover:text-zinc-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* App List */}
                <div className="space-y-2.5">
                    {filteredApps.length === 0 ? (
                        <div className="p-8 text-center">
                            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No apps found</p>
                            {searchQuery && (
                                <p className="text-sm text-slate-500">Try adjusting your search</p>
                            )}
                        </div>
                    ) : (
                        filteredApps.map((app) => {
                            const risk = appRiskMap.get(app.packageName);
                            const riskLevel = risk?.riskLevel || 'LOW';
                            const isExpanded = expandedApp === app.packageName;
                            const findings = risk?.findings || [];

                            return (
                                <SecureDroidCard
                                    key={app.packageName}
                                    className="p-0 overflow-hidden"
                                    isLight={isLight}
                                >
                                    <div
                                        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                                        onClick={() => {
                                            if (findings.length > 0) {
                                                toggleExpanded(app.packageName);
                                            } else {
                                                onAppSelect(app.packageName);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0">
                                                <Smartphone className="w-5 h-5 text-slate-400" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-100 text-sm truncate">
                                                        {app.appName}
                                                    </span>
                                                    {app.isSystemApp && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                                            System
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-mono truncate">
                                                    {app.packageName}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${getRiskColor(riskLevel)}`}>
                                                    {getRiskLabel(riskLevel)}
                                                </span>
                                                {findings.length > 0 ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleExpanded(app.packageName);
                                                        }}
                                                        className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && findings.length > 0 && (
                                        <div className="px-4 pb-4 pt-2 border-t border-slate-800/50 space-y-1.5">
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                                                Risk Findings
                                            </p>
                                            {findings.map((finding, index) => (
                                                <div
                                                    key={index}
                                                    className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-zinc-200 font-medium">
                                                                {finding.title || finding.code}
                                                            </p>
                                                            {finding.description && (
                                                                <p className="text-slate-400 mt-0.5">
                                                                    {finding.description}
                                                                </p>
                                                            )}
                                                            {finding.severity && (
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-1 inline-block ${getRiskColor(finding.severity)}`}>
                                                                    {finding.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <SecureDroidButton
                                                variant="secondary"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => onAppSelect(app.packageName)}
                                            >
                                                View Full Details
                                            </SecureDroidButton>
                                        </div>
                                    )}
                                </SecureDroidCard>
                            );
                        })
                    )}
                </div>

                {loading && (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
                        <p className="text-slate-400">Loading applications...</p>
                    </div>
                )}

                <div className="text-center text-[10px] text-slate-500 pt-2">
                    {filteredApps.length} of {userApps.length} user apps shown
                </div>
            </div>
        </div>
    );
};

export default AppSecurityAuditorScreen;
