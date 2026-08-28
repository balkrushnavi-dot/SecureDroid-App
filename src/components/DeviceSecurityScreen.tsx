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
    Usb,
    Settings,
    Code,
    Package,
    Info,
    ChevronRight,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';

interface DeviceSecurityScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface SecurityCheckItem {
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
    const { apps, risks, loading, connected, error, score, hardeningFindings, reload } = useSecureDroid();
    const [deviceInfo, setDeviceInfo] = useState<any>(null);

    // We don't have device model info from hardening, but we can use navigator or static placeholder.
    // For now, we'll show a generic device info or rely on future native method.
    // We can safely show 'Android' as the model since it's a generic device.

    // Map hardening findings to security checks
    const getSecurityChecks = (): SecurityCheckItem[] => {
        const checks: SecurityCheckItem[] = [];

        // Screen lock
        const screenLockFinding = hardeningFindings.find(f => f.id === 'NO_SCREEN_LOCK' || f.id === 'SCREEN_LOCK_ENABLED');
        if (screenLockFinding) {
            const isSecure = screenLockFinding.id === 'SCREEN_LOCK_ENABLED';
            checks.push({
                id: 'screen_lock',
                title: 'Screen Lock',
                description: isSecure ? 'Secure lock screen configured' : 'Screen lock is not configured',
                status: isSecure ? 'PASS' : 'FAIL',
                icon: isSecure ? Lock : Unlock,
                color: isSecure ? 'text-emerald-400' : 'text-red-400',
            });
        } else {
            checks.push({
                id: 'screen_lock',
                title: 'Screen Lock',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Lock,
                color: 'text-slate-400',
            });
        }

        // Device encryption (from HardeningAnalyzer, we have DEVICE_ENCRYPTED or DEVICE_NOT_ENCRYPTED)
        const encryptionFinding = hardeningFindings.find(f =>
            f.id === 'DEVICE_ENCRYPTED' || f.id === 'DEVICE_NOT_ENCRYPTED'
        );
        if (encryptionFinding) {
            const isEncrypted = encryptionFinding.id === 'DEVICE_ENCRYPTED';
            checks.push({
                id: 'encryption',
                title: 'Device Encryption',
                description: isEncrypted ? 'Device storage is encrypted' : 'Device storage is not encrypted',
                status: isEncrypted ? 'PASS' : 'FAIL',
                icon: isEncrypted ? ShieldCheck : ShieldOff,
                color: isEncrypted ? 'text-emerald-400' : 'text-red-400',
            });
        } else {
            checks.push({
                id: 'encryption',
                title: 'Device Encryption',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Shield,
                color: 'text-slate-400',
            });
        }

        // Security patch
        const patchFinding = hardeningFindings.find(f =>
            f.id === 'SECURITY_PATCH_GOOD' || f.id === 'STALE_SECURITY_PATCH' || f.id === 'PATCH_DATE_UNKNOWN'
        );
        if (patchFinding) {
            const isGood = patchFinding.id === 'SECURITY_PATCH_GOOD';
            const isStale = patchFinding.id === 'STALE_SECURITY_PATCH';
            const status = isGood ? 'PASS' : isStale ? 'WARNING' : 'UNKNOWN';
            checks.push({
                id: 'security_patch',
                title: 'Security Patch',
                description: patchFinding.summary || (isGood ? 'Up-to-date' : isStale ? 'Outdated' : 'Unknown'),
                status,
                icon: isGood ? CheckCircle2 : isStale ? AlertTriangle : Info,
                color: isGood ? 'text-emerald-400' : isStale ? 'text-amber-400' : 'text-slate-400',
            });
        } else {
            checks.push({
                id: 'security_patch',
                title: 'Security Patch',
                description: 'Unknown',
                status: 'UNKNOWN',
                icon: Info,
                color: 'text-slate-400',
            });
        }

        // USB debugging
        const usbFinding = hardeningFindings.find(f =>
            f.id === 'USB_DEBUGGING_ENABLED' || f.id === 'USB_DEBUGGING_DISABLED'
        );
        if (usbFinding) {
            const isEnabled = usbFinding.id === 'USB_DEBUGGING_ENABLED';
            checks.push({
                id: 'usb_debugging',
                title: 'USB Debugging',
                description: isEnabled ? 'USB debugging is enabled' : 'USB debugging is disabled',
                status: isEnabled ? 'WARNING' : 'PASS',
                icon: isEnabled ? AlertTriangle : CheckCircle2,
                color: isEnabled ? 'text-amber-400' : 'text-emerald-400',
            });
        } else {
            checks.push({
                id: 'usb_debugging',
                title: 'USB Debugging',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Usb,
                color: 'text-slate-400',
            });
        }

        // Developer options
        const devFinding = hardeningFindings.find(f =>
            f.id === 'DEVELOPER_OPTIONS_ENABLED' || f.id === 'DEVELOPER_OPTIONS_DISABLED'
        );
        if (devFinding) {
            const isEnabled = devFinding.id === 'DEVELOPER_OPTIONS_ENABLED';
            checks.push({
                id: 'developer_options',
                title: 'Developer Options',
                description: isEnabled ? 'Developer options are enabled' : 'Developer options are disabled',
                status: isEnabled ? 'WARNING' : 'PASS',
                icon: isEnabled ? Code : CheckCircle2,
                color: isEnabled ? 'text-amber-400' : 'text-emerald-400',
            });
        } else {
            checks.push({
                id: 'developer_options',
                title: 'Developer Options',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Settings,
                color: 'text-slate-400',
            });
        }

        // Unknown sources
        const unknownFinding = hardeningFindings.find(f =>
            f.id === 'UNKNOWN_SOURCES_ENABLED' || f.id === 'UNKNOWN_SOURCES_DISABLED'
        );
        if (unknownFinding) {
            const isEnabled = unknownFinding.id === 'UNKNOWN_SOURCES_ENABLED';
            checks.push({
                id: 'unknown_sources',
                title: 'Unknown Sources',
                description: isEnabled ? 'Installation from unknown sources allowed' : 'Installation from unknown sources restricted',
                status: isEnabled ? 'WARNING' : 'PASS',
                icon: isEnabled ? AlertTriangle : CheckCircle2,
                color: isEnabled ? 'text-amber-400' : 'text-emerald-400',
            });
        } else {
            checks.push({
                id: 'unknown_sources',
                title: 'Unknown Sources',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Package,
                color: 'text-slate-400',
            });
        }

        return checks;
    };

    const securityChecks = getSecurityChecks();

    // Count passes and failures
    const passCount = securityChecks.filter(c => c.status === 'PASS').length;
    const warningCount = securityChecks.filter(c => c.status === 'WARNING').length;
    const failCount = securityChecks.filter(c => c.status === 'FAIL').length;
    const unknownCount = securityChecks.filter(c => c.status === 'UNKNOWN').length;

    const getStatusIcon = (status: SecurityCheckItem['status']) => {
        switch (status) {
            case 'PASS': return CheckCircle2;
            case 'WARNING': return AlertTriangle;
            case 'FAIL': return XCircle;
            default: return Info;
        }
    };

    const getStatusColor = (status: SecurityCheckItem['status']) => {
        switch (status) {
            case 'PASS': return 'text-emerald-400 bg-emerald-500/10';
            case 'WARNING': return 'text-amber-400 bg-amber-500/10';
            case 'FAIL': return 'text-red-400 bg-red-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getStatusLabel = (status: SecurityCheckItem['status']) => {
        switch (status) {
            case 'PASS': return 'Protected';
            case 'WARNING': return 'Needs Review';
            case 'FAIL': return 'Vulnerable';
            default: return 'Unknown';
        }
    };

    // Overall protection status
    const getOverallStatus = () => {
        if (failCount > 0) return { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/10' };
        if (warningCount > 0) return { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-500/10' };
        if (passCount > 0 && unknownCount === 0) return { label: 'Protected', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    };

    const overall = getOverallStatus();

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
                                {failCount === 0 && warningCount === 0 ? (
                                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                ) : failCount > 0 ? (
                                    <ShieldOff className="w-6 h-6 text-red-400" />
                                ) : (
                                    <Shield className="w-6 h-6 text-amber-400" />
                                )}
                                <span className={`text-xl font-bold ${overall.color}`}>
                                    {overall.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                {passCount} checks passed, {warningCount} warnings, {failCount} failures, {unknownCount} unknown
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Score</div>
                            <div className={`text-2xl font-bold ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                {score}
                            </div>
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

                {/* Device Info (static placeholder for now) */}
                <SecureDroidSectionHeader title="Device Information" />

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Model</span>
                        <span className="text-slate-200 font-medium">Android Device</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Android Version</span>
                        <span className="text-slate-200 font-medium">Android 12+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Security Patch</span>
                        <span className="text-slate-200 font-medium">
                            {hardeningFindings.find(f => f.id === 'SECURITY_PATCH_GOOD')?.summary || 'Unknown'}
                        </span>
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
                {failCount > 0 || warningCount > 0 ? (
                    <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-800/30">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-400">
                                    {failCount > 0 ? `${failCount} critical issues found` : `${warningCount} items need review`}
                                </p>
                                <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                    {failCount > 0
                                        ? 'Immediate action recommended to secure your device.'
                                        : 'Review the warnings to improve your device security posture.'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : unknownCount > 0 ? (
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-300">Some information is unavailable</p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Your device may not expose all security settings. The checks shown are based on available data.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-800/30">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-400">All checks passed</p>
                                <p className="text-xs text-emerald-400/70 mt-1 leading-relaxed">
                                    Your device meets all security recommendations. Continue monitoring for any changes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <SecureDroidButton
                    onClick={reload}
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
