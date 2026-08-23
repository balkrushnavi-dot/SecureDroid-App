import React, { useState } from 'react';
import {
  HardDrive,
  ShieldCheck,
  Lock,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  Upload,
  KeyRound,
  FileText
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';
import { BackupSecurityModel } from '../../types/securedroid';
import { BACKUP_SECURITY_CONFIG } from '../../data/featurePackData';
import { BackupService } from '../../services/backup/BackupService';
import type { EncryptedBackupArchive } from '../../types/native';

interface BackupRestoreScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const BackupRestoreScreen: React.FC<BackupRestoreScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [backupConfig, setBackupConfig] = useState<BackupSecurityModel>(BACKUP_SECURITY_CONFIG);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  const [latestArchive, setLatestArchive] = useState<EncryptedBackupArchive | null>(null);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [restorePayloadInput, setRestorePayloadInput] = useState<string>('');
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const handleCreateEncryptedBackup = async () => {
    if (!passphrase || passphrase.length < 6) {
      alert('Please enter a strong backup passphrase (minimum 6 characters).');
      return;
    }
    setIsBackingUp(true);
    setBackupSuccessMessage(null);
    try {
      const sampleAppData = {
        profileId: 'securedroid-default',
        networkPolicy: 'VPN_ONLY',
        lockdownMode: false,
        installedAppSandboxes: 8,
        backedUpAt: new Date().toISOString(),
      };
      const archive = await BackupService.createBackup(passphrase, sampleAppData);
      setLatestArchive(archive);
      setBackupSuccessMessage(
        `Encrypted archive created (AES-256-GCM + PBKDF2). Payload Size: ${archive.payloadEncryptedBase64.length} bytes.`
      );
    } catch (e: any) {
      alert(`Backup error: ${e.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreArchive = async () => {
    if (!passphrase) {
      alert('Please enter the decryption passphrase.');
      return;
    }
    const archiveJson = restorePayloadInput || (latestArchive ? JSON.stringify(latestArchive) : '');
    if (!archiveJson) {
      alert('Please paste the encrypted archive JSON or create one above.');
      return;
    }
    setIsRestoring(true);
    setRestoreStatus(null);
    try {
      const parsedArchive: EncryptedBackupArchive = JSON.parse(archiveJson);
      const restored = await BackupService.restoreBackup(parsedArchive, passphrase);
      setRestoreStatus(`Archive restored successfully! Config: ${JSON.stringify(restored)}`);
    } catch (e: any) {
      setRestoreStatus(`Restore failed: ${e.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Backup & Restore Security"
        subtitle="Hardware-Wrapped Encrypted Archives & Disaster Recovery"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* 1. Backup Status Card */}
        <SecureDroidCard isLight={isLight} highlight className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
              }`}>
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Hardware-Wrapped AES-256 Backup</h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Key derivation: PBKDF2 SHA-256 (100k rounds) • Cipher: AES-GCM 256-bit
                </p>
              </div>
            </div>
            <SecureDroidStatusChip status="SECURE" label="REAL CRYPTO" isLight={isLight} />
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/20">
            <label className="text-xs font-mono text-slate-300 block">Backup Protection Passphrase</label>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-sky-400 shrink-0" />
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter strong passphrase..."
                className="w-full bg-slate-900 border border-slate-700 text-xs font-mono rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </SecureDroidCard>

        {backupSuccessMessage && (
          <SecureDroidCard isLight={isLight} className="p-3 bg-emerald-950/30 border-emerald-500/50 text-emerald-300 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{backupSuccessMessage}</span>
              </div>
              <button onClick={() => setBackupSuccessMessage(null)} className="underline text-[10px] font-mono">Dismiss</button>
            </div>
            {latestArchive && (
              <textarea
                readOnly
                rows={3}
                value={JSON.stringify(latestArchive, null, 2)}
                className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono p-2 rounded-lg text-slate-300"
              />
            )}
          </SecureDroidCard>
        )}

        {/* 2. Critical Distinction: Snapshot vs Backup */}
        <SecureDroidSectionHeader title="Architecture: Snapshot vs Backup" isLight={isLight} />

        <SecureDroidCard isLight={isLight} className="p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              <strong>SNAPSHOT vs BACKUP:</strong> {backupConfig.snapshotVsBackupNote}
            </p>
          </div>
        </SecureDroidCard>

        {/* 3. Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <SecureDroidButton
            variant="primary"
            onClick={handleCreateEncryptedBackup}
            disabled={isBackingUp}
            isLight={isLight}
            className="flex-1"
          >
            {isBackingUp ? 'Encrypting with AES-GCM 256...' : 'Create Encrypted Backup'}
          </SecureDroidButton>

          <SecureDroidButton
            variant="secondary"
            onClick={handleRestoreArchive}
            disabled={isRestoring}
            isLight={isLight}
            className="flex-1"
          >
            {isRestoring ? 'Decrypting...' : 'Restore Archive'}
          </SecureDroidButton>
        </div>

        {restoreStatus && (
          <div className={`p-3 rounded-xl text-xs font-mono border ${
            restoreStatus.includes('successfully')
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {restoreStatus}
          </div>
        )}
      </div>
    </div>
  );
};
