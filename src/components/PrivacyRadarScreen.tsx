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
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
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
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidSearchBar,
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';
import type { AppInfo } from '../hooks/useSecureDroid';

interface PrivacyRadarScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

// Permission categorization (same as used in AppDetailScreen)
const PERMISSION_MAP: Record<string, { name: string; icon: React.ElementType; risk: 'LOW' | 'MEDIUM' | 'HIGH'; category: string }> = {
    'android.permission.CAMERA': { name: 'Camera', icon: Camera, risk: 'HIGH', category: 'CAMERA' },
    'android.permission.RECORD_AUDIO': { name: 'Microphone', icon: Mic, risk: 'HIGH', category: 'MICROPHONE' },
    'android.permission.ACCESS_FINE_LOCATION': { name: 'Precise Location', icon: MapPin, risk: 'HIGH', category: 'LOCATION' },
    'android.permission.ACCESS_COARSE_LOCATION': { name: 'Approximate Location', icon: MapPin, risk: 'MEDIUM', category: 'LOCATION' },
    'android.permission.ACCESS_BACKGROUND_LOCATION': { name: 'Background Location', icon: MapPin, risk: 'HIGH', category: 'LOCATION' },
    'android.permission.READ_CONTACTS': { name: 'Read Contacts', icon: Users, risk: 'HIGH', category: 'CONTACTS' },
    'android.permission.WRITE_CONTACTS': { name: 'Write Contacts', icon: Users, risk: 'HIGH', category: 'CONTACTS' },
    'android.permission.READ_CALENDAR': { name: 'Read Calendar', icon: Calendar, risk: 'MEDIUM', category: 'CALENDAR' },
    'android.permission.WRITE_CALENDAR': { name: 'Write Calendar', icon: Calendar, risk: 'MEDIUM', category: 'CALENDAR' },
    'android.permission.READ_SMS': { name: 'Read SMS', icon: MessageSquare, risk: 'HIGH', category: 'SMS' },
    'android.permission.SEND_SMS': { name: 'Send SMS', icon: MessageSquare, risk: 'HIGH', category: 'SMS' },
    'android.permission.RECEIVE_SMS': { name: 'Receive SMS', icon: MessageSquare, risk: 'HIGH', category: 'SMS' },
    'android.permission.READ_CALL_LOG': { name: 'Read Call Log', icon: Phone, risk: 'HIGH', category: 'PHONE' },
    'android.permission.WRITE_CALL_LOG': { name: 'Write Call Log', icon: Phone, risk: 'HIGH', category: 'PHONE' },
    'android.permission.CALL_PHONE': { name: 'Directly Call Phone', icon: Phone, risk: 'HIGH', category: 'PHONE' },
    'android.permission.READ_PHONE_STATE': { name: 'Phone State', icon: Phone, risk: 'MEDIUM', category: 'PHONE' },
    'android.permission.READ_PHONE_NUMBERS': { name: 'Phone Numbers', icon: Phone, risk: 'MEDIUM', category: 'PHONE' },
    'android.permission.READ_EXTERNAL_STORAGE': { name: 'Read External Storage', icon: Database, risk: 'MEDIUM', category: 'STORAGE' },
    'android.permission.WRITE_EXTERNAL_STORAGE': { name: 'Write External Storage', icon: Database, risk: 'MEDIUM', category: 'STORAGE' },
    'android.permission.READ_MEDIA_IMAGES': { name: 'Read Images', icon: Image, risk: 'LOW', category: 'STORAGE' },
    'android.permission.READ_MEDIA_VIDEO': { name: 'Read Videos', icon: Image, risk: 'LOW', category: 'STORAGE' },
    'android.permission.READ_MEDIA_AUDIO': { name: 'Read Audio', icon: FileText, risk: 'LOW', category: 'STORAGE' },
    'android.permission.BODY_SENSORS': { name: 'Body Sensors', icon: Activity, risk: 'MEDIUM', category: 'SENSORS' },
    'android.permission.ACTIVITY_RECOGNITION': { name: 'Activity Recognition', icon: Activity, risk: 'LOW', category: 'SENSORS' },
    'android.permission.POST_NOTIFICATIONS': { name: 'Post Notifications', icon: Bell, risk: 'LOW', category: 'NOTIFICATIONS' },
    'android.permission.SYSTEM_ALERT_WINDOW': { name: 'Draw Over Other Apps', icon: Eye, risk: 'HIGH', category: 'SYSTEM' },
    'android.permission.REQUEST_INSTALL_PACKAGES': { name: 'Install Packages', icon: Package, risk: 'HIGH', category: 'SYSTEM' },
    'android.permission.WRITE_SECURE_SETTINGS': { name: 'Write Secure Settings', icon: Settings, risk: 'HIGH', category: 'SYSTEM' },
    'android.permission.BIND_ACCESSIBILITY_SERVICE': { name: 'Accessibility Service', icon: Eye, risk: 'HIGH', category: 'SYSTEM' },
    'android.permission.BIND_DEVICE_ADMIN': { name: 'Device Administrator', icon: Shield, risk: 'HIGH', category: 'SYSTEM' },
};

// Default for unknown
const DEFAULT_PERM = { name: 'Unknown Permission', icon: Shield, risk: 'LOW' as const, category: 'OTHER' };

// Helper to get permission info, fallback to default
function getPermissionInfo(perm: string) {
    return PERMISSION_MAP[perm] || DEFAULT_PERM;
}

// UI state
type FilterType = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CAMERA' | 'MICROPHONE' | 'LOCATION' | 'CONTACTS' | 'SMS' | 'PHONE' | 'STORAGE' | 'SYSTEM';

export const PrivacyRadarScreen: React.FC<PrivacyRadarScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, loading, connected, error, reload } = useSecureDroid();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

    // Only consider user apps
    const userApps = useMemo(() => apps.filter(a => !a.isSystemApp), [apps]);

    // Build permission usage list
    const permissionItems = useMemo(() => {
        const items: {
            id: string;
            appName: string;
            packageName: string;
            permission: string;
            permissionName: string;
            permissionIcon: React.ElementType;
            risk: 'LOW' | 'MEDIUM' | 'HIGH';
            category: string;
            granted: boolean;
            isSystemApp: boolean;
        }[] = [];

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
                    isSystemApp: app.isSystemApp,
                });
            }
        }
        return items;
    }, [userApps]);

    // Stats
    const totalPermissions = permissionItems.length;
    const highRiskCount = permissionItems.filter(i => i.risk === 'HIGH').length;
    const mediumRiskCount = permissionItems.filter(i => i.risk === 'MEDIUM').length;
    const lowRiskCount = permissionItems.filter(i => i.risk === 'LOW').length;

    // Apps with at least one high-risk permission
    const riskyAppsSet = new Set<string>();
    for (const item of permissionItems) {
        if (item.risk === 'HIGH') {
            riskyAppsSet.add(item.packageName);
        }
    }
    const riskyAppsCount = riskyAppsSet.size;

    // Filter and search
    const filteredItems = useMemo(() => {
        let result = permissionItems;
        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.appName.toLowerCase().includes(q) ||
                item.permissionName.toLowerCase().includes(q) ||
                item.packageName.toLowerCase().includes(q)
            );
        }
        // Filter
        if (selectedFilter !== 'ALL') {
            if (['HIGH', 'MEDIUM', 'LOW'].includes(selectedFilter)) {
                result = result.filter(item => item.risk === selectedFilter);
            } else {
                // Category filter
                result = result.filter(item => item.category === selectedFilter);
            }
        }
        return result;
    }, [permissionItems, searchQuery, selectedFilter]);

    // Available filter options
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

    // Compute privacy score: start at 100, deduct for each granted high-risk and medium-risk permission
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
            case 'HIGH': return 'text-red-400 bg-red-500/10';
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

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Privacy Radar"
                subtitle="Track permission usage by app"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-slate-100">{totalPermissions}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Uses</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className={`text-lg font-bold ${highRiskCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {highRiskCount}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">High Risk</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-amber-400">{mediumRiskCount}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Medium Risk</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-slate-100">{riskyAppsCount}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risky Apps</div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="space-y-2">
                    <SecureDroidSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search apps or permissions..."
                        isLight={isLight}
                        onClear={() => setSearchQuery('')}
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                                    selectedFilter === opt.value
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                        : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permission Usage List */}
                <SecureDroidSectionHeader title="Permission Usage" />

                <div className="space-y-2">
                    {filteredItems.length === 0 ? (
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center">
                            <EyeOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No permission usage found</p>
                            <p className="text-xs text-slate-500">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const Icon = item.permissionIcon;
                            return (
                                <div key={item.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${getRiskColor(item.risk)} flex items-center justify-center`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-100 text-sm">{item.appName}</span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getRiskColor(item.risk)}`}>
                                                    {getRiskLabel(item.risk)}
                                                </span>
                                                {item.isSystemApp && (
                                                    <span className="text-[9px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded-full">System</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span>{item.permissionName}</span>
                                                <span>•</span>
                                                <span>{item.granted ? '✅ Granted' : '📝 Declared'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Privacy Score */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-400">Privacy Score</div>
                            <div className={`text-2xl font-bold ${privacyScore >= 70 ? 'text-emerald-400' : privacyScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                {privacyScore}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Status</div>
                            <span className={`text-sm font-medium ${privacyScore >= 70 ? 'text-emerald-400' : privacyScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                {privacyScore >= 70 ? 'Good' : privacyScore >= 40 ? 'Needs Review' : 'At Risk'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                {highRiskCount > 0 && (
                    <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-800/30">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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

                <SecureDroidButton
                    onClick={reload}
                    disabled={loading}
                    className="w-full"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh'}
                </SecureDroidButton>
            </div>
        </div>
    );
};

export default PrivacyRadarScreen;
