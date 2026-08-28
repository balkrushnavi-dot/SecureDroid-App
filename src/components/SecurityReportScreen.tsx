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
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
} from './ui/designSystem';
import { ProgressBar } from './ui/animations';
import { useSecureDroid } from '../hooks/useSecureDroid';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface SecurityReportScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

type TimeRange = 'week' | 'month' | 'all';

// Helper to get date range
function getDateRange(range: TimeRange): { start: number; end: number } {
    const now = Date.now();
    let start: number;
    switch (range) {
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
    return { start, end: now };
}

export const SecurityReportScreen: React.FC<SecurityReportScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, risks, score, hardeningFindings, loading, connected, reload } = useSecureDroid();
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventError, setEventError] = useState<string | null>(null);

    // Fetch security logs
    const loadSecurityEvents = async () => {
        if (!connected) return;
        setLoadingEvents(true);
        setEventError(null);
        try {
            const result = await SecureDroidNative.getSecurityLogs(100); // get last 100 events
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
        const { start, end } = getDateRange(timeRange);
        return securityEvents.filter(e => e.timestamp >= start && e.timestamp <= end);
    }, [securityEvents, timeRange]);

    // Compute metrics
    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
    const lowRiskCount = risks.filter(r => r.riskLevel === 'LOW').length;

    // Device security issues from hardening findings
    const deviceIssues = hardeningFindings.filter(f => f.level === 'WARNING' || f.level === 'CRITICAL').length;

    // Recent event counts
    const eventCounts = filteredEvents.reduce((acc, e) => {
        const cat = e.category || 'AUDIT';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Recommendations based on current state
    const recommendations = useMemo(() => {
        const recs: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];
        if (highRiskCount > 0) {
            recs.push({
                id: 'rec-high-risk',
                text: `Review ${highRiskCount} app${highRiskCount > 1 ? 's' : ''} with high-risk permissions`,
                priority: 'high',
            });
        }
        if (deviceIssues > 0) {
            recs.push({
                id: 'rec-device',
                text: `Address ${deviceIssues} device security issue${deviceIssues > 1 ? 's' : ''}`,
                priority: 'high',
            });
        }
        if (score < 50) {
            recs.push({
                id: 'rec-low-score',
                text: 'Improve overall device security score by checking screen lock, encryption, and security patches',
                priority: 'high',
            });
        }
        if (mediumRiskCount > 0) {
            recs.push({
                id: 'rec-medium',
                text: `Review ${mediumRiskCount} app${mediumRiskCount > 1 ? 's' : ''} with medium-risk permissions`,
                priority: 'medium',
            });
        }
        if (recs.length === 0) {
            recs.push({
                id: 'rec-clean',
                text: 'Your device is in good shape — continue monitoring regularly',
                priority: 'low',
            });
        }
        return recs;
    }, [highRiskCount, mediumRiskCount, deviceIssues, score]);

    // Calculate security score breakdown
    const scoreBreakdown = {
        deviceSecurity: score,
        appSecurity: 100 - (highRiskCount * 5 + mediumRiskCount * 2),
        privacyScore: 100 - (risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length * 8),
        networkProtection: 0, // not currently available, could be VPN status
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Security Report"
                subtitle="Comprehensive security summary"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Header Actions */}
                <div className="flex gap-2">
                    <SecureDroidButton variant="secondary" className="flex-1" icon={Download}>
                        Export PDF
                    </SecureDroidButton>
                    <SecureDroidButton variant="secondary" className="flex-1" icon={Share2}>
                        Share
                    </SecureDroidButton>
                </div>

                {/* Time Range */}
                <div className="flex gap-2">
                    {(['week', 'month', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                                timeRange === range
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:border-slate-600'
                            }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overall Score */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-8 border-slate-700/50 flex items-center justify-center">
                                <span className={`text-3xl font-bold ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {score}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-slate-400">Overall Security Status</div>
                            <div className="flex items-center gap-2 mt-1">
                                {score >= 70 ? (
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                ) : score >= 40 ? (
                                    <Shield className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <ShieldOff className="w-5 h-5 text-red-400" />
                                )}
                                <span className={`text-lg font-semibold ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Based on device security posture and app risks
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <SecureDroidSectionHeader title="Score Breakdown" />
                <div className="space-y-3">
                    {Object.entries(scoreBreakdown).map(([key, value]) => (
                        <div key={key} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-slate-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className={`text-sm font-bold ${value >= 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {value}%
                                </span>
                            </div>
                            <ProgressBar value={value} max={100} showLabel={false} />
                        </div>
                    ))}
                </div>

                {/* Key Metrics */}
                <SecureDroidSectionHeader title="Key Metrics" />
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-slate-100">{apps.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Apps</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className={`text-lg font-bold ${risks.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {risks.length}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risks Found</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-slate-100">{hardeningFindings.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Device Checks</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-slate-100">{filteredEvents.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Events ({timeRange})</div>
                    </div>
                </div>

                {/* Recent Activity */}
                <SecureDroidSectionHeader title="Recent Activity" />
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
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
                            {filteredEvents.slice(0, 10).map((event) => (
                                <div key={event.id} className="flex items-center justify-between text-sm border-b border-slate-800/50 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">
                                            {new Date(event.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className="text-slate-300">{event.description || event.category}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        event.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                        event.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {event.severity || 'INFO'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {eventError && (
                        <div className="text-xs text-red-400 mt-2">{eventError}</div>
                    )}
                </div>

                {/* Recommendations */}
                <SecureDroidSectionHeader title="Recommendations" />
                <div className="space-y-2">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    rec.priority === 'high' ? 'bg-red-500/10' :
                                    rec.priority === 'medium' ? 'bg-amber-500/10' :
                                    'bg-emerald-500/10'
                                }`}>
                                    {rec.priority === 'high' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                    {rec.priority === 'medium' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                                    {rec.priority === 'low' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-slate-200">{rec.text}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Export Options */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-4">
                        <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                        <div>
                            <div className="text-sm font-medium text-slate-200">Export Full Report</div>
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
                </div>

                <SecureDroidButton
                    onClick={reload}
                    disabled={loading}
                    className="w-full"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Report
                </SecureDroidButton>
            </div>
        </div>
    );
};

export default SecurityReportScreen;
