import React, { useState, useCallback } from 'react';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    Info,
    Zap,
    Activity,
    Clock,
    Server,
    Database,
    Package,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Users,
    Smartphone,
    Wifi,
    Globe,
    FileText,
    Search,
    Filter,
    ArrowUpDown,
    BarChart,
    PieChart,
    Target,
    Compass,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidBadge,
    SecureDroidProgressRing,
    SecureDroidSearchBar,
    SecureDroidStatCard,
    SecureDroidGlassCard,
} from '../ui/designSystem';
import { THREAT_MODEL_SCENARIOS } from '../../data/threatModelReference';
import { useSecureDroid } from '../../hooks/useSecureDroid';

interface ThreatModelCenterScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

const TRUSTED_INSTALLERS = new Set([
    'com.android.vending',
    'com.google.android.packageinstaller',
    'com.android.packageinstaller',
    'com.amazon.venezia',
    'com.sec.android.app.samsungapps',
    'com.xiaomi.mipicks',
    'com.xiaomi.market',
    'com.huawei.appmarket',
]);

export const ThreatModelCenterScreen: React.FC<ThreatModelCenterScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, risks, loading, connected, error, reload } = useSecureDroid();
    const [selectedThreat, setSelectedThreat] = useState<any>(null);
    const [scanTimestamp, setScanTimestamp] = useState<number>(Date.now());
    const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

    const userApps = apps.filter(app => !app.isSystemApp);
    const totalApps = apps.length;
    const userAppsCount = userApps.length;

    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
    const lowRiskCount = risks.filter(r => r.riskLevel === 'LOW').length;
    const totalRisks = risks.length;

    const debuggableCount = userApps.filter(app => app.isDebuggable).length;
    const sideloadedCount = userApps.filter(app => !app.installerPackage || !TRUSTED_INSTALLERS.has(app.installerPackage)).length;
    const legacySdkCount = userApps.filter(app => app.targetSdk && app.targetSdk < 31).length;

    let overallRisk: 'SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK' = 'SAFE';
    if (risks.some(r => r.riskLevel === 'CRITICAL')) overallRisk = 'CRITICAL_RISK';
    else if (risks.some(r => r.riskLevel === 'HIGH')) overallRisk = 'HIGH_RISK';
    else if (risks.some(r => r.riskLevel === 'MEDIUM')) overallRisk = 'MODERATE_RISK';
    else if (risks.some(r => r.riskLevel === 'LOW')) overallRisk = 'LOW_RISK';

    const allFindings = risks.map(risk => ({
        id: `finding_${risk.packageName}`,
        title: risk.findings && risk.findings.length > 0 ? risk.findings[0].title || `${risk.riskLevel} risk` : `${risk.riskLevel} risk detected`,
        description: risk.findings && risk.findings.length > 0 ? risk.findings[0].description || '' : `Security risk identified in ${risk.appName}.`,
        severity: risk.riskLevel as 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL',
        affectedPackage: risk.packageName,
        appName: risk.appName,
        recommendation: risk.findings && risk.findings.length > 0 ? risk.findings[0].description || 'Review the application.' : 'Review the application and its permissions.',
        evidence: risk.findings || [],
    }));

    const filteredFindings = allFindings.filter(finding => {
        const matchesSearch = searchQuery.trim() === '' ||
            finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            finding.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (finding.affectedPackage && finding.affectedPackage.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSeverity = severityFilter === 'ALL' || finding.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    const riskClass = overallRisk === 'SAFE' ? 'bg-emerald-500/15 text-emerald-400' : overallRisk === 'CRITICAL_RISK' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300';
    const threatScore = Math.max(0, 100 - (highRiskCount * 8 + mediumRiskCount * 3 + lowRiskCount));

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-rose-400 bg-rose-500/10';
            case 'HIGH': return 'text-rose-400 bg-rose-500/10';
            case 'MEDIUM': return 'text-amber-400 bg-amber-500/10';
            case 'LOW': return 'text-emerald-400 bg-emerald-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return XCircle;
            case 'HIGH': return ShieldAlert;
            case 'MEDIUM': return AlertTriangle;
            case 'LOW': return ShieldCheck;
            default: return Shield;
        }
    };

    const toggleExpanded = (id: string) => setExpandedFinding(expandedFinding === id ? null : id);

    const handleScan = useCallback(() => {
        reload();
        setScanTimestamp(Date.now());
    }, [reload]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PROTECTED': return { variant: 'SECURE' as const, label: 'PROTECTED' };
            case 'PARTIALLY PROTECTED': return { variant: 'ISOLATED' as const, label: 'PARTIAL' };
            case 'REQUIRES HARDWARE': return { variant: 'UNAVAILABLE' as const, label: 'REQUIRES HARDWARE' };
            case 'REQUIRES SECUREDROID OS': return { variant: 'DEGRADED' as const, label: 'REQUIRES OS' };
            case 'NOT PROTECTED': return { variant: 'UNAVAILABLE' as const, label: 'NOT PROTECTED' };
            default: return { variant: 'UNAVAILABLE' as const, label: 'UNKNOWN' };
        }
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Threat Model Center"
                subtitle="Live package evidence & threat model reference"
                onBack={onBack}
                isLight={isLight}
                rightAction={
                    <button
                        onClick={handleScan}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Scanning...' : 'Scan Now'}
                    </button>
                }
            />

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                <SecureDroidGlassCard className="p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
                                <ShieldAlert className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-zinc-100">Live Installed-App Threat Assessment</h3>
                                <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>Evidence from Android PackageManager evaluated locally</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-950/20 border border-rose-800/30">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-rose-300">Scan unavailable</p>
                                    <p className="text-[11px] text-rose-200/70 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="pt-3 border-t border-slate-800/50 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <SecureDroidStatCard label="Scanned" value={totalApps} icon={Database} color="slate" />
                                <SecureDroidStatCard label="Overall" value={overallRisk} icon={Shield} color={overallRisk === 'SAFE' ? 'emerald' : overallRisk === 'CRITICAL_RISK' ? 'rose' : 'amber'} />
                                <SecureDroidStatCard label="User Apps" value={userAppsCount} icon={Smartphone} color="slate" />
                                <SecureDroidStatCard label="Threat Score" value={threatScore} icon={Target} color={threatScore >= 70 ? 'emerald' : threatScore >= 40 ? 'amber' : 'rose'} />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <SecureDroidStatCard label="Debuggable" value={debuggableCount} icon={Code} color={debuggableCount > 0 ? 'amber' : 'emerald'} />
                                <SecureDroidStatCard label="Sideloaded" value={sideloadedCount} icon={Package} color={sideloadedCount > 0 ? 'amber' : 'emerald'} />
                                <SecureDroidStatCard label="Broad Perms" value={highRiskCount + mediumRiskCount} icon={AlertTriangle} color={highRiskCount + mediumRiskCount > 0 ? 'amber' : 'emerald'} />
                                <SecureDroidStatCard label="Legacy SDK" value={legacySdkCount} icon={Clock} color={legacySdkCount > 0 ? 'amber' : 'emerald'} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <div className="flex-1">
                                    <SecureDroidSearchBar
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        placeholder="Search findings..."
                                        isLight={isLight}
                                        onClear={() => setSearchQuery('')}
                                    />
                                </div>
                                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setSeverityFilter(level as any)}
                                            className={`px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all ${severityFilter === level ? 'bg-slate-800 text-zinc-100' : 'text-slate-400 hover:text-zinc-200'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                {filteredFindings.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">No findings match your criteria</p>
                                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter</p>
                                    </div>
                                ) : (
                                    filteredFindings.map((finding) => {
                                        const SeverityIcon = getSeverityIcon(finding.severity);
                                        const isExpanded = expandedFinding === finding.id;

                                        return (
                                            <SecureDroidCard key={finding.id} className="p-0 overflow-hidden" isLight={isLight}>
                                                <div className="p-3.5 cursor-pointer hover:bg-slate-800/30 transition-colors" onClick={() => toggleExpanded(finding.id)}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getSeverityColor(finding.severity)} shrink-0`}>
                                                            <SeverityIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-medium text-zinc-100 truncate">{finding.title}</span>
                                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${getSeverityColor(finding.severity)}`}>{finding.severity}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 truncate">{finding.appName}{finding.affectedPackage && ` • ${finding.affectedPackage}`}</p>
                                                        </div>
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/50 space-y-2">
                                                        <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>
                                                        {finding.evidence && finding.evidence.length > 0 && (
                                                            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                                                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Evidence</p>
                                                                {finding.evidence.map((ev: any, idx: number) => (
                                                                    <div key={idx} className="text-xs text-slate-400 py-0.5 border-b border-slate-800/30 last:border-0">
                                                                        {ev.summary || ev.title || ev.description || '—'}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-emerald-400/80 flex items-start gap-2">
                                                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                            {finding.recommendation}
                                                        </p>
                                                    </div>
                                                )}
                                            </SecureDroidCard>
                                        );
                                    })
                                )}
                            </div>

                            <p className="text-[10px] text-slate-500 font-mono text-right">Scan timestamp: {new Date(scanTimestamp).toLocaleString()}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="pt-4 text-center">
                            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-slate-400">Analyzing installed packages...</p>
                        </div>
                    )}
                </SecureDroidGlassCard>

                <SecureDroidSectionHeader title="Threat Model Reference" isLight={isLight} />

                <div className={`p-3 rounded-xl border text-xs ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                    These scenarios describe SecureDroid's intended security controls. Their status is architectural/reference data and must not be interpreted as proof that the current device possesses the required hardware or OS enforcement.
                </div>

                <div className="space-y-3">
                    {THREAT_MODEL_SCENARIOS.map((threat) => {
                        const badge = getStatusBadge(threat.status);
                        return (
                            <SecureDroidCard key={threat.id} isLight={isLight} className="p-4 cursor-pointer hover:border-slate-600 transition-all" onClick={() => setSelectedThreat(threat)}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-medium text-sm text-zinc-100">{threat.title}</h4>
                                            <SecureDroidStatusChip status={badge.variant} label={badge.label} isLight={isLight} />
                                        </div>
                                        <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-slate-400'}`}>{threat.scenario}</p>
                                        <p className={`text-xs mt-2 font-medium ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{threat.why}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {threat.mitigatingControls.map((control, index) => (
                                        <span key={`${threat.id}-control-${index}`} className={`text-[9px] font-mono px-2 py-0.5 rounded ${isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-slate-900/50 text-slate-300'}`}>
                                            {control}
                                        </span>
                                    ))}
                                </div>
                            </SecureDroidCard>
                        );
                    })}
                </div>
            </div>

            {selectedThreat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className={`max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl border ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-slate-900 border-slate-800 text-zinc-100'}`}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
                            <h3 className="font-semibold text-base">{selectedThreat.title}</h3>
                            <button onClick={() => setSelectedThreat(null)} className={`text-xs px-3 py-1.5 rounded-lg ${isLight ? 'bg-zinc-100 hover:bg-zinc-200' : 'bg-slate-800 hover:bg-slate-700'}`}>Close</button>
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                            <div>
                                <span className="font-semibold text-slate-400 block mb-0.5 text-xs uppercase tracking-wider">Adversary Attack Scenario</span>
                                <p className="p-2.5 rounded-lg bg-slate-800/30 text-slate-200 leading-relaxed">{selectedThreat.scenario}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-400 block mb-0.5 text-xs uppercase tracking-wider">Defense & Rationale</span>
                                <p className="p-2.5 rounded-lg bg-slate-800/30 text-slate-200 leading-relaxed">{selectedThreat.why}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-400 block mb-0.5 text-xs uppercase tracking-wider">Technical Evidence</span>
                                <p className="p-2.5 rounded-lg bg-slate-800/30 text-slate-300 font-mono text-xs">{selectedThreat.evidence}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-400 block mb-0.5 text-xs uppercase tracking-wider">Threat Limitation</span>
                                <p className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs">{selectedThreat.limitation}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-slate-400 block mb-0.5 text-xs uppercase tracking-wider">Enforcement Requirement</span>
                                <p className="p-2.5 rounded-lg bg-slate-800/30 text-slate-300 font-mono text-xs">{selectedThreat.requirement}</p>
                            </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-800/50 flex justify-end">
                            <SecureDroidButton variant="primary" onClick={() => setSelectedThreat(null)} isLight={isLight}>Done</SecureDroidButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreatModelCenterScreen;
