import React, { useState, useMemo } from 'react';
import {
    Lock,
    Unlock,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
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
    ChevronDown,
    Activity,
    Fingerprint,
    Scan,
    Wifi,
    Server,
    Globe,
    Users,
    Zap,
    Eye,
    EyeOff,
    Key,
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
    details?: string;
    recommendation?: string;
}

export const DeviceSecurityScreen: React.FC<DeviceSecurityScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, risks, loading, connected, error, score, hardeningFindings, reload } = useSecureDroid();
    const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

    const deviceInfo = {
        model: 'Android Device',
        androidVersion: 'Android 14',
        patchLevel: 'August 2026',
        playProtect: true,
        adminEnabled: true,
    };

    const securityChecks = useMemo((): SecurityCheckItem[] => {
        const checks: SecurityCheckItem[] = [];

        const screenLock = hardeningFindings.find(f =>
            f.id === 'NO_SCREEN_LOCK' || f.id === 'SCREEN_LOCK_ENABLED'
        );
        if (screenLock) {
            const isSecure = screenLock.id === 'SCREEN_LOCK_ENABLED';
            checks.push({
                id: 'screen_lock',
                title: 'Screen Lock',
                description: isSecure ? 'Secure lock screen configured' : 'Screen lock is not configured',
                status: isSecure ? 'PASS' : 'FAIL',
                icon: isSecure ? Lock : Unlock,
                color: isSecure ? 'text-emerald-400' : 'text-rose-400',
                details: isSecure ? 'Your device is protected with a secure lock screen.' : 'Your device is vulnerable to physical access attacks.',
                recommendation: isSecure ? undefined : 'Set up a secure lock screen in Settings > Security.',
            });
        } else {
            checks.push({
                id: 'screen_lock',
                title: 'Screen Lock',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Lock,
                color: 'text-slate-400',
                details: 'Android did not provide screen lock information.',
                recommendation: 'Check your lock screen settings manually.',
            });
        }

        const encryption = hardeningFindings.find(f =>
            f.id === 'DEVICE_ENCRYPTED' || f.id === 'DEVICE_NOT_ENCRYPTED'
        );
        if (encryption) {
            const isEncrypted = encryption.id === 'DEVICE_ENCRYPTED';
            checks.push({
                id: 'encryption',
                title: 'Device Encryption',
                description: isEncrypted ? 'Device storage is encrypted' : 'Device storage is not encrypted',
                status: isEncrypted ? 'PASS' : 'FAIL',
                icon: isEncrypted ? ShieldCheck : ShieldOff,
                color: isEncrypted ? 'text-emerald-400' : 'text-rose-400',
                details: isEncrypted ? 'Your data is protected by encryption.' : 'Your data could be accessed if your device is lost.',
                recommendation: isEncrypted ? undefined : 'Enable encryption in Settings > Security.',
            });
        } else {
            checks.push({
                id: 'encryption',
                title: 'Device Encryption',
                description: 'Status unknown',
                status: 'UNKNOWN',
                icon: Shield,
                color: 'text-slate-400',
                details: 'Android did not provide encryption information.',
                recommendation: 'Check your encryption status in Settings > Security.',
            });
        }

        const patch = hardeningFindings.find(f =>
            f.id === 'SECURITY_PATCH_GOOD' || f.id === 'STALE_SECURITY_PATCH' || f.id === 'PATCH_DATE_UNKNOWN'
        );
        if (patch) {
            const isGood = patch.id === 'SECURITY_PATCH_GOOD';
            const isStale = patch.id === 'STALE_SECURITY_PATCH';
            const status = isGood ? 'PASS' : isStale ? 'WARNING' : 'UNKNOWN';
            checks.push({
                id: 'security_patch',
                title: 'Security Patch',
                description: patch.summary || (isGood ? 'Up-to-date' : isStale ? 'Outdated' : 'Unknown'),
                status,
                icon: isGood ? CheckCircle2 : isStale ? AlertTriangle : Info,
                color: isGood ? 'text-emerald-400' : isStale ? 'text-amber-400' : 'text-slate-400',
                details: patch.summary || undefined,
                recommendation: isStale ? 'Install the latest system update.' : undefined,
            });
        } else {
            checks.push({
                id: 'security_patch',
                title: 'Security Patch',
                description: 'Unknown',
                status: 'UNKNOWN',
                icon: Info,
                color: 'text-slate-400',
                details: 'Android did not provide security patch information.',
                recommendation: 'Check for system updates in Settings > System.',
            });
        }

        const usb = hardeningFindings.find(f =>
            f.id === 'USB_DEBUGGING_ENABLED' || f.id === 'USB_DEBUGGING_DISABLED'
        );
        if (usb) {
            const isEnabled = usb.id === 'USB_DEBUGGING_ENABLED';
            checks.push({
                id: 'usb_debugging',
                title: 'USB Debugging',
                description: isEnabled ? 'USB debugging is enabled' : 'USB debugging is disabled',
                status: isEnabled ? 'WARNING' : 'PASS',
                icon: isEnabled ? Usb : CheckCircle2,
                color: isEnabled ? 'text-amber-400' : 'text-emerald-400',
                details: isEnabled ? 'USB debugging can expose your device to security risks when connected to untrusted computers.' : 'USB debugging is disabled, reducing potential attack surface.',
                recommendation: isEnabled ? 'Disable USB debugging in Developer Options when not in use.' : undefined,
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

        const dev = hardeningFindings.find(f =>
            f.id === 'DEVELOPER_OPTIONS_ENABLED' || f.id === 'DEVELOPER_OPTIONS_DISABLED'
        );
        if (dev) {
            const isEnabled = dev.id === 'DEVELOPER_OPTIONS_ENABLED';
            checks.push({
                id: 'developer_options',
                title: 'Developer Options',
                description: isEnabled ? 'Developer options are enabled' : 'Developer options are disabled',
                status: isEnabled ? 'WARNING' : 'PASS',
                icon: isEnabled ? Code : CheckCircle2,
                color: isEnabled ? 'text-amber-400' : 'text-emerald-400',
                details: isEnabled ? 'Developer options can expose advanced settings and potential security risks.' : 'Developer options are disabled, maintaining a secure configuration.',
                recommendation: isEnabled ? 'Disable Developer Options in Settings > System > Developer Options when not in use.' : undefined,
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

        const unknown = hardeningFindings.find(f =>
            f.id === 'UNKNOWN_SOURCES_ENABLED' || f.id === 'UNKNOWN_SOURCES_DISABLED'
        );
        if (unknown) {
            const isEnabled = unknown.id === 'UNKNOWN_SOURCES_ENABLED';
            checks.push({
                id: 'unknown_sources',
                title: 'Unknown Sources',
                description: isEnabled ? 'Installation from unknown sources allowed' : 'Installation from unknown sources restricted',
                status: isEnabled ? 'WARNING' : 'PASS',
                icon: isEnabled ? Package : CheckCircle2,
                color: isEnabled ? 'text-amber-400' : 'text-emerald-400',
                details: isEnabled ? 'Allowing installation from unknown sources increases the risk of malware.' : 'Installation from unknown sources is restricted, reducing malware risk.',
                recommendation: isEnabled ? 'Disable unknown sources in Settings > Security.' : undefined,
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
    }, [hardeningFindings]);

    const passCount = securityChecks.filter(c => c.status === 'PASS').length;
    const warningCount = securityChecks.filter(c => c.status === 'WARNING').length;
    const failCount = securityChecks.filter(c => c.status === 'FAIL').length;
    const unknownCount = securityChecks.filter(c => c.status === 'UNKNOWN').length;
    const totalChecks = securityChecks.length;
    const securityScore = totalChecks > 0 ? Math.round((passCount / totalChecks) * 100) : 0;

    const toggleExpanded = (id: string) => {
        setExpandedCheck(expandedCheck === id ? null : id);
    };

    const getStatusLabel = (status: SecurityCheckItem['status']) => {
        switch (status) {
            case 'PASS': return 'Secure';
            case 'WARNING': return 'Needs Review';
            case 'FAIL': return 'Vulnerable';
            default: return 'Unknown';
        }
    };

    const getStatusColor = (status: SecurityCheckItem['status']) => {
        switch (status) {
            case 'PASS': return 'text-emerald-400 bg-emerald-500/10';
            case 'WARNING': return 'text-amber-400 bg-amber-500/10';
            case 'FAIL': return 'text-rose-400 bg-rose-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const overallStatus = useMemo(() => {
        if (failCount > 0) return { label: 'At Risk', color: 'text-rose-400' };
        if (warningCount > 0) return { label: 'Needs Attention', color: 'text-amber-400' };
        if (passCount === totalChecks) return { label: 'Protected', color: 'text-emerald-400' };
        return { label: 'Unknown', color: 'text-slate-400' };
    }, [failCount, warningCount, passCount, totalChecks]);

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Device Security"
                subtitle="Security posture overview"
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
                <SecureDroidGlassCard className="p-6">
                    <div className="flex items-center gap-6">
                        <SecureDroidProgressRing value={securityScore} size={80} strokeWidth={7} color={overallStatus.color === 'text-rose-400' ? 'rose' : overallStatus.color === 'text-amber-400' ? 'amber' : 'emerald'}>
                            <span className="text-2xl font-bold text-zinc-100">{securityScore}</span>
                        </SecureDroidProgressRing>
                        <div>
                            <div className="flex items-center gap-2">
                                {failCount === 0 && warningCount === 0 ? (
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                ) : failCount > 0 ? (
                                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                                ) : (
                                    <Shield className="w-5 h-5 text-amber-400" />
                                )}
                                <span className={`text-lg font-semibold ${overallStatus.color}`}>
                                    {overallStatus.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    {passCount} passed
                                </span>
                                <span className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    {warningCount} warnings
                                </span>
                                <span className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-rose-400" />
                                    {failCount} failures
                                </span>
                            </div>
                        </div>
                    </div>
                </SecureDroidGlassCard>

                <SecureDroidSectionHeader title="Device Information" isLight={isLight} />
                <div className="grid grid-cols-4 gap-2">
                    <SecureDroidStatCard label="Model" value={deviceInfo.model} icon={Smartphone} color="slate" />
                    <SecureDroidStatCard label="Android" value={deviceInfo.androidVersion} icon={Globe} color="slate" />
                    <SecureDroidStatCard label="Patch" value={deviceInfo.patchLevel} icon={Calendar} color="emerald" />
                    <SecureDroidStatCard label="Play Protect" value="✅" icon={Shield} color="emerald" />
                </div>

                <SecureDroidSectionHeader title="Security Checks" isLight={isLight} />

                <div className="space-y-2.5">
                    {securityChecks.map((check) => {
                        const isExpanded = expandedCheck === check.id;
                        const StatusIcon = check.status === 'PASS' ? CheckCircle2 : check.status === 'WARNING' ? AlertTriangle : check.status === 'FAIL' ? XCircle : Info;

                        return (
                            <SecureDroidCard
                                key={check.id}
                                className="p-0 overflow-hidden"
                                isLight={isLight}
                            >
                                <div
                                    className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                                    onClick={() => toggleExpanded(check.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getStatusColor(check.status)}`}>
                                            <check.icon className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-zinc-100 text-sm">
                                                    {check.title}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getStatusColor(check.status)}`}>
                                                    {getStatusLabel(check.status)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">
                                                {check.description}
                                            </p>
                                        </div>

                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {isExpanded && (check.details || check.recommendation) && (
                                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/50 space-y-1.5">
                                        {check.details && (
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {check.details}
                                            </p>
                                        )}
                                        {check.recommendation && (
                                            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                                                <p className="text-xs text-amber-400 flex items-start gap-2">
                                                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    {check.recommendation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </SecureDroidCard>
                        );
                    })}
                </div>

                <SecureDroidSectionHeader title="System Privileges" isLight={isLight} />
                <SecureDroidCard className="p-4" isLight={isLight}>
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-sky-400" />
                        <div>
                            <div className="font-semibold text-zinc-100">Device Administrator</div>
                            <div className="text-sm text-slate-400">Enabled • SecureDroid has admin privileges</div>
                        </div>
                        <div className="ml-auto">
                            <SecureDroidStatusChip status="PROTECTED" isLight={isLight} size="sm" />
                        </div>
                    </div>
                </SecureDroidCard>

                {(failCount > 0 || warningCount > 0) && (
                    <div className={`p-4 rounded-xl border ${failCount > 0 ? 'bg-rose-950/20 border-rose-800/30' : 'bg-amber-950/20 border-amber-800/30'}`}>
                        <div className="flex items-start gap-3">
                            {failCount > 0 ? (
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className={`text-sm font-medium ${failCount > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                                    {failCount > 0
                                        ? `${failCount} critical issue${failCount > 1 ? 's' : ''} found`
                                        : `${warningCount} item${warningCount > 1 ? 's' : ''} need review`}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    {failCount > 0
                                        ? 'Immediate action recommended to secure your device.'
                                        : 'Review the warnings to improve your device security posture.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center text-[10px] text-slate-500 pt-2">
                    {passCount + warningCount + failCount} of {totalChecks} checks completed
                </div>
            </div>
        </div>
    );
};

export default DeviceSecurityScreen;
