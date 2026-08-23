import React, { useState } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Download,
  CheckCircle2,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';
import { StoreRepositoryApp } from '../../types/securedroid';
import { SECUREDROID_STORE_APPS } from '../../data/featurePackData';

interface SecureDroidStoreScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const SecureDroidStoreScreen: React.FC<SecureDroidStoreScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [storeApps, setStoreApps] = useState<StoreRepositoryApp[]>(SECUREDROID_STORE_APPS);
  const [installedNotice, setInstalledNotice] = useState<string | null>(null);

  const handleInstallApp = (app: StoreRepositoryApp) => {
    setStoreApps((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, installedVersion: a.availableVersion } : a))
    );
    setInstalledNotice(`Installed ${app.name} (v${app.availableVersion}) into isolated per-UID sandbox.`);
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="SecureDroid Store"
        subtitle="Signed Repositories & Reproducible Builds"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Banner */}
        <SecureDroidCard isLight={isLight} highlight className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
            }`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Curated Cryptographic Repository</h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Every application is verified for reproducible compilation and zero surveillance SDKs
              </p>
            </div>
          </div>
        </SecureDroidCard>

        {installedNotice && (
          <SecureDroidCard isLight={isLight} className="p-3 bg-emerald-950/30 border-emerald-500/50 text-emerald-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{installedNotice}</span>
            </div>
            <button onClick={() => setInstalledNotice(null)} className="underline text-[10px] font-mono">Dismiss</button>
          </SecureDroidCard>
        )}

        {/* Sandboxed Google Play Architecture Notice */}
        <SecureDroidCard isLight={isLight} className="p-3 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className={`leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <strong>Sandboxed Google Play Architecture:</strong> SecureDroid allows Google Play Services to run completely sandboxed as regular unprivileged standard apps (UID &gt; 10000) with zero system privileges or telemetry access.
          </div>
        </SecureDroidCard>

        {/* Apps Grid */}
        <SecureDroidSectionHeader title="Verified Applications" isLight={isLight} />

        <div className="space-y-3">
          {storeApps.map((app) => {
            const isInstalled = !!app.installedVersion;
            return (
              <SecureDroidCard key={app.id} isLight={isLight} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{app.name}</h4>
                      <span className="text-xs font-mono text-zinc-400">v{app.availableVersion}</span>
                      {app.reproducibleBuild && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                          isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/80 text-emerald-300'
                        }`}>
                          <PackageCheck className="w-3 h-3" />
                          Reproducible Build
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {app.description}
                    </p>

                    <div className={`mt-2 p-2 rounded-lg text-[11px] font-mono space-y-0.5 ${
                      isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'
                    }`}>
                      <div><strong>Developer:</strong> {app.developerIdentity}</div>
                      <div><strong>Privacy:</strong> {app.privacySummary}</div>
                      <div><strong>Size:</strong> {app.sizeMb} MB • Channel: {app.updateChannel}</div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <SecureDroidButton
                      variant={isInstalled ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleInstallApp(app)}
                      isLight={isLight}
                    >
                      {isInstalled ? 'Installed' : 'Install'}
                    </SecureDroidButton>
                  </div>
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
