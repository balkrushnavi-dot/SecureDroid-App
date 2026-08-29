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
    SecureDroidBadge,
    SecureDroidProgressRing,
    SecureDroidStatCard,
    SecureDroidGlassCard,
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

    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
    const totalRisks = risks.length;
    const deviceIssues = hardeningFindings.filter(f => f.level === 'WARNING' || f.level === 'CRITICAL').length;
    const totalChecks = hardeningFindings.length;

    const appRiskBreakdown = useMemo(() => {
        const total = apps.filter(a => !a.isSystemApp).length;
        const risky = totalRisks;
        const clean = total - risky;
        return { total, risky, clean };
    }, [apps, totalRisks]);

    const score
