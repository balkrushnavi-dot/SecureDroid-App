import React from 'react';
import { Shield, Lock, AlertTriangle, Key, Layers, Server, Cpu, FileCheck } from 'lucide-react';

export const ThreatModelView: React.FC = () => {
  const threats = [
    {
      actor: 'T1 — Malicious Guest Application',
      scope: 'Application inside VM attempts escape to other guest apps, host files, clipboard, host network, or keys.',
      expectedResult: 'BLOCKED',
      mechanism: 'Enforced by Android UID sandbox + SELinux inside guest, plus hypervisor memory boundary preventing host access.',
      statusColor: 'emerald',
    },
    {
      actor: 'T2 — Malicious Host Application',
      scope: 'Normal host application attempts to read VM memory, inspect virtual disk plaintext, or inject code into VM.',
      expectedResult: 'BLOCKED',
      mechanism: 'Guest disk encrypted with AES-256-GCM using hardware-backed KeyMint. pKVM unmaps guest memory pages from host kernel.',
      statusColor: 'emerald',
    },
    {
      actor: 'T3 — Compromised Guest Operating System',
      scope: 'Guest kernel compromised by exploit attempts to break out of VM container to infect host OS.',
      expectedResult: 'BLOCKED',
      mechanism: 'Hypervisor (EL2 stage-2 translation) enforces strict architectural boundary; guest kernel cannot modify host page tables.',
      statusColor: 'emerald',
    },
    {
      actor: 'T4 — Compromised Host Operating System',
      scope: 'Host OS kernel is rooted/compromised and attempts to read guest memory and confidential data.',
      expectedResult: 'CONDITIONAL (pKVM vs Legacy)',
      mechanism: 'If pKVM (Protected VM) is active, host kernel is architecturally prohibited from reading guest memory. On legacy standard VM, host root can read guest memory.',
      statusColor: 'amber',
    },
    {
      actor: 'T5 — Lost / Stolen Device',
      scope: 'Attacker acquires physical device in locked or powered-off state.',
      expectedResult: 'PROTECTED',
      mechanism: 'Encrypted virtual disk with KeyMint hardware auth + user passphrase. Data is cryptographically unrecoverable without authorization.',
      statusColor: 'emerald',
    },
    {
      actor: 'T6 — Physical / Hardware Attacker (Chip Decapping / Glitching)',
      scope: 'Attacker desolders UFS flash chips or attempts direct inter-chip bus sniffing.',
      expectedResult: 'BOUNDED BY HARDWARE',
      mechanism: 'Plaintext not present on raw flash. Attacker must break Qualcomm TEE / AES-256-GCM silicon implementation. (Documented: TEE has physical attack limits compared to discrete StrongBox).',
      statusColor: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs font-mono text-cyan-400 mb-1">SECTION 4 & 56 SPECIFICATION</div>
        <h2 className="text-xl font-bold text-slate-100">Formal Threat Model & Trust Boundaries</h2>
        <p className="text-sm text-slate-400 mt-1 font-sans">
          Rigorous security boundaries separating Host, Controller, Virtualization Layer, Guest, and Hardware Keystore.
        </p>
      </div>

      {/* Trust Boundaries Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-3">
            <Server className="w-4 h-4" /> HOST ↔ GUEST ISOLATION BOUNDARIES
          </div>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold font-mono">What Host CANNOT See:</span>
              <ul className="list-disc list-inside text-slate-300 mt-1.5 space-y-1 font-sans">
                <li>Plaintext guest virtual disk storage (AES-256-GCM encrypted)</li>
                <li>Guest memory contents (when pKVM Protected VM is active)</li>
                <li>Guest keystore credentials & private keys</li>
                <li>Guest application internal sqlite databases</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-bold font-mono">What Host CAN Observe:</span>
              <ul className="list-disc list-inside text-slate-300 mt-1.5 space-y-1 font-sans">
                <li>Encrypted virtual disk file size & sparse I/O activity</li>
                <li>VM process CPU & RAM consumption metrics</li>
                <li>Host network bridge packet counts (if network enabled)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-3">
            <Key className="w-4 h-4" /> CRYPTOGRAPHIC KEY HIERARCHY (SECTION 14)
          </div>
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-emerald-400 font-bold">Qualcomm QSEE / Hardware-backed Keystore Root</div>
            <div className="pl-4 border-l border-slate-700 space-y-2">
              <div>
                <span className="text-cyan-300">├── SecureDroid Master Key (AES-256-GCM)</span>
                <p className="text-[11px] text-slate-500 font-sans">Bound to device hardware; never exportable in plaintext.</p>
              </div>
              <div>
                <span className="text-cyan-300">├── VM Storage Key (AES-XTS-256 / AES-GCM)</span>
                <p className="text-[11px] text-slate-500 font-sans">Derived per VM instance; used exclusively for guest disk block encryption.</p>
              </div>
              <div>
                <span className="text-cyan-300">├── Snapshot & Backup Key (HKDF SHA-256)</span>
                <p className="text-[11px] text-slate-500 font-sans">Cryptographically separated keys for snapshot exports and offline backups.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Actors Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-200 font-mono uppercase mb-4">
          Threat Actors Matrix (T1 – T6)
        </h3>

        <div className="space-y-3">
          {threats.map((t, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-100 text-sm font-mono">{t.actor}</span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    t.statusColor === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {t.expectedResult}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 font-sans">{t.scope}</p>
              <div className="mt-2 text-xs font-mono text-cyan-400/90 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                <strong>Enforcement:</strong> {t.mechanism}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
