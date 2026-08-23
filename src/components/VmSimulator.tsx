import React, { useState, useEffect } from 'react';
import { VmStateEnum, VmMetrics, DeviceProfile } from '../types/securedroid';
import { Play, Square, Pause, Lock, ShieldAlert, RefreshCw, HardDrive, Wifi, Activity, Terminal } from 'lucide-react';

interface VmSimulatorProps {
  currentProfile: DeviceProfile;
  securityLevel: number;
}

export const VmSimulator: React.FC<VmSimulatorProps> = ({ currentProfile, securityLevel }) => {
  const [vmState, setVmState] = useState<VmStateEnum>('STOPPED');
  const [metrics, setMetrics] = useState<VmMetrics>({
    cpuUsagePercent: 0,
    allocatedRamMb: 2048,
    usedRamMb: 0,
    totalStorageGb: 150,
    sparseAllocatedStorageGb: 8.4,
    hostFreeStorageGb: currentProfile.availableStorageGb,
    hostSafetyReserveGb: 20.0,
    networkState: 'HOST_ISOLATED',
    uptimeSeconds: 0,
    thermalStatus: 'NORMAL',
  });

  const [logs, setLogs] = useState<Array<{ timestamp: string; event: string; level: 'INFO' | 'WARN' | 'SEC' | 'ERR' }>>([
    { timestamp: '2026-08-22T05:25:00Z', event: 'SecureDroid VM Core Initialized. Milestone 1 State Engine Ready.', level: 'INFO' },
    { timestamp: '2026-08-22T05:25:01Z', event: `Target: ${currentProfile.name}. Checking hardware capabilities...`, level: 'INFO' },
    { timestamp: '2026-08-22T05:25:02Z', event: `Host free space: ${currentProfile.availableStorageGb.toFixed(1)} GB. Enforced safety reserve: 20.0 GB.`, level: 'SEC' },
  ]);

  const addLog = (event: string, level: 'INFO' | 'WARN' | 'SEC' | 'ERR' = 'INFO') => {
    const timestamp = new Date().toISOString();
    setLogs((prev) => [{ timestamp, event, level }, ...prev.slice(0, 40)]);
  };

  // Uptime and metric ticker
  useEffect(() => {
    let interval: any = null;
    if (vmState === 'RUNNING') {
      interval = setInterval(() => {
        setMetrics((prev) => ({
          ...prev,
          uptimeSeconds: prev.uptimeSeconds + 1,
          cpuUsagePercent: Math.min(100, Math.max(2, Math.round(15 + Math.sin(Date.now() / 2000) * 10))),
          usedRamMb: Math.round(1024 + Math.sin(Date.now() / 3000) * 150),
        }));
      }, 1000);
    } else {
      setMetrics((prev) => ({
        ...prev,
        cpuUsagePercent: 0,
        usedRamMb: 0,
      }));
    }
    return () => clearInterval(interval);
  }, [vmState]);

  const handleStart = () => {
    if (currentProfile.availableStorageGb < 20.0) {
      addLog('FAIL-CLOSED: Host free storage is below 20.0 GB reserve. Refusing to start.', 'ERR');
      return;
    }
    if (securityLevel === 0) {
      addLog('FAIL-CLOSED: Device has no supported virtualization backend. Cannot start VM.', 'ERR');
      setVmState('ERROR');
      return;
    }

    addLog('Event: VM_START requested. Initiating state machine transition...', 'INFO');
    setVmState('STARTING');
    addLog('Verifying KeyMint hardware key authorization...', 'SEC');
    addLog('Allocating sparse dynamic disk header (8.4 GB virtual)...', 'INFO');

    setTimeout(() => {
      setVmState('RUNNING');
      addLog('VM successfully transitioned to RUNNING. Isolated guest runtime active.', 'SEC');
    }, 800);
  };

  const handleStop = () => {
    addLog('Event: VM_STOP requested. Committing disk journal and revoking memory mapping.', 'INFO');
    setVmState('STOPPED');
    setMetrics((prev) => ({ ...prev, uptimeSeconds: 0 }));
    addLog('VM State transitioned to STOPPED. Memory scrubbed.', 'SEC');
  };

  const handlePause = () => {
    if (vmState === 'RUNNING') {
      setVmState('PAUSED');
      addLog('VM State transitioned to PAUSED.', 'INFO');
    } else if (vmState === 'PAUSED') {
      setVmState('RUNNING');
      addLog('VM State transitioned to RUNNING.', 'INFO');
    }
  };

  const handleLock = () => {
    if (vmState === 'RUNNING') {
      setVmState('LOCKED');
      addLog('VM State: LOCKED. Guest display hidden, input blocked, clipboard severed.', 'SEC');
    } else if (vmState === 'LOCKED') {
      setVmState('RUNNING');
      addLog('VM State: UNLOCKED. Credentials authenticated via KeyMint.', 'SEC');
    }
  };

  const handlePanicLock = () => {
    setVmState('PANIC_LOCKED');
    setMetrics((prev) => ({ ...prev, uptimeSeconds: 0 }));
    addLog('PANIC LOCK TRIGGERED! Instant termination: network severed, keys revoked, volatile state flushed.', 'ERR');
  };

  const handleExpandStorage = (amountGb: number) => {
    const requested = metrics.sparseAllocatedStorageGb + amountGb;
    if (currentProfile.availableStorageGb - amountGb < 20.0) {
      addLog(`STORAGE REJECTED: Expanding by ${amountGb} GB would violate 20 GB host reserve!`, 'ERR');
      return;
    }
    setMetrics((prev) => ({
      ...prev,
      sparseAllocatedStorageGb: Math.min(150, requested),
    }));
    addLog(`Sparse disk extended to ${requested.toFixed(1)} GB. Host storage safe.`, 'SEC');
  };

  const getStatusColor = (state: VmStateEnum) => {
    switch (state) {
      case 'RUNNING':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'STARTING':
      case 'PAUSED':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'LOCKED':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
      case 'PANIC_LOCKED':
      case 'ERROR':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Metrics Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 mb-1">VIRTUAL MACHINE STATE CONTROLLER</div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-100">SecureDroid-1</h2>
              <span className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${getStatusColor(vmState)}`}>
                ● {vmState}
              </span>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {vmState === 'STOPPED' || vmState === 'ERROR' ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> START VM
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> STOP
              </button>
            )}

            <button
              onClick={handlePause}
              disabled={vmState !== 'RUNNING' && vmState !== 'PAUSED'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-medium disabled:opacity-40 transition-all"
            >
              <Pause className="w-3.5 h-3.5" /> {vmState === 'PAUSED' ? 'RESUME' : 'PAUSE'}
            </button>

            <button
              onClick={handleLock}
              disabled={vmState !== 'RUNNING' && vmState !== 'LOCKED'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700 text-xs font-medium disabled:opacity-40 transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> {vmState === 'LOCKED' ? 'UNLOCK' : 'LOCK'}
            </button>

            <button
              onClick={handlePanicLock}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> PANIC LOCK
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> CPU USAGE
            </div>
            <div className="text-slate-100 font-mono font-bold text-lg mt-1">
              {metrics.cpuUsagePercent}%
            </div>
            <div className="text-[11px] text-slate-500 font-mono">2 vCPUs allocated</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> RAM USAGE
            </div>
            <div className="text-slate-100 font-mono font-bold text-lg mt-1">
              {metrics.usedRamMb} / {metrics.allocatedRamMb} MB
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Host Cap: {currentProfile.totalRamGb} GB</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> SPATIAL STORAGE
            </div>
            <div className="text-slate-100 font-mono font-bold text-lg mt-1">
              {metrics.sparseAllocatedStorageGb.toFixed(1)} / {metrics.totalStorageGb} GB
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">Sparse Dynamic Allocation</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" /> NETWORK ISOLATION
            </div>
            <div className="text-slate-100 font-mono font-bold text-lg mt-1">
              {metrics.networkState}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Default: Fail-Closed</div>
          </div>
        </div>
      </div>

      {/* Storage Safety Reserve Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">
            Host Storage Safety Floor (Section 17 & 106)
          </h3>
          <span className="text-xs text-emerald-400 font-mono">Enforced Floor: 20.0 GB</span>
        </div>

        <p className="text-xs text-slate-400 mb-4 font-sans">
          The VM never consumes host storage unchecked. Expanding virtual disk capacity verifies that host free space remains strictly above the 20 GB reserve.
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Current Host Free Space:</span>
            <span className="text-cyan-300 font-bold">{currentProfile.availableStorageGb.toFixed(1)} GB</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
            <div
              className="bg-cyan-500 h-full"
              style={{ width: `${Math.min(100, (metrics.sparseAllocatedStorageGb / currentProfile.availableStorageGb) * 100)}%` }}
            />
            <div
              className="bg-amber-500/60 h-full"
              style={{ width: `${Math.min(100, (20.0 / currentProfile.availableStorageGb) * 100)}%` }}
              title="20 GB Mandatory Reserve"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>VM Sparse Disk: {metrics.sparseAllocatedStorageGb.toFixed(1)} GB</span>
            <span className="text-amber-400">Safety Floor Buffer: 20.0 GB</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs font-mono text-slate-400">Simulate Expansion:</span>
          {[5, 10, 20, 50].map((gb) => (
            <button
              key={gb}
              onClick={() => handleExpandStorage(gb)}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700"
            >
              +{gb} GB
            </button>
          ))}
        </div>
      </div>

      {/* Structured Security & Event Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">
              Live Controller Event Audit Log (Section 64)
            </h3>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-slate-500 hover:text-slate-300 font-mono"
          >
            Clear Log
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs max-h-60 overflow-y-auto space-y-1.5">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-4">No events logged</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 text-[10px] whitespace-nowrap">{l.timestamp.split('T')[1]?.replace('Z', '')}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 rounded ${
                    l.level === 'SEC'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : l.level === 'ERR'
                      ? 'bg-rose-500/20 text-rose-300'
                      : l.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {l.level}
                </span>
                <span className="text-slate-300 break-all">{l.event}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
