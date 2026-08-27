import React, { useState } from 'react';
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
    BarChart,
    PieChart,
    Zap,
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
    FileSpreadsheet
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton
} from './ui/designSystem';
import { ProgressBar, ScoreRing } from './ui/animations';

interface SecurityReportScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface ReportMetric {
    id: string;
    label: string;
    value: number;
    max: number;
    color: string;
    trend: 'up' | 'down' | 'stable';
}

export const SecurityReportScreen: React.FC<SecurityReportScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

    const metrics: ReportMetric[] = [
        { id: 'device', label: 'Device Security', value: 92, max: 100, color: 'text-emerald-400', trend: 'up' },
        { id: 'apps', label: 'App Security', value: 78, max: 100, color: 'text-amber-400', trend: 'stable' },
        { id: 'privacy', label: 'Privacy Score', value: 65, max: 100, color: 'text-amber-400', trend: 'down' },
        { id: 'network', label: 'Network Protection', value: 85, max: 100, color: 'text-emerald-400', trend: 'up' },
    ];

    const recentEvents = [
        { id: 1, time: '2 hours ago', event: 'VPN connected', status: 'secure' },
        { id: 2, time: '4 hours ago', event: 'App scan completed', status: 'secure' },
        { id: 3, time: '1 day ago', event: 'High-risk app detected: Unknown Installer', status: 'warning' },
        { id: 4, time: '2 days ago', event: 'Security patch updated', status: 'secure' },
        { id: 5, time: '3 days ago', event: 'Privacy scan found tracking SDKs', status: 'warning' },
    ];

    const recommendations = [
        { id: 1, text: 'Review app permissions for high-risk apps', priority: 'high' },
        { id: 2, text: 'Update 3 apps with legacy target SDK', priority: 'medium' },
        { id: 3, text: 'Enable USB debugging protection', priority: 'low' },
    ];

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Security Report"
                subtitle="Weekly security summary"
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
                            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeRange === range
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
                            <ScoreRing value={79} size={100} strokeWidth={8} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-100">79</div>
                                    <div className="text-[10px] text-slate-500 uppercase">Overall</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-slate-400">Security Status</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="w-5 h-5 text-amber-400" />
                                <span className="text-lg font-semibold text-amber-400">Good</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-2">
                                {metrics.filter(m => m.value < 70).length} areas need attention
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <SecureDroidSectionHeader title="Security Metrics" />

                <div className="space-y-3">
                    {metrics.map((metric) => (
                        <div key={metric.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-200">{metric.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${metric.color}`}>{metric.value}%</span>
                                    {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                    {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                                    {metric.trend === 'stable' && <Activity className="w-4 h-4 text-amber-400" />}
                                </div>
                            </div>
                            <ProgressBar value={metric.value} max={metric.max} showLabel={false} />
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <SecureDroidSectionHeader title="Recent Activity" />

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="space-y-3">
                        {recentEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${event.status === 'secure' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <div className="flex-1">
                                    <div className="text-sm text-slate-200">{event.event}</div>
                                    <div className="text-xs text-slate-400">{event.time}</div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${event.status === 'secure'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                    {event.status === 'secure' ? 'Secure' : 'Warning'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <SecureDroidSectionHeader title="Recommendations" />

                <div className="space-y-2">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${rec.priority === 'high' ? 'bg-red-500/10' :
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
                                <ChevronRight className="w-4 h-4 text-slate-600" />
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

                <SecureDroidButton onClick={onBack} variant="secondary" className="w-full">
                    Back to Dashboard
                </SecureDroidButton>
            </div>
        </div>
    );
};

export default SecurityReportScreen;
