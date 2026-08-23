import React from 'react';
import { Home, ShieldCheck, Eye, Smartphone, Layers } from 'lucide-react';
import { ActiveTab } from './Header';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'HOME', icon: Home },
    { id: 'security' as ActiveTab, label: 'SECURITY', icon: ShieldCheck },
    { id: 'privacy' as ActiveTab, label: 'PRIVACY', icon: Eye },
    { id: 'sandbox' as ActiveTab, label: 'SANDBOX', icon: Smartphone },
    { id: 'vm_manager' as ActiveTab, label: 'VM', icon: Layers },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-7xl mx-auto shadow-2xl"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all group cursor-pointer ${
                isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                  isActive ? 'bg-sky-500/15 border border-sky-500/30' : 'group-hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-wider mt-0.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
