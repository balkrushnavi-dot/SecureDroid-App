import React, { useCallback, useEffect, useState } from 'react';

import {
  Smartphone,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Cpu,
  HardDrive,
  Info,
} from 'lucide-react';

import { DeviceProfile } from '../types/securedroid';
import { DEVICE_PROFILES } from '../data/deviceProfiles';

import { SecureDroidNative } from '../services/native/SecureDroidNative';

import type { NativeDeviceInfo } from '../types/native';

interface DeviceProfileScreenProps {
  currentProfile: DeviceProfile;
  setProfile: (profile: DeviceProfile) => void;
  securityScore: any;
}

export function DeviceProfileScreen({
  currentProfile,
  setProfile,
}: DeviceProfileScreenProps) {
  const [liveInfo, setLiveInfo] =
    useState<NativeDeviceInfo | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [runtimePlatform, setRuntimePlatform] =
    useState<string>('unknown');

  const fetchLiveInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        await SecureDroidNative.getDeviceInfo();

      if (!result.success || !result.data) {
        setLiveInfo(null);

        setRuntimePlatform(
          result.runtimePlatform || 'unknown'
        );

        setError(
          result.message ||
            'Native device information is unavailable.'
        );

        return;
      }

      setLiveInfo(result.data);

      setRuntimePlatform(
        result.runtimePlatform || 'unknown'
      );
    } catch (err: any) {
      setLiveInfo(null);

      setError(
        err?.message ||
          'Unable to obtain device information.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveInfo();
  }, [fetchLiveInfo]);

  const isNative =
    runtimePlatform === 'android_native';

  const selectedReference =
    DEVICE_PROFILES.find(
      (profile) => profile.id === currentProfile.id
    );

  return (
    <div
      id="device-profile-screen-container"
      className="space-y-6 pb-12"
    >
      {/* ============================================================
          HEADER
         ============================================================ */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />

              HARDWARE & ARCHITECTURE DIAGNOSTICS
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Device Profile
            </h2>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isNative
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {isNative
                  ? '● NATIVE ANDROID EVIDENCE'
                  : '● LIVE DEVICE EVIDENCE UNAVAILABLE'}
              </span>

              {liveInfo && (
                <span className="text-xs text-slate-400">
                  {liveInfo.manufacturer}{' '}
                  {liveInfo.model}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => void fetchLiveInfo()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-mono rounded-xl border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ============================================================
          ERROR
         ============================================================ */}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />

            <div>
              <p className="text-xs font-semibold text-rose-300">
                Live device evidence unavailable
              </p>

              <p className="text-[11px] text-rose-200/70 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          LIVE DEVICE
         ============================================================ */}

      {liveInfo ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">

            <DiagnosticCard
              label="DEVICE IDENTITY"
              value={`${liveInfo.brand} • ${liveInfo.model}`}
              detail={`Manufacturer: ${liveInfo.manufacturer}`}
              icon={<Smartphone className="w-4 h-4" />}
            />

            <DiagnosticCard
              label="CPU ARCHITECTURE"
              value={liveInfo.cpuArchitecture}
              detail={
                liveInfo.supportedAbis.length
                  ? liveInfo.supportedAbis.join(', ')
                  : 'ABI information unavailable'
              }
              icon={<Cpu className="w-4 h-4" />}
            />

            <DiagnosticCard
              label="ANDROID"
              value={`Android ${liveInfo.androidVersion}`}
              detail={`API ${liveInfo.sdkVersion}`}
              icon={<Shield className="w-4 h-4" />}
            />

            <DiagnosticCard
              label="SECURITY PATCH"
              value={liveInfo.securityPatch}
              detail="Reported by native device layer"
              icon={<Shield className="w-4 h-4" />}
            />

            <DiagnosticCard
              label="MEMORY"
              value={`${(
                liveInfo.totalRamMb / 1024
              ).toFixed(1)} GB total`}
              detail={`${(
                liveInfo.availableRamMb / 1024
              ).toFixed(1)} GB available`}
              icon={<Cpu className="w-4 h-4" />}
            />

            <DiagnosticCard
              label="STORAGE"
              value={`${(
                liveInfo.totalStorageBytes /
                1024 ** 3
              ).toFixed(1)} GB total`}
              detail={`${(
                liveInfo.availableStorageBytes /
                1024 ** 3
              ).toFixed(1)} GB available`}
              icon={<HardDrive className="w-4 h-4" />}
            />
          </div>

          {/* Security-sensitive capabilities */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />

              <div>
                <h3 className="text-lg font-bold text-white">
                  Security Evidence
                </h3>

                <p className="text-xs text-slate-400">
                  Only values exposed by the native bridge are shown.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EvidenceRow
                label="Bootloader Locked"
                value={
                  liveInfo.bootloaderLocked === undefined
                    ? 'NOT REPORTED'
                    : liveInfo.bootloaderLocked
                      ? 'YES'
                      : 'NO'
                }
                supported={
                  liveInfo.bootloaderLocked !== undefined
                }
              />

              <EvidenceRow
                label="KVM Virtualization"
                value={
                  liveInfo.kvmVirtualizationSupported === undefined
                    ? 'NOT REPORTED'
                    : liveInfo.kvmVirtualizationSupported
                      ? 'SUPPORTED'
                      : 'NOT SUPPORTED'
                }
                supported={
                  liveInfo.kvmVirtualizationSupported !==
                  undefined
                }
              />

              <EvidenceRow
                label="Emulator"
                value={
                  liveInfo.isEmulator
                    ? 'YES'
                    : 'NO'
                }
                supported
              />

              <EvidenceRow
                label="Build Fingerprint"
                value={
                  liveInfo.buildFingerprint ||
                  'NOT REPORTED'
                }
                supported={
                  Boolean(liveInfo.buildFingerprint)
                }
              />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />

            <div>
              <h3 className="text-sm font-bold text-white">
                No live device profile
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Reference profiles are deliberately not displayed as
                current-device facts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          REFERENCE PROFILES
         ============================================================ */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              REFERENCE DATA
            </div>

            <h3 className="text-lg font-bold text-white">
              Architecture Reference Profiles
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              These profiles are simulations/reference material only.
              They do not describe the current Android device.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />

            <span className="text-[10px] text-indigo-300 font-mono">
              NEVER USED AS LIVE EVIDENCE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEVICE_PROFILES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setProfile(profile)}
              className={`text-left p-4 rounded-xl border transition ${
                selectedReference?.id === profile.id
                  ? 'bg-indigo-500/10 border-indigo-700'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">
                  {profile.name}
                </span>

                <span className="text-[9px] font-mono text-indigo-300 border border-indigo-800 rounded px-1.5 py-0.5">
                  REFERENCE
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                {profile.manufacturer} {profile.model}
              </p>

              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {profile.androidVersion}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Explicit warning */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />

          <p className="text-[11px] text-amber-200/80">
            A reference profile can explain what a platform may support,
            but it cannot prove that this device has that capability.
            SecureDroid therefore keeps reference data separate from
            live Android evidence.
          </p>
        </div>
      </div>
    </div>
  );
}

function DiagnosticCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
      <span className="text-slate-500 font-mono text-[10px] uppercase flex items-center gap-1.5">
        {icon}
        {label}
      </span>

      <div className="text-sm font-bold text-white break-words">
        {value}
      </div>

      <p className="text-slate-400 text-[11px] font-mono break-words">
        {detail}
      </p>
    </div>
  );
}

function EvidenceRow({
  label,
  value,
  supported,
}: {
  label: string;
  value: string;
  supported: boolean;
}) {
  return (
    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
      <div className="text-[10px] text-slate-500 font-mono">
        {label}
      </div>

      <div
        className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${
          supported
            ? 'text-emerald-400'
            : 'text-amber-400'
        }`}
      >
        {supported ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5" />
        )}

        {value}
      </div>
    </div>
  );
}
