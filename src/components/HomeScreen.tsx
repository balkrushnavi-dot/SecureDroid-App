import React from 'react';
import { 
    ShieldCheck, 
    ScrollText, 
    ChevronRight,
    RefreshCw,
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';
import { useSecureDroid } from '../hooks/useSecureDroid';
import { SecureDroidCard, SecureDroidSectionHeader } from './ui/designSystem';

type Screen = 'home' | 'threat_model' | 'app_auditor' | 'security_log' | 'settings';

interface HomeScreenProps {
    onNavigate: (screen: Screen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
    const { apps, risks, loading, connected, error, score, reload } = useSecureDroid();

    // Count high risk apps
    const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

    return (
        <div className="p-4 space-y-4">
            <SecureDroidSectionHeader title="SecureDroid" subtitle="Security for your phone" />
            
            {/* Connection Status */}
            <div className={`p-3 rounded-lg ${connected ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">
                            {connected ? '✅ Plugin Connected' : '❌ Plugin Not Connected'}
                        </span>
                        {loading && <span className="text-sm text-slate-400">Loading...</span>}
                    </div>
                    <button 
                        onClick={reload}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
                {error && (
                    <div className="text-sm text-red-400 mt-1">{error}</div>
                )}
            </div>

            {/* Security Score */}
            {!loading && connected && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-4xl font-bold text-sky-400">{score}</div>
                            <div className="text-sm text-slate-400">Security Score</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Apps</div>
                            <div className="text-lg font-semibold">{apps.length}</div>
                        </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="mt-3 flex items-center gap-2">
                        {score >= 70 ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-green-400">Protected</span>
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-orange-400">Needs Attention</span>
                            </>
                        )}
                        {highRiskCount > 0 && (
                            <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                {highRiskCount} high risk
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 text-center">
                    <div className="animate-pulse">
                        <div className="text-4xl mb-2">🔍</div>
                        <div className="text-slate-400">Scanning your device...</div>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            {!loading && connected && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-2xl font-bold text-slate-100">{apps.length}</div>
                        <div className="text-xs text-slate-400">Total Apps</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-2xl font-bold text-orange-400">{risks.length}</div>
                        <div className="text-xs text-slate-400">Risks Found</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        <div className="text-2xl font-bold text-green-400">
                            {apps.filter(a => !a.isSystemApp).length}
                        </div>
                        <div className="text-xs text-slate-400">User Apps</div>
                    </div>
                </div>
            )}

            {/* Navigation Cards */}
            {!loading && (
                <>
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Security Tools</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => onNavigate('app_auditor')}
                                className="w-full text-left"
                            >
                                <SecureDroidCard>
                                    <div className="flex items-center gap-3 p-1">
                                        <div className="rounded-lg bg-sky-500/10 p-2">
                                            <ShieldCheck className="w-5 h-5 text-sky-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-100">App Security Auditor</div>
                                            <div className="text-sm text-slate-400">
                                                {risks.length > 0 
                                                    ? `⚠️ ${risks.length} issues found` 
                                                    : '✅ All apps look safe'}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600" />
                                    </div>
                                </SecureDroidCard>
                            </button>

                            <button
                                onClick={() => onNavigate('threat_model')}
                                className="w-full text-left"
                            >
                                <SecureDroidCard>
                                    <div className="flex items-center gap-3 p-1">
                                        <div className="rounded-lg bg-purple-500/10 p-2">
                                            <ShieldAlert className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-100">Threat Model Center</div>
                                            <div className="text-sm text-slate-400">
                                                {highRiskCount > 0 
                                                    ? `🔴 ${highRiskCount} high risk threats` 
                                                    : '🟢 No high risk threats'}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600" />
                                    </div>
                                </SecureDroidCard>
                            </button>

                            <button
                                onClick={() => onNavigate('security_log')}
                                className="w-full text-left"
                            >
                                <SecureDroidCard>
                                    <div className="flex items-center gap-3 p-1">
                                        <div className="rounded-lg bg-amber-500/10 p-2">
                                            <ScrollText className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-100">Security Audit Log</div>
                                            <div className="text-sm text-slate-400">View security events timeline</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600" />
                                    </div>
                                </SecureDroidCard>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Debug Info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 font-mono space-y-1">
                        <div>Debug Info:</div>
                        <div>• Apps: {apps.length}</div>
                        <div>• Risks: {risks.length}</div>
                        <div>• Connected: {connected ? 'Yes' : 'No'}</div>
                        <div>• Score: {score}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeScreen;
