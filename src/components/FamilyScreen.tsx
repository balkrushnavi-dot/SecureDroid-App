
import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    ShieldOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Plus,
    Trash2,
    Settings,
    Bell,
    Lock,
    Smartphone,
    Wifi,
    Globe,
    Clock,
    Calendar,
    Mail,
    Phone,
    User,
    Edit,
    MoreVertical,
    RefreshCw,
    Info,
    Activity,
    BarChart,
    PieChart
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton
} from './ui/designSystem';

interface FamilyScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface FamilyMember {
    id: string;
    name: string;
    device: string;
    status: 'secure' | 'warning' | 'critical';
    lastSeen: string;
    avatarColor: string;
    permissions: number;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [members] = useState<FamilyMember[]>([
        {
            id: '1',
            name: 'You',
            device: 'Pixel 7 Pro',
            status: 'secure',
            lastSeen: 'Active now',
            avatarColor: 'bg-sky-500',
            permissions: 3
        },
        {
            id: '2',
            name: 'Sarah',
            device: 'Galaxy S23',
            status: 'secure',
            lastSeen: '2 min ago',
            avatarColor: 'bg-emerald-500',
            permissions: 1
        },
        {
            id: '3',
            name: 'John',
            device: 'iPhone 14',
            status: 'warning',
            lastSeen: '15 min ago',
            avatarColor: 'bg-amber-500',
            permissions: 4
        },
        {
            id: '4',
            name: 'Emma',
            device: 'Pixel 6',
            status: 'critical',
            lastSeen: '1 hour ago',
            avatarColor: 'bg-red-500',
            permissions: 6
        },
    ]);

    const familyStats = {
        total: members.length,
        secure: members.filter(m => m.status === 'secure').length,
        warning: members.filter(m => m.status === 'warning').length,
        critical: members.filter(m => m.status === 'critical').length,
        totalRisks: members.reduce((sum, m) => sum + m.permissions, 0)
    };

    const getStatusIcon = (status: FamilyMember['status']) => {
        switch (status) {
            case 'secure': return ShieldCheck;
            case 'warning': return AlertTriangle;
            case 'critical': return XCircle;
            default: return Shield;
        }
    };

    const getStatusColor = (status: FamilyMember['status']) => {
        switch (status) {
            case 'secure': return 'text-emerald-400 bg-emerald-500/10';
            case 'warning': return 'text-amber-400 bg-amber-500/10';
            case 'critical': return 'text-red-400 bg-red-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getStatusLabel = (status: FamilyMember['status']) => {
        switch (status) {
            case 'secure': return 'Protected';
            case 'warning': return 'Needs Review';
            case 'critical': return 'At Risk';
            default: return 'Unknown';
        }
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Family Protection"
                subtitle="Manage family devices"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-slate-100">{familyStats.total}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Members</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-emerald-400">{familyStats.secure}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Secure</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-amber-400">{familyStats.warning}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Warning</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-lg font-bold text-red-400">{familyStats.critical}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Critical</div>
                    </div>
                </div>

                {/* Add Member */}
                <SecureDroidButton onClick={() => {}} icon={UserPlus} className="w-full">
                    Add Family Member
                </SecureDroidButton>

                {/* Members List */}
                <SecureDroidSectionHeader title="Family Members" />

                <div className="space-y-3">
                    {members.map((member) => {
                        const StatusIcon = getStatusIcon(member.status);
                        return (
                            <div key={member.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full ${member.avatarColor} flex items-center justify-center text-white font-bold text-lg`}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-100">{member.name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${getStatusColor(member.status)}`}>
                                                {getStatusLabel(member.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>{member.device}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                {member.lastSeen}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                {member.permissions} issues
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Family Shield */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-sky-400" />
                        <div>
                            <div className="font-semibold text-slate-100">Family Shield</div>
                            <div className="text-sm text-slate-400">
                                {familyStats.secure}/{familyStats.total} devices protected
                            </div>
                        </div>
                        <div className="ml-auto text-right">
                            <div className="text-sm text-slate-400">Risk Level</div>
                            <span className="text-sm font-medium text-amber-400">
                                {familyStats.critical > 0 ? 'Critical' : familyStats.warning > 0 ? 'Warning' : 'Low'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Shared Protection */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-sky-400" />
                        <div>
                            <div className="font-semibold text-slate-100">Shared Protection</div>
                            <div className="text-sm text-slate-400">DNS filtering & blocklists</div>
                        </div>
                        <div className="ml-auto">
                            <span className="text-xs font-medium text-emerald-400">Enabled</span>
                        </div>
                    </div>
                </div>

                {/* Family Activity */}
                <SecureDroidSectionHeader title="Recent Activity" />

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div className="flex-1 text-sm text-slate-300">Sarah's device is secure</div>
                        <span className="text-xs text-slate-500">2 min ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="flex-1 text-sm text-slate-300">John's device needs review</div>
                        <span className="text-xs text-slate-500">15 min ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="flex-1 text-sm text-slate-300">Emma's device has critical risk</div>
                        <span className="text-xs text-slate-500">1 hour ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyScreen;
