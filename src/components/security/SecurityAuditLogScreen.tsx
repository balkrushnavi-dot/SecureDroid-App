import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  RefreshCw
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';
import { SecurityAuditEvent, SecurityEventSeverity } from '../../types/securedroid';
import { SAMPLE_SECURITY_AUDIT_EVENTS } from '../../data/featurePackData';
import { SecureDroidNative } from '../../services/native/SecureDroidNative';

interface SecurityAuditLogScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const SecurityAuditLogScreen: React.FC<SecurityAuditLogScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [events, setEvents] = useState<SecurityAuditEvent[]>(SAMPLE_SECURITY_AUDIT_EVENTS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchLiveLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await SecureDroidNative.getSecurityLogs(50);
      if (res.success && res.data && res.data.length > 0) {
        const mapped: SecurityAuditEvent[] = res.data.map((l: any, i: number) => ({
          id: l.id || `live_log_${i}`,
          timestamp: new Date(l.timestamp || Date.now()).toLocaleTimeString(),
          category: (l.category || 'SECURITY') as any,
          severity: (l.severity || 'INFO') as any,
          title: l.description ? l.description.split('.')[0] : 'Security Event',
          explanation: l.description || 'System security audit event',
          action: 'LOGGED_TO_SECURE_STORAGE',
          evidence: `Source: ${l.source || 'Android Kernel / Service'}`,
          source: 'REAL EVENT',
        }));
        setEvents([...mapped, ...SAMPLE_SECURITY_AUDIT_EVENTS]);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveLogs();
  }, []);

  const categories = ['All', 'SECURITY', 'PRIVACY', 'APPLICATIONS', 'NETWORK', 'USB', 'AUTHENTICATION', 'BACKUP', 'SECURE_ENVIRONMENT'];

  const filteredEvents = events.filter((e) => {
    if (activeCategory === 'All') return true;
    return e.category === activeCategory;
  });

  const getSeverityBadge = (sev: SecurityEventSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return { variant: 'UNAVAILABLE' as const, label: 'CRITICAL' };
      case 'HIGH':
      case 'WARNING':
        return { variant: 'DEGRADED' as const, label: sev };
      case 'NOTICE':
        return { variant: 'ISOLATED' as const, label: 'NOTICE' };
      case 'INFO':
      default:
        return { variant: 'SECURE' as const, label: 'INFO' };
    }
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Security Audit Log"
        subtitle="Cryptographic Event Stream & Integrity Timeline"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Time Filter Tabs & Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(['Today', '7 Days', '30 Days'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  timeRange === t
                    ? isLight
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-900'
                    : isLight
                    ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLiveLogs}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{filteredEvents.length} Events</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                  : isLight
                  ? 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const badge = getSeverityBadge(evt.severity);
            return (
              <SecureDroidCard key={evt.id} isLight={isLight} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{evt.title}</h4>
                      <SecureDroidStatusChip status={badge.variant} label={badge.label} isLight={isLight} />
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        evt.source === 'REAL EVENT'
                          ? 'bg-emerald-950 text-emerald-300'
                          : evt.source === 'SYSTEM EVENT'
                          ? 'bg-blue-950 text-blue-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {evt.source}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {evt.explanation}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {evt.timestamp}
                  </span>
                </div>

                <div className={`p-2 rounded-lg text-[11px] font-mono space-y-0.5 ${
                  isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'
                }`}>
                  <div><strong>Action:</strong> {evt.action}</div>
                  <div className="truncate"><strong>Evidence:</strong> {evt.evidence}</div>
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
