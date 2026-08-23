import React from 'react';
import { CapabilityItem, FullCapabilityModel } from '../types/securedroid';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Terminal,
  Cpu,
  Info,
  CheckCircle2,
  Wrench,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface CapabilityDetailModalProps {
  capability: CapabilityItem | FullCapabilityModel | null;
  onClose: () => void;
  isLight?: boolean;
}

export function CapabilityDetailModal({ capability, onClose, isLight = false }: CapabilityDetailModalProps) {
  if (!capability) return null;

  const getStatusBadge = () => {
    switch (capability.state) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            SUPPORTED
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            PARTIALLY AVAILABLE
          </span>
        );
      case 'UNSUPPORTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            UNAVAILABLE ON HOST
          </span>
        );
      case 'REQUIRES_KERNEL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Cpu className="w-3.5 h-3.5" />
            REQUIRES KERNEL SUPPORT
          </span>
        );
      case 'REQUIRES_SYSTEM_APP':
      case 'REQUIRES_FRAMEWORK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Layers className="w-3.5 h-3.5" />
            REQUIRES OS INTEGRATION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-700/50 text-zinc-300 border border-zinc-600">
            <HelpCircle className="w-3.5 h-3.5" />
            {capability.state}
          </span>
        );
    }
  };

  return (
    <div
      id="capability-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="capability-modal-container"
        className={`border rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative my-8 max-h-[90vh] overflow-y-auto ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/40 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 font-semibold">
                {capability.category} CAPABILITY
              </span>
              {getStatusBadge()}
              {capability.isDemo && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEMO DATA
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight">{capability.name}</h2>
          </div>
          <button
            id="close-capability-modal-button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-sm leading-relaxed">
          {/* Implementation Layer & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Implementation Layer</span>
              <div className="font-semibold text-xs mt-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>{capability.implementationLayer || 'APPLICATION'}</span>
              </div>
            </div>
            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Capability Provider</span>
              <div className="font-semibold text-xs mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{capability.provider || 'DemoCapabilityProvider'}</span>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className={`border rounded-2xl p-4 space-y-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Terminal className="w-4 h-4 text-sky-400" />
              Direct Evidence & Technical Probe
            </div>
            <div className="font-mono text-xs text-sky-400 bg-black/40 p-3 rounded-xl border border-zinc-800/80 break-all">
              {capability.evidence}
            </div>
          </div>

          {/* Security Meaning */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security Meaning & Impact
            </div>
            <p className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
            }`}>
              {capability.securityMeaning || (capability as any).securityImpact}
            </p>
          </div>

          {/* Limitations & Remediation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isLight ? 'bg-amber-50/50 border-amber-200/70 text-amber-950' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Platform Limitation
              </div>
              <p className="text-xs">{capability.limitations || (capability as any).currentLimitation || 'None detected on current platform.'}</p>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Wrench className="w-3.5 h-3.5" />
                Remediation / Path
              </div>
              <p className="text-xs">{capability.remediation || (capability as any).requiredChanges || 'Standard platform operational.'}</p>
            </div>
          </div>

          {/* POCO X5 Pro 5G Specific Note */}
          {capability.pocoSpecificNote && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
              isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
            }`}>
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-sky-400">POCO X5 Pro 5G Hardware Note: </span>
                {capability.pocoSpecificNote}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium text-xs border transition-colors ${
              isLight ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-900 hover:bg-white'
            }`}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
