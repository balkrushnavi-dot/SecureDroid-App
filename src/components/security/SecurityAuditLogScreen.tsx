import React, { useState, useEffect, useMemo } from 'react';
import {
    ScrollText,
    RefreshCw,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
    Activity,
    Wifi,
    Lock,
    Unlock,
    Smartphone,
    Package,
    Database,
    Server,
    Globe,
    Users,
    User,
    Calendar,
    ChevronDown,
    ChevronRight,
    Filter,
    Search,
    Eye,
    EyeOff,
    Zap,
    Bell,
    FileText,
    Settings,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidSearchBar,
    SecureDroidBadge,
    SecureDroidListItem,
    SecureDroidProgressRing,
} from '../ui/designSystem';
import { SecureDroidNative } from '../../services/native/SecureDroidNative';
import { useSecureDroid } from '../../hooks/useSecureDroid';

interface SecurityAuditLogScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

type TimeRange = 'today' | '7days' | '30days' | 'all';
type EventCategory = 'ALL' | 'SECURITY' | 'PRIVACY' | 'APPLICATIONS' | 'NETWORK' | 'PERMISSION' | 'AUTH' | 'CONFIG';

interface SecurityEvent {
    id: string;
    timestamp: number;
    category: string;
    severity: string;
    description: string;
    source: string;
    metadata?: Record<string, any>;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    SECURITY: Shield,
    PRIVACY: Eye,
    APPLICATIONS: Package,
    NETWORK: Wifi,
    PERMISSION: Lock,
    AUTH: User,
    CONFIG: Settings,
    AUDIT: FileText,
};

const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: 'text-rose-400 bg-rose-500/10',
    WARNING: 'text-amber-400 bg-amber-500/10',
    INFO: 'text-emerald-400 bg-emerald-500/10',
};

const SEVERITY_ICONS: Record<string, React.ElementType> = {
    CRITICAL: XCircle,
    WARNING: AlertTriangle,
    INFO: CheckCircle2,
};

export const SecurityAuditLogScreen: React.FC<SecurityAuditLogScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { connected, loading, reload } = useSecureDroid();
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventError, setEventError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('today');
    const [categoryFilter, setCategoryFilter] = useState<EventCategory>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    const loadEvents = async () => {
        if (!connected) return;
        setLoadingEvents(true);
        setEventError(null);
        try {
            const result = await SecureDroidNative.getSecurityLogs(500);
            if (result.success && result.data) {
                setEvents(result.data);
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
        loadEvents();
    }, [connected]);

    const getDateRange = (range: TimeRange): { start: number; end: number } => {
        const now = Date.now();
        let start: number;
        switch (range) {
            case 'today':
                start = new Date().setHours(0, 0, 0, 0);
                break;
            case '7days':
                start = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case '30days':
                start = now - 30 * 24 * 60 * 60 * 1000;
                break;
            case 'all':
            default:
                start = 0;
                break;
        }
        return { start, end: now };
    };

    const filteredEvents = useMemo(() => {
        const { start, end } = getDateRange(timeRange);
        let result = events.filter(e => e.timestamp >= start && e.timestamp <= end);

        if (categoryFilter !== 'ALL') {
            result = result.filter(e => e.category === categoryFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.description.toLowerCase().includes(q) ||
                e.category.toLowerCase().includes(q) ||
                e.source.toLowerCase().includes(q)
            );
        }

        return result.sort((a, b) => b.timestamp - a.timestamp);
    }, [events, timeRange, categoryFilter, searchQuery]);

    const groupEventsByDate = (events: SecurityEvent[]) => {
        const groups: Record<string, SecurityEvent[]> = {};
        events.forEach(event => {
            const date = new Date(event.timestamp);
            const key = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[key]) groups[key] = [];
            groups[key].push(event);
        });
        return groups;
    };

    const groupedEvents = groupEventsByDate(filteredEvents);

    const toggleExpanded = (id: string) => {
        setExpandedEvent(expandedEvent === id ? null : id);
    };

    const getCategoryIcon = (category: string) => {
        const Icon = CATEGORY_ICONS[category] || Info;
        return Icon;
    };

    const getSeverityColor = (severity: string) => {
        return SEVERITY_COLORS[severity] || 'text-slate-400 bg-slate-500/10';
    };

    const getSeverityIcon = (severity: string) => {
        const Icon = SEVERITY_ICONS[severity] || Info;
        return Icon;
    };

    const getSeverityLabel = (severity: string) => {
        return severity.charAt(0) + severity.slice(1).toLowerCase();
    };

    const getCategoryLabel = (category: string) => {
        return category.charAt(0) + category.slice(1).toLowerCase();
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    const eventCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        const categories = ['ALL', 'SECURITY', 'PRIVACY', 'APPLICATIONS', 'NETWORK', 'PERMISSION', 'AUTH', 'CONFIG'];
        categories.forEach(cat => {
            if (cat === 'ALL') {
                counts[cat] = filteredEvents.length;
            } else {
                counts[cat] = filteredEvents.filter(e => e.category === cat).length;
            }
        });
        return counts;
    }, [filteredEvents]);

    const categoryOptions: EventCategory[] = ['ALL', 'SECURITY', 'PRIVACY', 'APPLICATIONS', 'NETWORK', 'PERMISSION', 'AUTH', 'CONFIG'];

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Security Audit Log"
                subtitle="Cryptographic event stream & integrity timeline"
                onBack={onBack}
                isLight={isLight}
                rightAction={
                    <button
                        onClick={loadEvents}
                        disabled={loadingEvents}
                        className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loadingEvents ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-zinc-100">{filteredEvents.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Events</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-rose-400">
                            {filteredEvents.filter(e => e.severity === 'CRITICAL').length}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Critical</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-amber-400">
                            {filteredEvents.filter(e => e.severity === 'WARNING').length}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Warnings</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-emerald-400">
                            {filteredEvents.filter(e => e.severity === 'INFO').length}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Info</div>
                    </div>
                </div>

                {/* Time Range */}
                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    {['today', '7days', '30days', 'all'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as TimeRange)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                timeRange === range
                                    ? 'bg-slate-800 text-zinc-100'
                                    : 'text-slate-400 hover:text-zinc-200'
                            }`}
                        >
                            {range === 'today' ? 'Today' : range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : 'All'}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                    {categoryOptions.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                                categoryFilter === cat
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:border-slate-600'
                            }`}
                        >
                            {cat === 'ALL' ? 'All' : getCategoryLabel(cat)}
                            <span className="ml-1 text-[8px] opacity-60">
                                ({eventCounts[cat] || 0})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <SecureDroidSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search events..."
                    isLight={isLight}
                    onClear={() => setSearchQuery('')}
                />

                {/* Event List */}
                {loadingEvents ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
                        <p className="text-slate-400">Loading security events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="p-12 text-center">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg font-medium">No security events</p>
                        <p className="text-sm text-slate-500 mt-1">Your device has been quiet. Events will appear here when they occur.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                            <div key={date}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{date}</span>
                                    <div className="flex-1 border-t border-slate-800/50" />
                                    <span className="text-[10px] text-slate-500">{dateEvents.length} events</span>
                                </div>

                                <div className="space-y-2">
                                    {dateEvents.map((event) => {
                                        const CategoryIcon = getCategoryIcon(event.category);
                                        const SeverityIcon = getSeverityIcon(event.severity);
                                        const isExpanded = expandedEvent === event.id;

                                        return (
                                            <SecureDroidCard
                                                key={event.id}
                                                className="p-0 overflow-hidden"
                                                isLight={isLight}
                                            >
                                                <div
                                                    className="p-3.5 cursor-pointer hover:bg-slate-800/30 transition-colors"
                                                    onClick={() => toggleExpanded(event.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0">
                                                            <CategoryIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-medium text-zinc-100 truncate">
                                                                    {event.description || event.category}
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getSeverityColor(event.severity)}`}>
                                                                    {getSeverityLabel(event.severity)}
                                                                </span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                                                    {getCategoryLabel(event.category)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatTimestamp(event.timestamp)}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="truncate">{event.source}</span>
                                                            </div>
                                                        </div>

                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                {isExpanded && event.metadata && Object.keys(event.metadata).length > 0 && (
                                                    <div className="px-4 pb-3 pt-1 border-t border-slate-800/50">
                                                        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Event Details</p>
                                                            {Object.entries(event.metadata).map(([key, value]) => (
                                                                <div key={key} className="flex justify-between text-xs py-0.5 border-b border-slate-800/30 last:border-0">
                                                                    <span className="text-slate-400">{key}</span>
                                                                    <span className="text-zinc-300 font-mono">{String(value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </SecureDroidCard>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {eventError && (
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-rose-400">Error loading events</p>
                                <p className="text-xs text-rose-400/70 mt-1">{eventError}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center text-[10px] text-slate-500 pt-2">
                    {filteredEvents.length} events displayed
                </div>
            </div>
        </div>
    );
};

export default SecurityAuditLogScreen;
