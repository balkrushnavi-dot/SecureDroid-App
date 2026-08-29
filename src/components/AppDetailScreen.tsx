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
    ExternalLink,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';
import type { AppInfo, RiskInfo } from '../hooks/useSecureDroid';

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

const PERMISSION_MAP: Record<string, { name: string; icon: React.ElementType; risk: 'LOW' | 'MEDIUM' | 'HIGH'; description: string }> = {
    'android.permission.CAMERA': { name: 'Camera', icon: Camera, risk: 'HIGH', description: 'Take photos and videos' },
    'android.permission.RECORD_AUDIO': { name: 'Microphone', icon: Mic, risk: 'HIGH', description: 'Record audio' },
    'android.permission.ACCESS_FINE_LOCATION': { name: 'Precise Location', icon: MapPin, risk: 'HIGH', description: 'Access precise location' },
    'android.permission.ACCESS_COARSE_LOCATION': { name: 'Approximate Location', icon: MapPin, risk: 'MEDIUM', description: 'Access approximate location' },
    'android.permission.READ_CONTACTS': { name: 'Read Contacts', icon: Users, risk: 'HIGH', description: 'Read your contacts' },
    'android.permission.WRITE_CONTACTS': { name: 'Write Contacts', icon: Users, risk: 'HIGH', description: 'Modify your contacts' },
    'android.permission.READ_CALENDAR': { name: 'Read Calendar', icon: Calendar, risk: 'MEDIUM', description: 'Read calendar events' },
    'android.permission.WRITE_CALENDAR': { name: 'Write Calendar', icon: Calendar, risk: 'MEDIUM', description: 'Modify calendar events' },
    'android.permission.READ_SMS': { name: 'Read SMS', icon: MessageSquare, risk: 'HIGH', description: 'Read SMS messages' },
    'android.permission.SEND_SMS': { name: 'Send SMS', icon: MessageSquare, risk: 'HIGH', description: 'Send SMS messages' },
    'android.permission.RECEIVE_SMS': { name: 'Receive SMS', icon: MessageSquare, risk: 'HIGH', description: 'Intercept incoming SMS' },
    'android.permission.READ_CALL_LOG': { name: 'Read Call Log', icon: Phone, risk: 'HIGH', description: 'Read call history' },
    'android.permission.WRITE_CALL_LOG': { name: 'Write Call Log', icon: Phone, risk: 'HIGH', description: 'Modify call history' },
    'android.permission.CALL_PHONE': { name: 'Directly Call Phone', icon: Phone, risk: 'HIGH', description: 'Directly call phone numbers' },
    'android.permission.READ_PHONE_STATE': { name: 'Phone State', icon: Phone, risk: 'MEDIUM', description: 'Read phone status and identity' },
    'android.permission.READ_PHONE_NUMBERS': { name: 'Phone Numbers', icon: Phone, risk: 'MEDIUM', description: 'Read phone numbers' },
    'android.permission.READ_EXTERNAL_STORAGE': { name: 'Read External Storage', icon: Database, risk: 'MEDIUM', description: 'Read files on external storage' },
    'android.permission.WRITE_EXTERNAL_STORAGE': { name: 'Write External Storage', icon: Database, risk: 'MEDIUM', description: 'Write files on external storage' },
    'android.permission.READ_MEDIA_IMAGES': { name: 'Read Images', icon: Image, risk: 'LOW', description: 'Read images from media store' },
    'android.permission.READ_MEDIA_VIDEO': { name: 'Read Videos', icon: Image, risk: 'LOW', description: 'Read videos from media store' },
    'android.permission.READ_MEDIA_AUDIO': { name: 'Read Audio', icon: FileText, risk: 'LOW', description: 'Read audio files from media store' },
    'android.permission.BODY_SENSORS': { name: 'Body Sensors', icon: Activity, risk: 'MEDIUM', description: 'Access body sensor data' },
    'android.permission.ACTIVITY_RECOGNITION': { name: 'Activity Recognition', icon: Activity, risk: 'LOW', description: 'Recognize physical activity' },
    'android.permission.POST_NOTIFICATIONS': { name: 'Post Notifications', icon: Bell, risk: 'LOW', description: 'Show notifications' },
    'android.permission.SYSTEM_ALERT_WINDOW': { name: 'Draw Over Other Apps', icon: Eye, risk: 'HIGH', description: 'Display overlay windows' },
    'android.permission.REQUEST_INSTALL_PACKAGES': { name: 'Install Packages', icon: Package, risk: 'HIGH', description: 'Install other applications' },
    'android.permission.WRITE_SECURE_SETTINGS': { name: 'Write Secure Settings', icon: Settings, risk: 'HIGH', description: 'Modify protected system settings' },
    'android.permission.BIND_ACCESSIBILITY_SERVICE': { name: 'Accessibility Service', icon: Eye, risk: 'HIGH', description: 'Control screen via accessibility' },
    'android.permission.BIND_DEVICE_ADMIN': { name: 'Device Administrator', icon: Shield, risk: 'HIGH', description: 'Request device admin privileges' },
};

const DEFAULT_PERM = { name: 'Unknown Permission', icon: Shield, risk: 'LOW' as const, description: 'This permission is not recognized' };

export const AppDetailScreen: React.FC<AppDetailScreenProps> = ({
    onBack,
    packageName,
    isLight = false,
}) => {
    const { apps, risks } = useSecureDroid();
    const [loading, setLoading] = useState(true);

    const app = apps.find(a => a.packageName === packageName);
    const risk = risks.find(r => r.packageName === packageName);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const buildPermissions = (): PermissionDetail[] => {
        if (!app) return [];
        const requested = app.requestedPermissions || [];
        const granted = app.grantedPermissions || [];
        const grantedSet = new Set(granted);

        return requested.map((perm: string) => {
            const mapped = PERMISSION_MAP[perm] || DEFAULT_PERM;
            const grantedStatus = granted.length > 0 ? grantedSet.has(perm) : false;
            return {
                name: mapped.name,
                icon: mapped.icon,
                declared: true,
                granted: grantedStatus,
                description: mapped.description,
                risk: mapped.risk,
            };
        });
    };

    const permissions = buildPermissions();

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
                    <SecureDroidButton onClick={onBack} className="mt-4">Go Back</SecureDroidButton>
                </div>
            </div>
        );
    }

    const getRiskLevel = (riskLevel?: string) => {
        if (!riskLevel) return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-500/10' };
        switch (riskLevel.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL': return { label: 'High', color: 'text-rose-400', bg: 'bg-rose-500/10' };
            case 'MEDIUM': return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' };
            case 'LOW': return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
            default: return { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-500/10' };
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
            case 'HIGH': return 'text-rose-400 bg-rose-500/10';
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
            <SecureDroidTopBar title="App Detail" subtitle={app.appName} onBack={onBack} isLight={isLight} />

            <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-zinc-100">{app.appName}</h2>
                                {app.isSystemApp && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">System</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 font-mono">{app.packageName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span>v{app.versionName}</span>
                                <span>•</span>
                                <span>SDK {app.targetSdk}</span>
                                {app.isDebuggable && (
                                    <><span>•</span><span className="text-amber-400">🔧 Debuggable</span></>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${riskInfo.bg} ${riskInfo.color}`}>
                                {riskInfo.label} Risk
                            </div>
                            {risk && (
                                <div className="text-xs text-slate-500 mt-1">{risk.findingCount || 0} findings</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <RiskIcon className={`w-6 h-6 ${riskInfo.color}`} />
                            <div>
                                <div className="text-sm text-slate-400">Security Risk</div>
                                <div className={`text-lg font-bold ${riskInfo.color}`}>{risk?.riskLevel || 'Unknown'}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Score</div>
                            <div className="text-lg font-bold text-zinc-100">{risk?.securityScore ?? 0}</div>
                        </div>
                    </div>
                </div>

                {risk?.findings && risk.findings.length > 0 && (
                    <>
                        <SecureDroidSectionHeader title="Findings" />
                        <div className="space-y-2">
                            {risk.findings.map((finding, index) => (
                                <div key={index} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium text-zinc-200">{finding.title || finding.code}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{finding.description}</div>
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

                <SecureDroidSectionHeader title="Permissions" />
                <div className="space-y-2">
                    {permissions.length === 0 ? (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center text-sm text-slate-400">
                            No permissions declared
                        </div>
                    ) : (
                        permissions.map((perm, index) => {
                            const Icon = perm.icon;
                            return (
                                <div key={index} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${getPermissionRiskColor(perm.risk)} flex items-center justify-center`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-zinc-200">{perm.name}</span>
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
                        })
                    )}
                </div>

                <SecureDroidSectionHeader title="Application Info" />
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Package</span>
                        <span className="text-zinc-200 font-mono text-xs">{app.packageName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Version</span>
                        <span className="text-zinc-200">{app.versionName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Target SDK</span>
                        <span className="text-zinc-200">API {app.targetSdk}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Min SDK</span>
                        <span className="text-zinc-200">API {app.minSdk}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Installed</span>
                        <span className="text-zinc-200">{new Date(app.installTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Updated</span>
                        <span className="text-zinc-200">{new Date(app.updateTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Install Source</span>
                        <span className="text-zinc-200">{app.installSource || 'Unknown'}</span>
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
                    {app.signingCertSha256 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Signing Certificate (SHA-256)</span>
                            <span className="text-zinc-200 font-mono text-[10px] truncate max-w-[120px]">
                                {app.signingCertSha256}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <SecureDroidButton variant="secondary" className="flex-1" icon={ExternalLink}>Open App</SecureDroidButton>
                    <SecureDroidButton variant="secondary" className="flex-1" icon={Share2}>Share</SecureDroidButton>
                </div>
            </div>
        </div>
    );
};

export default AppDetailScreen;
