import React from 'react';
import {
    Users,
    Shield,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
    Clock,
    ChevronRight,
    Info,
    Smartphone,
    Wifi,
    Lock,
    Bell,
    UserPlus,
    Settings,
    Globe,
    Database,
    Server,
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Zap,
    Sparkles,
    Gift,
    Star,
    Award,
    Heart,
    Home,
    Calendar,
    Mail,
    Phone,
    User,
    Edit,
    MoreVertical,
    RefreshCw,
    BarChart,
    PieChart,
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

interface FamilyScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-slate-950 text-zinc-100'}`}>
            <SecureDroidTopBar title="Family Protection" subtitle="Coming soon" onBack={onBack} isLight={isLight} />

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900/30 p-8 rounded-2xl border border-slate-700/50 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-100">Family Protection</h2>
                        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">This feature is coming in a future update.</p>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            <span className="text-xs font-medium text-sky-400">In Development</span>
                        </div>
                    </div>
                </div>

                <SecureDroidSectionHeader title="What's Coming" isLight={isLight} />

                <div className="space-y-2.5">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0"><Shield className="w-4 h-4 text-sky-400" /></div>
                            <div><p className="text-sm font-medium text-zinc-200">Device Monitoring</p><p className="text-xs text-slate-400 mt-0.5">Monitor security across multiple devices in your family</p></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><Lock className="w-4 h-4 text-emerald-400" /></div>
                            <div><p className="text-sm font-medium text-zinc-200">Shared Protection</p><p className="text-xs text-slate-400 mt-0.5">Share DNS filtering policies and blocklists across devices</p></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0"><Bell className="w-4 h-4 text-amber-400" /></div>
                            <div><p className="text-sm font-medium text-zinc-200">Real-time Alerts</p><p className="text-xs text-slate-400 mt-0.5">Receive alerts for new app installations and security events</p></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0"><Smartphone className="w-4 h-4 text-purple-400" /></div>
                            <div><p className="text-sm font-medium text-zinc-200">Multi-Device Management</p><p className="text-xs text-slate-400 mt-0.5">Manage permissions and security settings across all devices</p></div>
                        </div>
                    </div>
                </div>

                <SecureDroidSectionHeader title="Preview" isLight={isLight} />

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
                        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sm font-bold text-sky-400">Y</div>
                        <div className="flex-1"><p className="text-sm font-medium text-zinc-200">You</p><p className="text-xs text-slate-400">Pixel 7 Pro • Protected</p></div>
                        <SecureDroidStatusChip status="PROTECTED" isLight={isLight} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20 mt-2 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">S</div>
                        <div className="flex-1"><p className="text-sm font-medium text-zinc-400">Sarah</p><p className="text-xs text-slate-500">Galaxy S23 • Invite pending</p></div>
                        <span className="text-xs text-slate-500">⏳ Pending</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20 mt-2 opacity-40">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">J</div>
                        <div className="flex-1"><p className="text-sm font-medium text-zinc-500">John</p><p className="text-xs text-slate-500">iPhone 14 • Invite sent</p></div>
                        <span className="text-xs text-slate-500">📨 Sent</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-amber-950/10 border-amber-800/30">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-400">Coming in a future update</p>
                            <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">Family Protection is currently in development. We're building a secure way to monitor and protect your entire family's devices. Stay tuned for updates.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <SecureDroidButton onClick={() => alert('This feature is coming soon. Stay tuned!')} className="flex-1" icon={Bell}>Notify Me When Ready</SecureDroidButton>
                    <SecureDroidButton onClick={onBack} variant="secondary" className="flex-1">Back to Dashboard</SecureDroidButton>
                </div>

                <div className="text-center text-[10px] text-slate-500 pt-2">Family Protection • v1.0.0 (Coming Soon)</div>
            </div>
        </div>
    );
};

export default FamilyScreen;
