import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Lock,
  EyeOff,
  Terminal,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';

interface BrowserWebSecurityScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const BrowserWebSecurityScreen: React.FC<BrowserWebSecurityScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [httpsOnly, setHttpsOnly] = useState<boolean>(true);
  const [trackerBlocking, setTrackerBlocking] = useState<boolean>(true);
  const [isolatedRenderers, setIsolatedRenderers] = useState<boolean>(true);
  const [jitDisabled, setJitDisabled] = useState<boolean>(false);
  const [cookieIsolation, setCookieIsolation] = useState<boolean>(true);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Browser & WebView Security"
        subtitle="Chromium Engine Isolation & Web Threat Defenses"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* 1. Android System WebView Engine Card */}
        <SecureDroidSectionHeader title="System WebView Engine" isLight={isLight} />

        <SecureDroidCard isLight={isLight} highlight className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Hardened Chromium Engine (isolated64)</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Multi-process sandboxing with dedicated SELinux isolated_app security domain
                </p>
              </div>
            </div>
            <SecureDroidStatusChip status="SECURE" label="CHROMIUM 128" isLight={isLight} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/20 text-xs font-mono">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">Provider</span>
              <span>SecureDroid WebView</span>
            </div>
            <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">Renderer Sandbox</span>
              <span>Enabled (isolated64)</span>
            </div>
            <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">Security Patch</span>
              <span>August 2026</span>
            </div>
            <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">DevTools Debug</span>
              <span>Disabled (Locked)</span>
            </div>
          </div>
        </SecureDroidCard>

        {/* 2. Web Security Policies */}
        <SecureDroidSectionHeader title="Browser Hardening Policies" isLight={isLight} />

        <div className="space-y-3">
          {/* HTTPS-Only */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">HTTPS-Only Enforcement</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Automatically upgrades insecure HTTP requests; alerts and blocks unencrypted navigation.
                  </p>
                </div>
              </div>
              <SecureDroidSwitch checked={httpsOnly} onChange={() => setHttpsOnly(!httpsOnly)} isLight={isLight} />
            </div>
          </SecureDroidCard>

          {/* Tracker Blocking */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <EyeOff className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Comprehensive Tracker & Ad Blocking</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Native Rust adblock engine blocks surveillance telemetry, canvas fingerprinting, and analytics pixels.
                  </p>
                </div>
              </div>
              <SecureDroidSwitch checked={trackerBlocking} onChange={() => setTrackerBlocking(!trackerBlocking)} isLight={isLight} />
            </div>
          </SecureDroidCard>

          {/* Isolated Tab Renderers */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Site-Per-Process Tab Isolation</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Each origin runs in a separate memory address space with unique seccomp filters.
                  </p>
                </div>
              </div>
              <SecureDroidSwitch checked={isolatedRenderers} onChange={() => setIsolatedRenderers(!isolatedRenderers)} isLight={isLight} />
            </div>
          </SecureDroidCard>

          {/* JIT Compilation Disable */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Disable V8 JavaScript JIT</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Eliminates the largest browser zero-day attack surface (JIT compiler optimization bugs).
                  </p>
                </div>
              </div>
              <SecureDroidSwitch checked={jitDisabled} onChange={() => setJitDisabled(!jitDisabled)} isLight={isLight} />
            </div>
          </SecureDroidCard>
        </div>
      </div>
    </div>
  );
};
