import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Terminal,
  ExternalLink,
  ChevronRight,
  Code,
  Smartphone
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';
import { InstalledAppVerificationDetail } from '../../types/securedroid';
import { SAMPLE_APP_VERIFICATIONS } from '../../data/featurePackData';

interface AppVerificationScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const AppVerificationScreen: React.FC<AppVerificationScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [apps] = useState<InstalledAppVerificationDetail[]>(SAMPLE_APP_VERIFICATIONS);
  const [selectedApp, setSelectedApp] = useState<InstalledAppVerificationDetail | null>(null);

  const getIntegrityBadge = (state: InstalledAppVerificationDetail['integrityState']) => {
    switch (state) {
      case 'INTEGRITY_VERIFIED':
        return { variant: 'SECURE' as const, label: 'VERIFIED SIGNATURE' };
      case 'TAMPER_WARNING':
        return { variant: 'DEGRADED' as const, label: 'TAMPER WARNING' };
      case 'SUSPICIOUS_PROPERTIES':
      default:
        return { variant: 'UNAVAILABLE' as const, label: 'SUSPICIOUS APK' };
    }
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Application Verification"
        subtitle="Cryptographic Signatures, SDK Targets & Sandboxes"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Intro Banner */}
        <SecureDroidCard isLight={isLight} highlight className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
            }`}>
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Package Signature & Integrity Inspector</h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Validates APK v2/v3/v4 signing blocks, target SDK baselines, and dangerous permissions
              </p>
            </div>
          </div>
        </SecureDroidCard>

        {/* Installed Applications List */}
        <SecureDroidSectionHeader title="Installed Package Audits" isLight={isLight} />

        <div className="space-y-3">
          {apps.map((app) => {
            const badge = getIntegrityBadge(app.integrityState);
            const hasWarnings = app.securityWarnings.length > 0;
            return (
              <SecureDroidCard
                key={app.packageName}
                isLight={isLight}
                className="p-4 cursor-pointer hover:border-zinc-700 transition-colors"
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{app.applicationName}</h4>
                      <SecureDroidStatusChip status={badge.variant} label={badge.label} isLight={isLight} />
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        Target SDK {app.targetSdk}
                      </span>
                    </div>

                    <p className={`text-xs font-mono mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {app.packageName} • v{app.version}
                    </p>

                    {hasWarnings && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{app.securityWarnings.length} Security flags detected</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0 mt-1" />
                </div>

                <div className={`mt-3 p-2 rounded-xl text-[11px] font-mono flex items-center justify-between ${
                  isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'
                }`}>
                  <span className="truncate">Signer: {app.signer}</span>
                  <span className="text-zinc-500 shrink-0 ml-2">{app.installationSource}</span>
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>

      {/* Package Detail Modal Sheet */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl p-5 shadow-2xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/20">
              <div>
                <h3 className="font-semibold text-sm">{selectedApp.applicationName}</h3>
                <span className="text-[11px] font-mono text-zinc-400">{selectedApp.packageName}</span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  isLight ? 'bg-zinc-100 hover:bg-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* Warnings List */}
              {selectedApp.securityWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Security Warnings</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {selectedApp.securityWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Signing Certificate (SHA-256)</span>
                <p className="p-2 rounded-lg font-mono text-[10px] break-all bg-zinc-950 text-zinc-300">
                  {selectedApp.certificateFingerprintSha256}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-950 text-zinc-300'}`}>
                  <span className="text-zinc-500 block font-sans text-[10px]">Min SDK</span>
                  <span>Android API {selectedApp.minSdk}</span>
                </div>
                <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-950 text-zinc-300'}`}>
                  <span className="text-zinc-500 block font-sans text-[10px]">Debuggable</span>
                  <span className={selectedApp.debuggableState ? 'text-amber-400' : 'text-emerald-400'}>
                    {selectedApp.debuggableState ? 'TRUE (Warning)' : 'FALSE (Secure)'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-zinc-400 block mb-1">Declared Dangerous Permissions</span>
                <div className="flex flex-wrap gap-1">
                  {selectedApp.dangerousPermissions.map((perm) => (
                    <span
                      key={perm}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/20 flex justify-end">
              <SecureDroidButton
                variant="primary"
                onClick={() => setSelectedApp(null)}
                isLight={isLight}
              >
                Done
              </SecureDroidButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
