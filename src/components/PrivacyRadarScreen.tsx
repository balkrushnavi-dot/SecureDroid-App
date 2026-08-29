import React, { useState, useMemo } from 'react';
import {
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
    Search,
    Filter,
    RefreshCw,
    Activity,
    Wifi,
    Bluetooth,
    Database,
    Server,
    Smartphone,
    Lock,
    Unlock,
    Info,
    Zap,
    Globe,
    User,
    Bell,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidSearchBar,
    SecureDroidBadge,
    SecureDroidStatCard,
    SecureDroidProgressRing,
    SecureDroidGlassCard,
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';
import type { AppInfo } from '../hooks/useSecureDroid';

interface PrivacyRadarScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

const PERMISSION_MAP: Record<string, { name: string; icon: React.ElementType; risk: 'LOW' | 'MEDIUM' | 'HIGH'; category: string; description: string }> = {
    'android.permission.CAMERA': { name: 'Camera', icon: Camera, risk: 'HIGH', category: 'CAMERA', description: 'Take photos and videos' },
    'android.permission.RECORD_AUDIO': { name: 'Microphone', icon: Mic, risk: 'HIGH', category: 'MICROPHONE', description: 'Record audio' },
    'android.permission.ACCESS_FINE_LOCATION': { name: 'Precise Location', icon: MapPin, risk: 'HIGH', category: 'LOCATION', description: 'Access precise location' },
    'android.permission.ACCESS_COARSE_LOCATION': { name: 'Approximate Location', icon: MapPin, risk: 'MEDIUM', category: 'LOCATION', description: 'Access approximate location' },
    'android.permission.ACCESS_BACKGROUND_LOCATION': { name: 'Background Location', icon: MapPin, risk: 'HIGH', category: 'LOCATION', description: 'Access location in background' },
    'android.permission.READ_CONTACTS': { name: 'Read Contacts', icon: Users, risk: 'HIGH', category: 'CONTACTS', description: 'Read your contacts' },
    'android.permission.WRITE_CONTACTS': { name: 'Write Contacts', icon: Users, risk: 'HIGH', category: 'CONTACTS', description: 'Modify your contacts' },
    'android.permission.READ_CALENDAR': { name: 'Read Calendar', icon: Calendar, risk: 'MEDIUM', category: 'CALENDAR', description: 'Read calendar events' },
    'android.permission.WRITE_CALENDAR': { name: 'Write Calendar', icon: Calendar, risk: 'MEDIUM', category: 'CALENDAR', description: 'Modify calendar events' },
    'android.permission.READ_SMS': { name: 'Read SMS', icon: MessageSquare, risk: 'HIGH', category: 'SMS', description: 'Read SMS messages' },
    'android.permission.SEND_SMS': { name: 'Send SMS', icon: MessageSquare, risk: 'HIGH', category: 'SMS', description: 'Send SMS messages' },
    'android.permission.RECEIVE_SMS': { name: 'Receive SMS', icon: MessageSquare, risk: 'HIGH', category: 'SMS', description: 'Intercept incoming SMS' },
    'android.permission.READ_CALL_LOG': { name: 'Read Call Log', icon: Phone, risk: 'HIGH', category: 'PHONE', description: 'Read call history' },
    'android.permission.WRITE_CALL_LOG': { name: 'Write Call Log', icon: Phone, risk: 'HIGH', category: 'PHONE', description: 'Modify call history' },
    'android.permission.CALL_PHONE': { name: 'Directly Call Phone', icon: Phone, risk: 'HIGH', category: 'PHONE', description: 'Directly call phone numbers' },
    'android.permission.READ_PHONE_STATE': { name: 'Phone State', icon: Phone, risk: 'MEDIUM', category: 'PHONE', description: 'Read phone status and identity' },
    'android.permission.READ_PHONE_NUMBERS': { name: 'Phone Numbers', icon: Phone, risk: 'MEDIUM', category: 'PHONE', description: 'Read phone numbers' },
    'android.permission.READ_EXTERNAL_STORAGE': { name: 'Read External Storage', icon: Database, risk: 'MEDIUM', category: 'STORAGE', description: 'Read files on external storage' },
    'android.permission.WRITE_EXTERNAL_STORAGE': { name: 'Write External Storage', icon: Database, risk: 'MEDIUM', category: 'STORAGE', description: 'Write files on external storage' },
    'android.permission.READ_MEDIA_IMAGES': { name: 'Read Images', icon: Image, risk: 'LOW', category: 'STORAGE', description: 'Read images from media store' },
    'android.permission.READ_MEDIA_VIDEO': { name: 'Read Videos', icon: Image, risk: 'LOW', category: 'STORAGE', description: 'Read videos from media store' },
    'android.permission.READ_MEDIA_AUDIO': { name: 'Read Audio', icon: FileText, risk: 'LOW', category: 'STORAGE', description: 'Read audio files from media store' },
    'android.permission.BODY_SENSORS': { name: 'Body Sensors', icon: Activity, risk: 'MEDIUM', category: 'SENSORS', description: 'Access body sensor data' },
    'android.permission.ACTIVITY_RECOGNITION': { name: 'Activity Recognition', icon: Activity, risk: 'LOW', category: 'SENSORS', description: 'Recognize physical activity' },
    'android.permission.POST_NOTIFICATIONS': { name: 'Post Notifications', icon: Bell, risk: 'LOW', category: 'NOTIFICATIONS', description: 'Show notifications' },
    'android.permission.SYSTEM_ALERT_WINDOW': { name: 'Draw Over Other Apps', icon: Eye, risk: 'HIGH', category: 'SYSTEM', description: 'Display overlay windows' },
    'android.permission.REQUEST_INSTALL_PACKAGES': { name: 'Install Packages', icon: Package, risk: 'HIGH', category: 'SYSTEM', description: 'Install other applications' },
    'android.permission.WRITE_SECURE_SETTINGS': { name: 'Write Secure Settings', icon: Settings, risk: 'HIGH', category: 'SYSTEM', description: 'Modify protected system settings' },
    'android.permission.BIND_ACCESSIBILITY_SERVICE': { name: 'Accessibility Service', icon: Eye, risk: 'HIGH', category: 'SYSTEM', description: 'Control screen via accessibility' },
    'android.permission.BIND_DEVICE_ADMIN': { name: 'Device Administrator', icon: Shield, risk: 'HIGH', category: 'SYSTEM', description: 'Request device admin privileges' },
};

const DEFAULT_PERM = { name: 'Unknown Permission', icon: Shield, risk: 'LOW' as const, category: 'OTHER', description: 'This permission is not recognized' };

function getPermissionInfo(perm: string) {
    return PERMISSION_MAP[perm] || DEFAULT_PERM;
}

type FilterType = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CAMERA' | 'MICROPHONE' | 'LOCATION' | 'CONTACTS' | 'SMS' | 'PHONE' | 'STORAGE' | 'SYSTEM';

export const PrivacyRadarScreen: React.FC<PrivacyRadarScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, risks, loading, connected, error, reload } = useSecureDroid();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
    const [expandedApp, setExpandedApp] = useState<string | null>(null);

    const userApps = useMemo(() => apps.filter(app => !app.isSystemApp), [apps]);

    const permissionItems = useMemo(() => {
        const items: any[] = [];
        for (const app of userApps) {
            const requested = app.requestedPermissions || [];
            const grantedSet = new Set(app.grantedPermissions || []);
            for (const perm of requested) {
                const info = getPermissionInfo(perm);
                items.push({
                    id: `${app.packageName}-${perm}`,
                    appName: app.appName,
                    packageName: app.packageName,
                    permission: perm,
                    permissionName: info.name,
                    permissionIcon: info.icon,
                    risk: info.risk,
                    category: info.category,
                    granted: grantedSet.has(perm),
                    description: info.description,
                    isSystemApp: app.isSystemApp,
                });
            }
        }
        return items;
    }, [userApps]);

    const totalPermissions = permissionItems.length;
    const highRiskCount = permissionItems.filter(i => i.risk === 'HIGH').length;
    const mediumRiskCount = permissionItems.filter(i => i.risk === 'MEDIUM').length;
    const lowRiskCount = permissionItems.filter(i => i.risk === 'LOW').length;

    const riskyAppsSet = new Set<string>();
    for (const item of permissionItems) {
        if (item.risk === 'HIGH') {
            riskyAppsSet.add(item.packageName);
        }
    }
    const riskyAppsCount = riskyAppsSet.size;

    const filteredItems = useMemo(() => {
        let result = permissionItems;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.appName.toLowerCase().includes(q) ||
                item.permissionName.toLowerCase().includes(q) ||
                item.packageName.toLowerCase().includes(q)
            );
        }
        if (selectedFilter !== 'ALL') {
            if (['HIGH', 'MEDIUM', 'LOW'].includes(selectedFilter)) {
                result = result.filter(item => item.risk === selectedFilter);
            } else {
                result = result.filter(item => item.category === selectedFilter);
            }
        }
        return result;
    }, [permissionItems, searchQuery, selectedFilter]);

    const groupedByApp = useMemo(() => {
        const groups: Record<string, typeof permissionItems> = {};
        for (const item of filteredItems) {
            if (!groups[item.packageName]) {
                groups[item.packageName] = [];
            }
            groups[item.packageName].push(item);
        }
        return groups;
    }, [filteredItems]);

    const filterOptions: { value: FilterType; label: string }[] = [
        { value: 'ALL', label: 'ALL' },
        { value: 'HIGH', label: 'HIGH' },
        { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'LOW', label: 'LOW' },
        { value: 'CAMERA', label: 'CAMERA' },
        { value: 'MICROPHONE', label: 'MICROPHONE' },
        { value: 'LOCATION', label: 'LOCATION' },
        { value: 'CONTACTS', label: 'CONTACTS' },
        { value: 'SMS', label: 'SMS' },
        { value: 'PHONE', label: 'PHONE' },
        { value: 'STORAGE', label: 'STORAGE' },
        { value: 'SYSTEM', label: 'SYSTEM' },
    ];

    const privacyScore = useMemo(() => {
        let score = 100;
        for (const item of permissionItems) {
            if (!item.granted) continue;
            if (item.risk === 'HIGH') score -= 5;
            else if (item.risk === 'MEDIUM') score -= 2;
        }
        return Math.max(0, Math.min(100, score));
    }, [permissionItems]);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'HIGH': return 'text-rose-400 bg-rose-500/10';
            case 'MEDIUM': return 'text-amber-400 bg-amber-500/10';
            case 'LOW': return 'text-emerald-400 bg-emerald-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getRiskLabel = (risk: string) => {
        switch (risk) {
            case 'HIGH': return 'High';
            case 'MEDIUM': return 'Medium';
            case 'LOW': return 'Low';
            default: return 'Unknown';
        }
    };

    const toggleExpanded = (packageName: string) => {
        setExpandedApp(expandedApp === packageName ? null : packageName);
    };

    const getAppRiskLevel = (packageName: string) => {
        const risk = risks.find(r => r.packageName === packageName);
        return risk?.riskLevel || 'LOW';
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Privacy Radar"
                subtitle="Track app permission usage"
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
                <div className="grid grid-cols-4 gap-2">
                    <SecureDroidStatCard label="Total" value={totalPermissions} icon={Database} color="slate" />
                    <SecureDroidStatCard label="High" value={highRiskCount} icon={AlertTriangle} color={highRiskCount > 0 ? 'rose' : 'emerald'} />
                    <SecureDroidStatCard label="Medium" value={mediumRiskCount} icon={AlertTriangle} color={mediumRiskCount > 0 ? 'amber' : 'emerald'} />
                    <SecureDroidStatCard label="Low" value={lowRiskCount} icon={CheckCircle2} color="emerald" />
                </div>

                <SecureDroidGlassCard className="p-4">
                    <div className="flex items-center gap-6">
                        <SecureDroidProgressRing value={privacyScore} size={64} strokeWidth={6} color={privacyScore >= 70 ? 'emerald' : privacyScore >= 40 ? 'amber' : 'rose'}>
                            <span className="text-xl font-bold text-zinc-100">{privacyScore}</span>
                        </SecureDroidProgressRing>
                        <div>
                            <div className="text-sm text-slate-400">Privacy Score</div>
                            <div className={`text-lg font-semibold ${privacyScore >= 70 ? 'text-emerald-400' : privacyScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {privacyScore >= 70 ? 'Good' : privacyScore >= 40 ? 'Needs Review' : 'At Risk'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {riskyAppsCount} app{riskyAppsCount > 1 ? 's' : ''} with high-risk permissions
                            </div>
                        </div>
                    </div>
                </SecureDroidGlassCard>

                <SecureDroidSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search apps or permissions..."
                    isLight={isLight}
                    onClear={() => setSearchQuery('')}
                />

                <div className="flex gap-1 overflow-x-auto pb-1">
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedFilter(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${selectedFilter === opt.value ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:border-slate-600'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <SecureDroidSectionHeader title="Permission Usage" isLight={isLight} />

                <div className="space-y-3">
                    {Object.keys(groupedByApp).length === 0 ? (
                        <div className="p-12 text-center">
                            <EyeOff className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-lg font-medium">No permissions found</p>
                            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        Object.entries(groupedByApp).map(([packageName, items]) => {
                            const app = userApps.find(a => a.packageName === packageName);
                            const appName = app?.appName || packageName;
                            const isExpanded = expandedApp === packageName;
                            const appRisk = getAppRiskLevel(packageName);

                            return (
                                <SecureDroidCard
                                    key={packageName}
                                    className="p-0 overflow-hidden"
                                    isLight={isLight}
                                >
                                    <div
                                        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                                        onClick={() => toggleExpanded(packageName)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0">
                                                <Smartphone className="w-5 h-5 text-slate-400" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-100 text-sm truncate">
                                                        {appName}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getRiskColor(appRisk)}`}>
                                                        {appRisk}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                                        {items.length} permissions
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-mono truncate">
                                                    {packageName}
                                                </p>
                                            </div>

                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-2 border-t border-slate-800/50 space-y-1.5">
                                            {items.map((item) => {
                                                const Icon = item.permissionIcon;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800"
                                                    >
                                                        <div className={`w-7 h-7 rounded-full ${getRiskColor(item.risk)} flex items-center justify-center shrink-0`}>
                                                            <Icon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-zinc-200">
                                                                    {item.permissionName}
                                                                </span>
                                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${getRiskColor(item.risk)}`}>
                                                                    {getRiskLabel(item.risk)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-400">{item.description}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            {item.granted ? (
                                                                <span className="text-xs text-emerald-400">Granted</span>
                                                            ) : (
                                                                <span className="text-xs text-amber-400">Declared</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </SecureDroidCard>
                            );
                        })
                    )}
                </div>

                {highRiskCount > 0 && (
                    <div className="p-4 rounded-xl border bg-amber-950/20 border-amber-800/30">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-400">
                                    {riskyAppsCount} app{riskyAppsCount > 1 ? 's' : ''} with high-risk permissions
                                </p>
                                <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                    Review apps that have access to sensitive data like location, camera, and microphone.
                                    Consider removing permissions for apps that don't need them.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center text-[10px] text-slate-500 pt-2">
                    {Object.keys(groupedByApp).length} apps with {filteredItems.length} permissions
                </div>
            </div>
        </div>
    );
};

export default PrivacyRadarScreen;
