import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Square,
  RotateCcw,
  Pause,
  HardDrive,
  ShieldCheck,
  FileCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  Camera,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidButton,
  SecureDroidSectionHeader,
  SecureDroidStatusChip,
  SecureDroidSlider
} from './ui/designSystem';
import {
  DeviceProfile,
  GuestOsImage,
  VmSnapshot,
  VmStorageInfo,
  SystemScreen
} from '../types/securedroid';

interface SecureEnvironmentScreenProps {
  profile: DeviceProfile;
  vmStorage: VmStorageInfo;
  guestImages: GuestOsImage[];
  snapshots: VmSnapshot[];
  onCreateSnapshot: (name: string) => void;
  onRestoreSnapshot: (id: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onNavigate: (screen: SystemScreen) => void;
  onBack?: () => void;
  isLight?: boolean;
}

type VmState = 'STOPPED' | 'STARTING' | 'RUNNING' | 'PAUSED' | 'UNAVAILABLE';

export const SecureEnvironmentScreen: React.FC<SecureEnvironmentScreenProps> = ({
  profile,
  vmStorage,
  guestImages,
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onNavigate,
  onBack,
  isLight = false,
}) => {
  const [vmState, setVmState] = useState<VmState>('STOPPED');
  const [selectedImageId, setSelectedImageId] = useState<string>(guestImages[0]?.id || 'img-microdroid-1');
  const [allocatedRamMb, setAllocatedRamMb] = useState<number>(2048);
  const [cpuCores, setCpuCores] = useState<number>(2);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  const selectedImage = guestImages.find((img) => img.id === selectedImageId) || guestImages[0];

  const handleStartVm = () => {
    setVmState('STARTING');
    setTimeout(() => {
      setVmState('RUNNING');
    }, 1200);
  };

  const handleStopVm = () => {
    setVmState('STOPPED');
  };

  const handlePauseVm = () => {
    setVmState(vmState === 'PAUSED' ? 'RUNNING' : 'PAUSED');
  };

  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) return;
    onCreateSnapshot(newSnapshotName.trim());
    setNewSnapshotName('');
    setIsCreatingSnapshot(false);
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Secure Environment"
        subtitle="Microdroid Hardware-Isolated Virtual Machine"
        onBack={onBack}
        isLight={isLight}
      />

      {/* 1. VM Active State Hero Card */}
      <div className="pt-4 pb-2">
        <SecureDroidCard isLight={isLight} highlight className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/30">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                vmState === 'RUNNING'
                  ? isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                  : vmState === 'PAUSED'
                  ? 'bg-amber-600/20 text-amber-500'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-700'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-base">Microdroid VM Environment</h3>
                <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {vmState === 'RUNNING' ? 'Virtual machine executing in isolated memory tier' :
                   vmState === 'PAUSED' ? 'VM execution suspended; RAM held' :
                   'VM stopped. Zero RAM or CPU allocated.'}
                </p>
              </div>
            </div>
            <SecureDroidStatusChip
              status={
                vmState === 'RUNNING' ? 'SECURE' :
                vmState === 'PAUSED' ? 'DEGRADED' :
                'UNAVAILABLE'
              }
              label={vmState}
              isLight={isLight}
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 py-4 text-xs font-mono">
            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <span className={`text-[10px] uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>RAM Usage</span>
              <p className="font-medium mt-0.5">
                {vmState === 'RUNNING' || vmState === 'PAUSED' ? `${allocatedRamMb} MB` : '0 MB'}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <span className={`text-[10px] uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>vCPUs</span>
              <p className="font-medium mt-0.5">{cpuCores} Cores</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}>
              <span className={`text-[10px] uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Communication</span>
              <p className="font-medium mt-0.5">vsock CID 3</p>
            </div>
          </div>

          {/* VM Control Actions */}
          <div className="flex gap-2 pt-1">
            {vmState === 'STOPPED' ? (
              <SecureDroidButton
                variant="primary"
                onClick={handleStartVm}
                isLight={isLight}
                className="flex-1"
                icon={Play}
              >
                Launch Secure VM
              </SecureDroidButton>
            ) : (
              <>
                <SecureDroidButton
                  variant="danger"
                  onClick={handleStopVm}
                  isLight={isLight}
                  className="flex-1"
                  icon={Square}
                >
                  Stop VM
                </SecureDroidButton>
                <SecureDroidButton
                  variant="secondary"
                  onClick={handlePauseVm}
                  isLight={isLight}
                  className="flex-1"
                  icon={Pause}
                >
                  {vmState === 'PAUSED' ? 'Resume' : 'Pause'}
                </SecureDroidButton>
              </>
            )}
          </div>
        </SecureDroidCard>
      </div>

      {/* 2. Storage Safety Reserve Floor (20.0 GB Enforced) */}
      <SecureDroidSectionHeader title="Host Storage & Safety Floor" isLight={isLight} />
      <SecureDroidCard isLight={isLight} className="p-4 mb-4">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-400" />
            <h4 className="font-medium text-sm">20.0 GB Host OS Flash Floor</h4>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
          }`}>
            ENFORCED
          </span>
        </div>
        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          The VM virtual disk allocates sparse blocks. The system enforces a 20.0 GB safety reserve on internal flash.
        </p>
        <div className="pt-3 mt-3 border-t border-zinc-800/20 flex justify-between text-xs font-mono">
          <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Current VM Disk: 54.2 GB</span>
          <span className="font-medium">Safe Expansion Room: {vmStorage.safeGrowthGb.toFixed(1)} GB</span>
        </div>
      </SecureDroidCard>

      {/* 3. Verified Guest OS Images */}
      <SecureDroidSectionHeader title="Verified Guest OS Payloads" isLight={isLight} />
      <div className="space-y-2 mb-4">
        {guestImages.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelectedImageId(img.id)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedImageId === img.id
                ? isLight
                  ? 'border-zinc-900 bg-zinc-100/90 shadow-sm'
                  : 'border-zinc-100 bg-zinc-900 shadow-sm'
                : isLight
                ? 'border-zinc-200 bg-white hover:bg-zinc-50'
                : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-zinc-400" />
                <div>
                  <h5 className="font-medium text-xs">{img.name}</h5>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{img.version} • {img.sizeMb} MB</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                VERIFIED
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-2 truncate">
              SHA256: {img.sha256}
            </p>
          </div>
        ))}
      </div>

      {/* 4. Snapshots & State Rollback */}
      <div className="flex items-center justify-between pb-2">
        <SecureDroidSectionHeader title="VM Snapshots & Checkpoints" isLight={isLight} />
        <button
          onClick={() => setIsCreatingSnapshot(true)}
          className={`text-xs flex items-center gap-1 font-medium ${
            isLight ? 'text-zinc-900 hover:text-zinc-700' : 'text-zinc-100 hover:text-zinc-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Create Snapshot
        </button>
      </div>

      {isCreatingSnapshot && (
        <form onSubmit={handleCreateSnapshotSubmit} className={`p-3.5 rounded-2xl border mb-3 space-y-3 ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
          <h5 className="text-xs font-medium">New Point-in-Time Snapshot</h5>
          <input
            type="text"
            value={newSnapshotName}
            onChange={(e) => setNewSnapshotName(e.target.value)}
            placeholder="Snapshot name (e.g., Clean Baseline)..."
            className={`w-full px-3 py-2 rounded-xl border text-xs ${
              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-white'
            }`}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
              }`}
            >
              Save Snapshot
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingSnapshot(false)}
              className={`px-3 py-1.5 rounded-xl text-xs ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 mb-4">
        {snapshots.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            No snapshots created yet.
          </div>
        ) : (
          snapshots.map((snap) => (
            <div
              key={snap.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900/60 border-zinc-800 text-zinc-200'
              }`}
            >
              <div>
                <h5 className="font-medium text-xs">{snap.name}</h5>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {snap.timestamp} • {snap.sizeMb} MB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRestoreSnapshot(snap.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    isLight
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-750'
                  }`}
                >
                  Restore
                </button>
                <button
                  onClick={() => onDeleteSnapshot(snap.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. VM Hardware Resource Sliders */}
      <SecureDroidSectionHeader title="Virtual Machine Hardware Configuration" isLight={isLight} />
      <SecureDroidCard isLight={isLight} className="p-4 space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>RAM Allocation</span>
            <span className="font-mono font-medium">{allocatedRamMb} MB</span>
          </div>
          <SecureDroidSlider
            value={allocatedRamMb}
            min={512}
            max={4096}
            step={256}
            onChange={setAllocatedRamMb}
            isLight={isLight}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>vCPU Core Count</span>
            <span className="font-mono font-medium">{cpuCores} vCPUs</span>
          </div>
          <SecureDroidSlider
            value={cpuCores}
            min={1}
            max={4}
            step={1}
            onChange={setCpuCores}
            isLight={isLight}
          />
        </div>
      </SecureDroidCard>
    </div>
  );
};
