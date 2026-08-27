import React, { useState, useMemo } from 'react';
import { ShieldCheck, ScrollText, LayoutGrid, Settings as SettingsIcon, ChevronRight, Info, Wifi } from 'lucide-react';
import { useSecureDroid } from './hooks/useSecureDroid';
import { ThreatModelCenterScreen } from './components/security/ThreatModelCenterScreen';
import { SecurityAuditLogScreen } from './components/security/SecurityAuditLogScreen';
import { AppSecurityAuditorScreen } from './components/security/AppSecurityAuditorScreen';
import { NetworkControlScreen } from './components/NetworkControlScreen';

import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSectionHeader
} from './components/ui/designSystem';

type Screen = 'home' | 'threat_model' | 'app_auditor' | 'security_log' | 'network' | 'settings';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', icon: LayoutGrid },
  { id: 'app_auditor', label: 'APPS', icon: ShieldCheck },
  { id: 'threat_model', label: 'THREATS', icon: ShieldCheck },
  { id: 'network', label: 'NETWORK', icon: Wifi },
  { id: 'security_log', label: 'LOG', icon: ScrollText },
  { id: 'settings', label: 'SETTINGS', icon: SettingsIcon },
];

function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
    const { apps, risks, loading, connected, error, score, reload } = useSecureDroid();

    // Filter out system apps from risks
    const userRisks = useMemo(() => {
        // Create a set of user app package names
        const userAppPackageNames = new Set(
            apps
                .filter(app => !app.isSystemApp)
                .map(app => app.packageName)
        );

        // Filter risks to only include user apps
        return risks.filter(risk => 
            userAppPackageNames.has(risk.packageName)
        );
    }, [apps, risks]);

    // Count high and medium risks
    const highRiskCount = userRisks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = userRisks.filter(r => r.riskLevel === 'MEDIUM').length;

    const cards: { id: Screen; title: string; description: string; icon: React.ElementType }[] = [
        {
            id: 'app_auditor',
            title: 'App Security Auditor',
            description: `Review ${apps.length} installed apps for security risks`,
            icon: ShieldCheck,
        },
        {
            id: 'threat_model',
            title: 'Threat Model Center',
            description: `${userRisks.length} risky app${userRisks.length !== 1 ? 's' : ''} detected`,
            icon: ShieldCheck,
        },
        {
            id: 'security_log',
            title: 'Security Audit Log',
            description: 'View security events and timeline',
            icon: ScrollText,
        },
        {
            id: 'network',
            title: 'Network Protection',
            description: 'VPN tunnel status and control',
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="p-4 space-y-4">
            <SecureDroidSectionHeader title="SecureDroid" subtitle="Security for your phone" />
            
            {/* Connection Status */}
            <div className={`p-3 rounded-lg ${connected ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                        {connected ? '✅ Plugin Connected' : '❌ Plugin Not Connected'}
                    </span>
                    {loading && <span className="text-sm text-slate-400">Loading...</span>}
                </div>
                {error && (
                    <div className="text-sm text-red-400 mt-1">{error}</div>
                )}
                <button 
                    onClick={reload}
                    className="text-xs text-sky-400 hover:text-sky-300 mt-1"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Security Score */}
            {connected && !loading && (
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
                    {userRisks.length > 0 && (
                        <div className="mt-2 text-sm text-orange-400">
                            ⚠️ {userRisks.length} risky app{userRisks.length !== 1 ? 's' : ''} found
                        </div>
                    )}
                    {userRisks.length === 0 && !loading && (
                        <div className="mt-2 text-sm text-green-400">
                            ✅ No risky apps found
                        </div>
                    )}
                    {highRiskCount > 0 && (
                        <div className="mt-1 text-xs text-red-400">
                            🔴 {highRiskCount} high risk, 🟡 {mediumRiskCount} medium risk
                        </div>
                    )}
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

            {/* Cards */}
            {!loading && cards.map((card) => {
                const Icon = card.icon;
                return (
                    <button
                        key={card.id}
                        onClick={() => onNavigate(card.id)}
                        className="w-full text-left"
                    >
                        <SecureDroidCard>
                            <div className="flex items-start gap-3 p-1">
                                <div className="mt-0.5 rounded-lg bg-sky-500/10 p-2">
                                    <Icon className="w-5 h-5 text-sky-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-100">{card.title}</div>
                                    <div className="text-sm text-slate-400 mt-0.5">{card.description}</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 mt-1" />
                            </div>
                        </SecureDroidCard>
                    </button>
                );
            })}

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 font-mono space-y-1">
                        <div>🔍 Debug Info:</div>
                        <div>• Total Apps: {apps.length}</div>
                        <div>• User Apps: {apps.filter(a => !a.isSystemApp).length}</div>
                        <div>• System Apps: {apps.filter(a => a.isSystemApp).length}</div>
                        <div>• Total Risks: {risks.length}</div>
                        <div>• User Risks: {userRisks.length}</div>
                        <div>• High Risk: {highRiskCount}</div>
                        <div>• Medium Risk: {mediumRiskCount}</div>
                        <div>• Score: {score}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SettingsScreen() {
  return (
    <div className="p-4 space-y-4">
      <SecureDroidSectionHeader title="Settings" />
      <SecureDroidCard>
        <div className="flex items-start gap-3 p-1">
          <Info className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-100">About SecureDroid</div>
            <div className="text-sm text-slate-400 mt-1">
              SecureDroid reports on real, checkable signals about your device and installed
              apps. It does not perform malware scanning, hardware attestation, or bootloader
              verification, and does not claim capabilities it does not have.
            </div>
          </div>
        </div>
      </SecureDroidCard>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const navigateTo = (screen: Screen) => setCurrentScreen(screen);
  const handleBack = () => setCurrentScreen('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-7xl mx-auto">
      <SecureDroidTopBar title="SecureDroid" />

      <main className="flex-1 overflow-y-auto pb-20">
        {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}

        {currentScreen === 'threat_model' && (
          <ThreatModelCenterScreen onBack={handleBack} />
        )}

        {currentScreen === 'app_auditor' && (
          <AppSecurityAuditorScreen onBack={handleBack} />
        )}

        {currentScreen === 'security_log' && (
          <SecurityAuditLogScreen onBack={handleBack} />
        )}

        {currentScreen === 'network' && (
          <NetworkControlScreen onBack={handleBack} />
        )}

        {currentScreen === 'settings' && <SettingsScreen />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-7xl mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
                  isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-wider mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
