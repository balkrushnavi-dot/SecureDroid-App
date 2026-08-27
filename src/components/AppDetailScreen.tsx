import React, { useState, useEffect } from 'react';
import {
    Shield,
    ShieldCheck,
    ShieldOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Info,
    Package,
    Calendar,
    Clock,
    Download,
    User,
    Server,
    Database,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Camera,
    Mic,
    MapPin,
    Users,
    MessageSquare,
    Phone,
    Image,
    FileText,
    Wifi,
    Bluetooth,
    RefreshCw,
    Share2,
    ExternalLink
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';

interface AppDetailScreenProps {
    onBack: () => void;
    packageName: string;
    isLight?: boolean;
}

interface PermissionDetail {
    name: string;
    icon: React.ElementType;
    declared: boolean;
    granted: boolean;
    description: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const AppDetailScreen: React.FC<AppDetailScreenProps> = ({
    onBack,
    packageName,
    isLight = false,
}) => {
    const { apps, risks } = useSecureDroid();
    const [loading, setLoading] = useState(true);

    // Find the app
    const app = apps.find(a => a.packageName === packageName);
    const risk = risks.find(r => r.packageName === packageName);

    // Mock permission data for UI demonstration
    const permissions: PermissionDetail[] = [
        {
            name: 'Location',
            icon: MapPin,
            declared: true,
            granted: true,
            description: 'Access precise location',
            risk: 'HIGH'
        },
        {
            name: 'Camera',
            icon: Camera,
            declared: true,
            granted: true,
            description: 'Take photos and videos',
            risk: 'HIGH'
        },
        {
            name: 'Microphone',
            icon: Mic,
            declared: true,
            granted: false,
            description: 'Record audio',
            risk: 'MEDIUM'
        },
        {
            name: 'Contacts',
            icon: Users,
            declared: true,
            granted: true,
            description: 'Read your contacts',
            risk: 'HIGH'
        },
        {
            name: 'Storage',
            icon: Database,
            declared: true,
            granted: true,
            description: 'Read and write files',
            risk: 'MEDIUM'
        },
        {
            name: 'SMS',
            icon: MessageSquare,
            declared: false,
            granted: false,
            description: 'Read and send SMS',
            risk: 'HIGH'
        },
    ];

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
                <SecureDroidTopBar title="App Detail" onBack={onBack} isLight={isLight} />
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
                <SecureDroidTopBar title="App Detail" onBack={onBack} isLight={isLight} />
                <div className="p-4 text-center">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">App not found</p>
                    <SecureDroidButton onClick={onBack} className="mt-4">
                        Go Back
                    </SecureDroidButton>
                </div>
            </div>
        );
    }

    const getRiskLevel = (riskLevel?: string) => {
        if (!riskLevel) return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-500/10' };
        switch (riskLevel.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL':
                return { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10' };
            case 'MEDIUM':
                return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' };
            case 'LOW':
                return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
            default:
                return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-500/10' };
        }
    };

    const riskInfo = getRiskLevel(risk?.riskLevel || 'UNKNOWN');
    const RiskIcon = risk?.riskLevel === 'HIGH' || risk?.riskLevel === 'CRITICAL'
        ? AlertTriangle
        : risk?.riskLevel === 'MEDIUM'
            ? Shield
            : CheckCircle2;

    const getPermissionRiskColor = (risk: string) => {
        switch (risk) {
            case 'HIGH': return 'text-red-400 bg-red-500/10';
            case 'MEDIUM': return 'text-amber-400 bg-amber-500/10';
            default: return 'text-emerald-400 bg-emerald-500/10';
        }
    };

    const getPermissionRiskLabel = (risk: string) => {
        switch (risk) {
            case 'HIGH': return 'High';
            case 'MEDIUM': return 'Medium';
            default: return 'Low';
        }
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="App Detail"
                subtitle={app.appName}
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* App Header */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-100">{app.appName}</h2>
                                {app.isSystemApp && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                        System
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 font-mono">{app.packageName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span>v{app.versionName}</span>
                                <span>•</span>
                                <span>SDK {app.targetSdk}</span>
                                {app.isDebuggable && (
                                    <>
                                        <span>•</span>
                                        <span className="text-amber-400">🔧 Debuggable</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${riskInfo.bg} ${riskInfo.color}`}>
                                {riskInfo.label} Risk
                            </div>
                            {risk && (
                                <div className="text-xs text-slate-500 mt-1">
                                    {risk.findingCount || 0} findings
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Score */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <RiskIcon className={`w-6 h-6 ${riskInfo.color}`} />
                            <div>
                                <div className="text-sm text-slate-400">Security Risk</div>
                                <div className={`text-lg font-bold ${riskInfo.color}`}>
                                    {risk?.riskLevel || 'Unknown'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Score</div>
                            <div className="text-lg font-bold text-slate-100">
                                {risk?.securityScore ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Findings */}
                {risk?.findings && risk.findings.length > 0 && (
                    <>
                        <SecureDroidSectionHeader title="Findings" />
                        <div className="space-y-2">
                            {risk.findings.map((finding, index) => (
                                <div key={index} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium text-slate-200">
                                                {finding.title || finding.code}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {finding.description}
                                            </div>
                                            {finding.severity && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${getPermissionRiskColor(finding.severity)}`}>
                                                    {finding.severity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Permissions */}
                <SecureDroidSectionHeader title="Permissions" />
                <div className="space-y-2">
                    {permissions.map((perm, index) => {
                        const Icon = perm.icon;
                        return (
                            <div key={index} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${getPermissionRiskColor(perm.risk)} flex items-center justify-center`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-200">{perm.name}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getPermissionRiskColor(perm.risk)}`}>
                                                {getPermissionRiskLabel(perm.risk)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400">{perm.description}</div>
                                    </div>
                                    <div className="text-right">
                                        {perm.granted ? (
                                            <span className="text-xs text-emerald-400">Granted</span>
                                        ) : perm.declared ? (
                                            <span className="text-xs text-amber-400">Declared</span>
                                        ) : (
                                            <span className="text-xs text-slate-500">Not Declared</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* App Info */}
                <SecureDroidSectionHeader title="Application Info" />
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Package</span>
                        <span className="text-slate-200 font-mono text-xs">{app.packageName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Version</span>
                        <span className="text-slate-200">{app.versionName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Target SDK</span>
                        <span className="text-slate-200">API {app.targetSdk}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Installed</span>
                        <span className="text-slate-200">{new Date(app.installTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Updated</span>
                        <span className="text-slate-200">{new Date(app.updateTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Install Source</span>
                        <span className="text-slate-200">{app.installSource}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">System App</span>
                        <span className={app.isSystemApp ? 'text-amber-400' : 'text-emerald-400'}>
                            {app.isSystemApp ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Debuggable</span>
                        <span className={app.isDebuggable ? 'text-amber-400' : 'text-emerald-400'}>
                            {app.isDebuggable ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <SecureDroidButton variant="secondary" className="flex-1" icon={ExternalLink}>
                        Open App
                    </SecureDroidButton>
                    <SecureDroidButton variant="secondary" className="flex-1" icon={Share2}>
                        Share
                    </SecureDroidButton>
                </div>
            </div>
        </div>
    );
};

export default AppDetailScreen;
