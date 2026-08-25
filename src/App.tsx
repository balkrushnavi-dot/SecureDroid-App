import React, { useState } from 'react';
import { ShieldCheck, ScrollText, LayoutGrid, Settings as SettingsIcon, ChevronRight, Info } from 'lucide-react';

import { ThreatModelCenterScreen } from './components/security/ThreatModelCenterScreen';
import { SecurityAuditLogScreen } from './components/security/SecurityAuditLogScreen';
import { AppSecurityAuditorScreen } from './components/security/AppSecurityAuditorScreen';

import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSectionHeader,
} from './components/ui/designSystem';

type Screen = 'home' | 'threat_model' | 'app_auditor' | 'security_log' | 'settings';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', icon: LayoutGrid },
  { id: 'app_auditor', label: 'APPS', icon: ShieldCheck },
  { id: 'threat_model', label: 'THREATS', icon: ShieldCheck },
  { id: 'security_log', label: 'LOG', icon: ScrollText },
  { id: 'settings', label: 'SETTINGS', icon: SettingsIcon },
];

function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const cards: { id: Screen; title: string; description: string; icon: React.ElementType }[] = [
    {
      id: 'app_auditor',
      title: 'App Security Auditor',
      description: 'Review installed apps for install source, sensitive permissions, and outdated targeting.',
      icon: ShieldCheck,
    },
    {
      id: 'threat_model',
      title: 'Threat Model Center',
      description: 'On-device risk analysis of installed applications based on real, checkable signals.',
      icon: ShieldCheck,
    },
    {
      id: 'security_log',
      title: 'Security Audit Log',
      description: 'A structured, persistent log of security-relevant events on this device.',
      icon: ScrollText,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <SecureDroidSectionHeader title="SecureDroid" subtitle="Security for your phone" />
      {cards.map((card) => {
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
