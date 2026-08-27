import React, { useState } from 'react';
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
    Info
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidSearchBar
} from './ui/designSystem';

interface PrivacyRadarScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface PermissionUsage {
    id: string;
    appName: string;
    packageName: string;
    permission: string;
    permissionIcon: React.ElementType;
    lastUsed: string;
    usageCount: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    isSystemApp: boolean;
}

export const PrivacyRadarScreen: React.FC<PrivacyRadarScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');

    // Mock data for UI demonstration
    const permissionUsageData: PermissionUsage[] = [
        {
            id: '1',
            appName: 'Google Maps',
            packageName: 'com.google.android.apps.maps',
            permission: 'Location',
            permissionIcon: MapPin,
            lastUsed: '2 min ago',
            usageCount: 47,
            riskLevel: 'HIGH',
            isSystemApp: true
        },
        {
            id: '2',
            appName: 'WhatsApp',
            packageName: 'com.whatsapp',
            permission: 'Camera',
            permissionIcon: Camera,
            lastUsed: '15 min ago',
            usageCount: 12,
            riskLevel: 'HIGH',
            isSystemApp: false
        },
        {
            id: '3',
            appName: 'Google Photos',
            packageName: 'com.google.android.apps.photos',
            permission: 'Storage',
            permissionIcon: Image,
            lastUsed: '1 hour ago',
            usageCount: 89,
            riskLevel: 'MEDIUM',
            isSystemApp: true
        },
        {
            id: '4',
            appName: 'Snapchat',
            packageName: 'com.snapchat.android',
            permission: 'Camera',
            permissionIcon: Camera,
            lastUsed: '3 hours ago',
            usageCount: 8,
            riskLevel: 'HIGH',
            isSystemApp: false
        },
        {
            id: '5',
            appName: 'Instagram',
            packageName: 'com.instagram.android',
            permission: 'Camera',
            permissionIcon: Camera,
            lastUsed: '5 hours ago',
            usageCount: 15,
            riskLevel: 'MEDIUM',
            isSystemApp: false
        },
        {
            id: '6',
            appName: 'Facebook',
            packageName: 'com.facebook.katana',
            permission: 'Microphone',
            permissionIcon: Mic,
            lastUsed: '6 hours ago',
            usageCount: 3,
            riskLevel: 'HIGH',
            isSystemApp: false
        },
        {
            id: '7',
            appName: 'Chrome',
            packageName: 'com.android.chrome',
            permission: 'Location',
            permissionIcon: MapPin,
            lastUsed: '8 hours ago',
            usageCount: 22,
            riskLevel: 'MEDIUM',
            isSystemApp: true
        },
        {
            id: '8',
            appName: 'Spotify',
            packageName: 'com.spotify.music',
            permission: 'Microphone',
            permissionIcon: Mic,
            lastUsed: '12 hours ago',
            usageCount: 1,
            riskLevel: 'LOW',
            isSystemApp: false
        },
    ];

    const filters = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'CAMERA', 'MICROPHONE', 'LOCATION', 'STORAGE'];

    const filteredData = permissionUsageData.filter(item => {
        const matchesSearch = item.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.packageName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'ALL' ||
            item.riskLevel === selectedFilter ||
            item.permission.toUpperCase() === selectedFilter;
        return matchesSearch && matchesFilter;
    });

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

    const totalPermissions = permissionUsageData.length;
    const highRiskCount = permissionUsageData.filter(d => d.riskLevel === 'HIGH').length;
    const highRiskApps = new Set(permissionUsageData.filter(d => d.riskLevel === 'HIGH').map(d => d.appName)).size;

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Privacy Radar"
                subtitle="Track app permission usage"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
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
                        <div className="text-lg font-bold text-amber-400">{highRiskApps}</div>
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
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${selectedFilter === filter
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                        : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:border-slate-600'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permission Usage List */}
                <SecureDroidSectionHeader title="Permission Usage" />

                <div className="space-y-2">
                    {filteredData.length === 0 ? (
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center">
                            <EyeOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No permission usage found</p>
                            <p className="text-xs text-slate-500">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        filteredData.map((item) => {
                            const PermissionIcon = item.permissionIcon;
                            return (
                                <div key={item.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${getRiskColor(item.riskLevel)} flex items-center justify-center`}>
                                            <PermissionIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-100 text-sm">{item.appName}</span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getRiskColor(item.riskLevel)}`}>
                                                    {getRiskLabel(item.riskLevel)}
                                                </span>
                                                {item.isSystemApp && (
                                                    <span className="text-[9px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded-full">System</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span>{item.permission}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {item.lastUsed}
                                                </span>
                                                <span>•</span>
                                                <span>{item.usageCount} uses</span>
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
                            <div className="text-2xl font-bold text-slate-100">78</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Status</div>
                            <span className="text-sm font-medium text-amber-400">Needs Review</span>
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
                                    {highRiskApps} app{highRiskApps > 1 ? 's' : ''} with high-risk permissions
                                </p>
                                <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                    Review apps that have access to sensitive data like location, camera, and microphone.
                                    Consider removing permissions for apps that don't need them.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivacyRadarScreen;
