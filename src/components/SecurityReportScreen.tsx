import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Download,
    Share2,
    Calendar,
    Clock,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Activity,
    RefreshCw,
    Info,
    Eye,
    Lock,
    Wifi,
    Smartphone,
    Users,
    Server,
    Database,
    Globe,
    Mail,
    Printer,
    FileSpreadsheet,
    BarChart,
    PieChart,
    Zap,
    Award,
    Target,
    Compass,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidListItem,
    SecureDroidBadge,
    SecureDroidProgressRing,
    SecureDroidSlider,
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface SecurityReportScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

type TimeRange = 'week' | 'month' | 'all';

export const SecurityReportScreen: React.FC<SecurityReportScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, risks, score, hardeningFindings, loading, connected, reload } = useSecureDroid();
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventError, setEventError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>('overview');

    // Fetch security logs
    const loadSecurityEvents = async () => {
        if (!connected) return;
        setLoadingEvents(true);
        setEventError(null);
        try {
            const result = await SecureDroidNative.getSecurityLogs(100);
            if (result.success && result.data) {
                setSecurityEvents(result.data);
            } else {
                setEventError(result.message || 'Could not load security logs');
            }
        } catch (err) {
            setEventError(err instanceof Error ? err.message : 'Error loading security logs');
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        loadSecurityEvents();
    }, [connected]);

    // Filter events by time range
    const filteredEvents = useMemo(() => {
        const now = Date.now();
        let start: number;
        switch (timeRange) {
            case 'week':
                start = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case 'month':
                start = now - 30 * 24 * 60 * 60 * 1000;
                break;
            case 'all':
            default:
                start = 0;
                break;
        }
        return securityEvents.filter(e => e.timestamp >= start && e.timestamp <= now);
    }, [securityEvents, timeRange]);

    // Compute metrics
    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
    const lowRiskCount = risks.filter(r => r.riskLevel === 'LOW').length;
    const totalRisks = risks.length;

    // Device security issues
    const deviceIssues = hardeningFindings.filter(f => f.level === 'WARNING' || f.level === 'CRITICAL').length;
    const totalChecks = hardeningFindings.length;

    // App risk breakdown
    const appRiskBreakdown = useMemo(() => {
        const total = apps.filter(a => !a.isSystemApp).length;
        const risky = totalRisks;
        const clean = total - risky;
        return { total, risky, clean };
    }, [apps, totalRisks]);

    // Event counts by category
    const eventCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredEvents.forEach(e => {
            const cat = e.category || 'AUDIT';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [filteredEvents]);

    // Score breakdown
    const scoreBreakdown = useMemo(() => {
        const appSecurity = Math.max(0, 100 - (highRiskCount * 5 + mediumRiskCount * 2));
        const privacy = Math.max(0, 100 - (highRiskCount * 8 + mediumRiskCount * 3));
        const networkProtection = 0; // future
        return {
            deviceSecurity: score,
            appSecurity,
            privacy,
            networkProtection,
        };
    }, [score, highRiskCount, mediumRiskCount]);

    // Recommendations
    const recommendations = useMemo(() => {
        const recs: { id: string; text: string; priority: 'high' | 'medium' | 'low'; action?: string }[] = [];

        if (highRiskCount > 0) {
            recs.push({
                id: 'rec-high-risk',
                text: `${highRiskCount} app${highRiskCount > 1 ? 's' : ''} with high-risk permissions require review`,
                priority: 'high',
                action: 'Review Apps',
            });
        }

        if (deviceIssues > 0) {
            recs.push({
                id: 'rec-device',
                text: `${deviceIssues} device security issue${deviceIssues > 1 ? 's' : ''} need attention`,
                priority: 'high',
                action: 'Check Device',
            });
        }

        if (score < 50) {
            recs.push({
                id: 'rec-score',
                text: 'Improve your overall security score by checking screen lock, encryption, and security patches',
                priority: 'high',
                action: 'View Details',
            });
        }

        if (mediumRiskCount > 0) {
            recs.push({
                id: 'rec-medium',
                text: `${mediumRiskCount} app${mediumRiskCount > 1 ? 's' : ''} with medium-risk permissions should be reviewed`,
                priority: 'medium',
                action: 'Review Apps',
            });
        }

        if (recs.length === 0) {
            recs.push({
                id: 'rec-clean',
                text: 'Your device is in excellent security condition — continue monitoring regularly',
                priority: 'low',
                action: 'Stay Secure',
            });
        }

        return recs;
    }, [highRiskCount, mediumRiskCount, deviceIssues, score]);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const getEventSeverityColor = (severity: string) => {
        switch (severity?.toUpperCase()) {
            case 'CRITICAL': return 'text-rose-400 bg-rose-500/10';
            case 'WARNING': return 'text-amber-400 bg-amber-500/10';
            case 'INFO': return 'text-emerald-400 bg-emerald-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getEventSeverityIcon = (severity: string) => {
        switch (severity?.toUpperCase()) {
            case 'CRITICAL': return XCircle;
            case 'WARNING': return AlertTriangle;
            case 'INFO': return CheckCircle2;
            default: return Info;
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Security Report"
                subtitle="Comprehensive security summary"
                onBack={onBack}
                isLight={isLight}
                rightAction={
                    <button
                        onClick={() => {
                            reload();
                            loadSecurityEvents();
                        }}
                        disabled={loading || loadingEvents}
                        className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading || loadingEvents ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                {/* Export Actions */}
                <div className="flex gap-2">
                    <SecureDroidButton variant="secondary" className="flex-1" icon={Download}>
                        Export PDF
                    </SecureDroidButton>
                    <SecureDroidButton variant="secondary" className="flex-1" icon={Share2}>
                        Share
                    </SecureDroidButton>
                </div>

                {/* Time Range */}
                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    {(['week', 'month', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                timeRange === range
                                    ? 'bg-slate-800 text-zinc-100'
                                    : 'text-slate-400 hover:text-zinc-200'
                            }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overall Score */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-6">
                        <SecureDroidProgressRing value={score} size={80} strokeWidth={6} isLight={false}>
                            <span className="text-2xl font-bold text-zinc-100">{score}</span>
                        </SecureDroidProgressRing>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                {score >= 70 ? (
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                ) : score >= 40 ? (
                                    <Shield className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                                )}
                                <span className={`text-lg font-semibold ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                    {score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Overall Security Score • Based on device posture and app risks
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    {totalChecks - deviceIssues} checks passed
                                </span>
                                <span className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    {deviceIssues} issues
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <SecureDroidSectionHeader title="Score Breakdown" isLight={isLight} />
                <div className="space-y-2.5">
                    {Object.entries(scoreBreakdown).map(([key, value]) => (
                        <SecureDroidCard key={key} className="p-3" isLight={isLight}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className={`text-xs font-bold ${value >= 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                    {value}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                        </SecureDroidCard>
                    ))}
                </div>

                {/* Key Metrics */}
                <SecureDroidSectionHeader title="Key Metrics" isLight={isLight} />
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-zinc-100">{appRiskBreakdown.total}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">User Apps</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className={`text-lg font-bold ${totalRisks > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {totalRisks}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risks</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-zinc-100">{totalChecks}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Device Checks</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-zinc-100">{filteredEvents.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Events ({timeRange})</div>
                    </div>
                </div>

                {/* Recent Activity */}
                <SecureDroidSectionHeader title="Recent Activity" isLight={isLight} />
                <SecureDroidCard className="p-4" isLight={isLight}>
                    {loadingEvents ? (
                        <div className="flex items-center justify-center py-4">
                            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
                            <span className="ml-2 text-sm text-slate-400">Loading events...</span>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-4 text-sm text-slate-400">
                            No security events found for this period.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredEvents.slice(0, 8).map((event) => {
                                const SeverityIcon = getEventSeverityIcon(event.severity);
                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between text-sm border-b border-slate-800/50 pb-2.5 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <SeverityIcon className={`w-3.5 h-3.5 ${getEventSeverityColor(event.severity)}`} />
                                            <div className="min-w-0">
                                                <p className="text-slate-200 truncate text-xs">
                                                    {event.description || event.category}
                                                </p>
                                                <p className="text-[10px] text-slate-500">{formatDate(event.timestamp)}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getEventSeverityColor(event.severity)}`}>
                                            {event.severity || 'INFO'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {eventError && (
                        <div className="text-xs text-rose-400 mt-2">{eventError}</div>
                    )}
                </SecureDroidCard>

                {/* Recommendations */}
                <SecureDroidSectionHeader title="Recommendations" isLight={isLight} />
                <div className="space-y-2.5">
                    {recommendations.map((rec) => (
                        <SecureDroidCard
                            key={rec.id}
                            className={`p-3.5 ${rec.priority === 'high' ? 'border-rose-800/30' : rec.priority === 'medium' ? 'border-amber-800/30' : ''}`}
                            isLight={isLight}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                    rec.priority === 'high'
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : rec.priority === 'medium'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {rec.priority === 'high' && <AlertTriangle className="w-4 h-4" />}
                                    {rec.priority === 'medium' && <AlertTriangle className="w-4 h-4" />}
                                    {rec.priority === 'low' && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-zinc-200">{rec.text}</p>
                                    {rec.action && (
                                        <p className="text-xs text-sky-400 mt-0.5">{rec.action}</p>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </div>
                        </SecureDroidCard>
                    ))}
                </div>

                {/* Export Options */}
                <SecureDroidCard className="p-4" isLight={isLight}>
                    <div className="flex items-center gap-4">
                        <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                        <div>
                            <div className="text-sm font-medium text-zinc-200">Export Full Report</div>
                            <div className="text-xs text-slate-400">PDF • CSV • JSON</div>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                                <FileText className="w-4 h-4 text-slate-400" />
                            </button>
                            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                                <Download className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </SecureDroidCard>

                <div className="text-center text-[10px] text-slate-500 pt-2">
                    Report generated from live device data • v1.0.0
                </div>
            </div>
        </div>
    );
};

export default SecurityReportScreen;
