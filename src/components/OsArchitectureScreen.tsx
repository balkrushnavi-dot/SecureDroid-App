import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Server,
  Cpu,
  Lock,
  Code,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { OS_LAYERS, SYSTEM_SERVICES } from '../data/osArchitectureData';

export function OsArchitectureScreen() {
  const [selectedTab, setSelectedTab] = useState<'LAYERS' | 'SERVICES'>('LAYERS');

  return (
    <div id="os-architecture-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">OS Architecture & Privilege Boundaries</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 border border-sky-800 text-sky-300">
                  8-LAYER AOSP PLATFORM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rigid distinction between Application, System Server, Framework, Kernel, and Hardware Tiers
              </p>
            </div>
          </div>

          {/* Toggle Tab Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedTab('LAYERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                selectedTab === 'LAYERS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              8 OS Layers
            </button>
            <button
              onClick={() => setSelectedTab('SERVICES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                selectedTab === 'SERVICES'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Services
            </button>
          </div>
        </div>
      </div>

      {selectedTab === 'LAYERS' ? (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            SecureDroid OS 2.0 strictly categorizes every security capability into one of 8 distinct architectural layers. An ordinary APK application is never misrepresented as possessing OS-level privileges.
          </div>

          <div className="space-y-3">
            {OS_LAYERS.map(layer => (
              <div
                key={layer.layer}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{layer.title}</span>
                      <span className="text-xs font-mono text-slate-500 font-normal">({layer.scope})</span>
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold self-start sm:self-center ${
                      layer.apkCanImplement
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : 'bg-slate-950 border border-slate-800 text-sky-400'
                    }`}
                  >
                    {layer.requirementTag}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {layer.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">Enforcement Mechanism</div>
                    <div className="text-slate-300 text-[11px]">{layer.enforcementMechanism}</div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">Representative Features</div>
                    <ul className="text-slate-300 text-[11px] list-disc list-inside space-y-0.5">
                      {layer.examples.map((ex, idx) => (
                        <li key={idx} className="truncate">{ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            System services running in the <code className="text-sky-300 font-mono">system_server</code> process registered via Binder IPC interfaces:
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SYSTEM_SERVICES.map(svc => (
              <div
                key={svc.name}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                      <div className="text-[11px] font-mono text-sky-400 mt-0.5">{svc.binderInterface}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400">
                      {svc.requirementTag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Core Responsibilities</div>
                  <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1">
                    {svc.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
