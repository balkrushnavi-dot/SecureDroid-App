import React, { useState } from 'react';
import {
  FileText,
  Key,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Plus,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';
import { CertificateTrustItem, PasskeySecurityItem } from '../../types/securedroid';
import { SAMPLE_CERTIFICATES, SAMPLE_PASSKEYS } from '../../data/featurePackData';

interface CertificatesPasskeysScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const CertificatesPasskeysScreen: React.FC<CertificatesPasskeysScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<'CERTIFICATES' | 'PASSKEYS'>('PASSKEYS');
  const [certs] = useState<CertificateTrustItem[]>(SAMPLE_CERTIFICATES);
  const [passkeys] = useState<PasskeySecurityItem[]>(SAMPLE_PASSKEYS);
  const [selectedCert, setSelectedCert] = useState<CertificateTrustItem | null>(null);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Trust Store & Passkeys"
        subtitle="Hardware-Backed Credentials & Root Certificates"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('PASSKEYS')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'PASSKEYS'
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="font-semibold text-xs">Passkeys & Security Keys</span>
            </div>
            <p className={`text-[10px] mt-1 line-clamp-1 ${
              activeTab === 'PASSKEYS'
                ? isLight ? 'text-zinc-300' : 'text-zinc-700'
                : 'text-zinc-500'
            }`}>
              FIDO2 WebAuthn & TEE credentials
            </p>
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATES')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'CERTIFICATES'
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-semibold text-xs">Certificate Trust Store</span>
            </div>
            <p className={`text-[10px] mt-1 line-clamp-1 ${
              activeTab === 'CERTIFICATES'
                ? isLight ? 'text-zinc-300' : 'text-zinc-700'
                : 'text-zinc-500'
            }`}>
              System & user Root CAs
            </p>
          </button>
        </div>

        {/* Tab 1: Passkeys & Security Keys */}
        {activeTab === 'PASSKEYS' && (
          <div className="space-y-3">
            <SecureDroidCard isLight={isLight} highlight className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
                }`}>
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">KeyMint TEE-Backed Passkey Vault</h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Private keys are generated directly inside Qualcomm TrustZone silicon and cannot be exported
                  </p>
                </div>
              </div>
            </SecureDroidCard>

            <SecureDroidSectionHeader title="Stored Platform Credentials" isLight={isLight} />

            {passkeys.map((pk) => (
              <SecureDroidCard key={pk.id} isLight={isLight} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{pk.rpName}</h4>
                      <SecureDroidStatusChip
                        status={pk.hardwareBackedStatus === 'HARDWARE_BACKED' || pk.hardwareBackedStatus === 'STRONGBOX' ? 'SECURE' : 'ISOLATED'}
                        label={pk.hardwareBackedStatus}
                        isLight={isLight}
                      />
                    </div>
                    <p className={`text-xs font-mono mt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {pk.userName} • {pk.rpId}
                    </p>
                    <div className={`mt-2 text-[11px] font-mono text-zinc-500`}>
                      Created: {pk.createdAt} • Last Used: {pk.lastUsed}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {pk.credentialType}
                  </span>
                </div>
              </SecureDroidCard>
            ))}
          </div>
        )}

        {/* Tab 2: Certificate Trust Store */}
        {activeTab === 'CERTIFICATES' && (
          <div className="space-y-3">
            <SecureDroidCard isLight={isLight} className="p-3 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div className={`leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                <strong>Certificate Transparency Policy:</strong> System CAs in <code>/system/etc/security/cacerts</code> are read-only. User-installed certificates generate high-visibility security warnings.
              </div>
            </SecureDroidCard>

            <SecureDroidSectionHeader title="Trusted Root Authorities" isLight={isLight} />

            {certs.map((cert) => {
              const isWarning = !!cert.warning;
              return (
                <SecureDroidCard
                  key={cert.id}
                  isLight={isLight}
                  className={`p-4 cursor-pointer hover:border-zinc-700 transition-colors ${
                    isWarning ? 'border-amber-500/40' : ''
                  }`}
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{cert.alias}</h4>
                        <SecureDroidStatusChip
                          status={cert.isSystemCertificate ? 'SECURE' : 'DEGRADED'}
                          label={cert.isSystemCertificate ? 'SYSTEM TRUST' : 'USER INSTALLED'}
                          isLight={isLight}
                        />
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {cert.subject}
                      </p>
                      {isWarning && (
                        <div className="mt-2 text-xs text-amber-400 font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{cert.warning}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0 mt-1" />
                  </div>
                </SecureDroidCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Inspector Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md w-full rounded-2xl p-5 shadow-2xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/20">
              <h3 className="font-semibold text-sm">Certificate Inspector</h3>
              <button
                onClick={() => setSelectedCert(null)}
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  isLight ? 'bg-zinc-100 hover:bg-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Subject</span>
                <p className="font-mono text-[11px] break-all bg-zinc-950 p-2 rounded-lg text-zinc-300">
                  {selectedCert.subject}
                </p>
              </div>

              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">SHA-256 Fingerprint</span>
                <p className="font-mono text-[10px] break-all bg-zinc-950 p-2 rounded-lg text-zinc-300">
                  {selectedCert.sha256Fingerprint}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-950 text-zinc-300'}`}>
                  <span className="text-zinc-500 block font-sans text-[10px]">Algorithm</span>
                  <span>{selectedCert.keyAlgorithm}</span>
                </div>
                <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-950 text-zinc-300'}`}>
                  <span className="text-zinc-500 block font-sans text-[10px]">Expires</span>
                  <span>{selectedCert.expirationDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/20 flex justify-end">
              <SecureDroidButton
                variant="primary"
                onClick={() => setSelectedCert(null)}
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
