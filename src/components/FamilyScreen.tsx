import React from 'react';
import {
    Users,
    Shield,
    Clock,
    ChevronRight,
    Info,
    Smartphone,
    Wifi,
    Lock,
    Bell,          // ← added
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidButton,
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
        <div
            className={`min-h-full pb-24 transition-colors ${
                isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
            }`}
        >
            <SecureDroidTopBar
                title="Family Protection"
                subtitle="Coming soon"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                <SecureDroidCard
                    isLight={isLight}
                    highlight
                    className="p-8 text-center"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center">
                            <Users className="w-10 h-10 text-sky-400" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-100">
                            Family Protection
                        </h2>

                        <p className="text-sm text-slate-400 max-w-xs">
                            This feature is coming in a future update.
                        </p>

                        <div className="mt-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-left w-full max-w-sm">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Family Protection will allow you to:
                            </p>
                            <ul className="mt-2 space-y-1 text-xs text-slate-300">
                                <li className="flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-sky-400" />
                                    Monitor security across multiple devices
                                </li>
                                <li className="flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-sky-400" />
                                    Share DNS filtering policies
                                </li>
                                <li className="flex items-center gap-2">
                                    <Bell className="w-3 h-3 text-sky-400" />
                                    Receive alerts for new app installations
                                </li>
                                <li className="flex items-center gap-2">
                                    <Smartphone className="w-3 h-3 text-sky-400" />
                                    Manage family device permissions
                                </li>
                            </ul>
                        </div>

                        <div className="mt-2 p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 w-full max-w-sm">
                            <div className="flex items-start gap-2 text-xs text-amber-400/80">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                    This feature is planned for a future release.
                                    Stay tuned for updates.
                                </span>
                            </div>
                        </div>

                        <SecureDroidButton
                            onClick={onBack}
                            variant="secondary"
                            className="mt-2"
                        >
                            Back to Dashboard
                        </SecureDroidButton>
                    </div>
                </SecureDroidCard>
            </div>
        </div>
    );
};

export default FamilyScreen;
