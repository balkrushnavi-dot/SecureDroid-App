import React from 'react';
import {
  Users,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';

export function UserProfilesScreen() {
  return (
    <div id="user-profiles-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">User Profiles vs. VM Isolation</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 border border-blue-800 text-blue-300">
                  ISOLATION BOUNDARY COMPARISON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Architectural distinction between Android OS multi-user profiles and hardware hypervisor virtual machines
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-[10px] text-slate-500 font-mono">BOUNDARY COMPARISON</div>
            <div className="text-xs font-mono font-bold text-blue-300">UID vs EL2 Stage-2</div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Android Multi-User Profiles */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Android User Profiles
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-950 border border-slate-800 text-blue-300">
              UID 100000+ RANGE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Kernel Sharing</span>
                <span className="font-mono text-amber-400 font-bold">Shared Host Kernel</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Memory Isolation</span>
                <span className="font-mono text-slate-300">Linux Page Tables (MMU)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Vulnerability Surface</span>
                <span className="font-mono text-amber-400">Kernel Syscall Surface</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Data Separation</span>
                <span className="font-mono text-emerald-400">Separate /data/user/10 Directory</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Android User Profiles isolate applications and storage using distinct Linux UID offsets. However, all profiles still execute on the <strong>same shared Linux kernel</strong>. If a kernel privilege escalation vulnerability occurs, profile boundaries can be compromised.
            </p>
          </div>
        </div>

        {/* Card 2: Hardware Hypervisor VM Isolation */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Hypervisor VM Isolation (pKVM)
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-950 border border-purple-800 text-purple-300">
              ARM EL2 STAGE-2
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Kernel Sharing</span>
                <span className="font-mono text-emerald-400 font-bold">Independent Guest Kernel</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Memory Isolation</span>
                <span className="font-mono text-purple-400 font-bold">Stage-2 Translation (Unmapped)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Host Compromise Resilience</span>
                <span className="font-mono text-emerald-400 font-bold">Resistant to Host Root Exploits</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>IPC Channel</span>
                <span className="font-mono text-sky-400">Strict virtio-vsock only</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              In ARM EL2 Protected Virtual Machines (pKVM), the hypervisor strips the host kernel of stage-2 memory translation rights to the guest RAM. Even if the Android host operating system kernel is completely compromised, it cannot read guest memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
