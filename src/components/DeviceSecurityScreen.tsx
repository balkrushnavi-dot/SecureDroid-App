import React, { useState, useEffect } from 'react';
import {
    Lock,
    Unlock,
    Shield,
    ShieldCheck,
    ShieldOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Smartphone,
    Database,
    RefreshCw,
    ChevronRight,
    Wifi,
    Usb,
    Settings,
    Code,
    Package,
    Zap,
    Server,
    Globe,
    User,
    Calendar,
    Info
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton
} from './ui/designSystem';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface DeviceSecurityScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface SecurityCheck {
    id: string;
    title: string;
    description: string;
    status: 'PASS' | 'WARNING' | 'FAIL' | 'UNKNOWN';
    icon: React.ElementType;
    color: string;
}

export const DeviceSecurityScreen: React.FC<DeviceSecurityScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [loading, setLoading] = useState(true);
    const [hardeningReport, setHardeningReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const loadHardeningReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await SecureDroidNative.getHardeningReport();
            if (result.success && result.data) {
                setHardeningReport(result.data);
            } else {
                setError(result.message || 'Failed to load device security data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHardeningReport();
    }, []);

    // Mock data for UI demonstration
    const securityChecks: SecurityCheck[] = [
        {
            id: 'screen_lock',
            title: 'Screen Lock',
            description: 'Secure lock screen configured',
            status: 'PASS',
            icon: Lock,
            color: 'text-emerald-400'
        },
        {
            id: 'encryption',
            title: 'Device Encryption',
            description: 'Device storage is encrypted',
            status: 'PASS',
            icon: Database,
            color: 'text-emerald-400'
        },
        {
            id: 'security_patch',
            title: 'Security Patch',
            description: 'August 2026 security patch level',
            status: 'PASS',
            icon: Calendar,
            color: 'text-emerald-400'
        },
        {
            id: 'usb_debugging',
            title: 'USB Debugging',
            description: 'USB debugging is disabled',
            status: 'PASS',
            icon: Usb,
            color: 'text-emerald-400'
        },
        {
            id: 'developer_options',
            title: 'Developer Options',
            description: 'Developer options are disabled',
            status: 'PASS',
            icon: Code,
            color: 'text-emerald-400'
        },
        {
            id: 'unknown_sources',
            title: 'Unknown Sources',
            description: 'Installation from unknown sources restricted',
            status: 'PASS',
            icon: Package,
            color: 'text-emerald-400'
        },
    ];

    const getStatusIcon = (status: SecurityCheck['status']) => {
        switch (status) {
            case 'PASS': return CheckCircle2;
            case 'WARNING': return AlertTriangle;
            case 'FAIL': return XCircle;
            default: return Info;
        }
    };

    const getStatusColor = (status: SecurityCheck['status']) => {
        switch (status) {
            case 'PASS': return 'text-emerald-400 bg-emerald-500/10';
            case 'WARNING': return 'text-amber-400 bg-amber-500/10';
            case 'FAIL': return 'text-red-400 bg-red-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getStatusLabel = (status: SecurityCheck['status']) => {
        switch (status) {
            case 'PASS': return 'Protected';
            case 'WARNING': return 'Needs Review';
            case 'FAIL': return 'Vulnerable';
            default: return 'Unknown';
        }
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Device Security"
                subtitle="Security configuration & status"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Overall Status */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                <span className="text-xl font-bold text-slate-100">Device Secure</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">All security checks passed</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Score</div>
                            <div className="text-2xl font-bold text-emerald-400">92</div>
                        </div>
                    </div>
                </div>

                {/* Security Checks */}
                <SecureDroidSectionHeader title="Security Checks" />

                <div className="space-y-3">
                    {securityChecks.map((check) => {
                        const StatusIcon = getStatusIcon(check.status);
                        return (
                            <div key={check.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                <div className="flex items-start gap-3">
                                    <check.icon className={`w-5 h-5 ${check.color} mt-0.5`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-100">{check.title}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(check.status)}`}>
                                                {getStatusLabel(check.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-0.5">{check.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Device Info */}
                <SecureDroidSectionHeader title="Device Information" />

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Model</span>
                        <span className="text-slate-200 font-medium">Pixel 7 Pro</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Android Version</span>
                        <span className="text-slate-200 font-medium">Android 14</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Security Patch</span>
                        <span className="text-slate-200 font-medium">August 2026</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Play Protect</span>
                        <span className="text-slate-200 font-medium text-emerald-400">✓ Certified</span>
                    </div>
                </div>

                {/* Device Admin Status */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-sky-400" />
                        <div>
                            <div className="font-semibold text-slate-100">Device Admin</div>
                            <div className="text-sm text-slate-400">Enabled • SecureDroid has admin privileges</div>
                        </div>
                        <div className="ml-auto">
                            <span className="text-xs font-medium text-emerald-400">Active</span>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-800/30">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-400">No Issues Found</p>
                            <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                Your device meets all security recommendations. Continue monitoring
                                for any changes to your security configuration.
                            </p>
                        </div>
                    </div>
                </div>

                <SecureDroidButton
                    onClick={loadHardeningReport}
                    disabled={loading}
                    className="w-full"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Checking...' : 'Refresh Status'}
                </SecureDroidButton>
            </div>
        </div>
    );
};

export default DeviceSecurityScreen;
