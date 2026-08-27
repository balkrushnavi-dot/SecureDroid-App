import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidStatusChip,
} from './ui/designSystem';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import { NativeVpnStatus } from '../types/native';

interface NetworkControlScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

type UiState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'ERROR' | 'UNKNOWN';

export const NetworkControlScreen: React.FC<NetworkControlScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [status, setStatus] = useState<NativeVpnStatus | null>(null);
  const [state, setState] = useState<UiState>('UNKNOWN');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  const refreshStatus = useCallback(async () => {
    const res = await SecureDroidNative.getVpnStatus();
    if (res.success && res.data) {
      setStatus(res.data);
      setError(null);
    } else {
      setError(res.message || 'VPN status is unavailable on this device.');
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleToggle = async () => {
    setIsBusy(true);
    setError(null);

    try {
      const isActive = status?.isActive;

      if (isActive) {
        const res = await SecureDroidNative.stopVpn();
        if (res.data?.state) setState(res.data.state as UiState);
        if (!res.success) setError(res.message || 'Unable to stop VPN.');
      } else {
        const res = await SecureDroidNative.startVpn();

        if (res.data?.permissionRequired) {
          setNeedsPermission(true);
          setError(null);
        } else if (!res.success) {
          setError(res.message || 'Unable to start VPN.');
        } else if (res.data?.state) {
          setState(res.data.state as UiState);
        }
      }

      // The tunnel establishes asynchronously; poll shortly after
      // to reflect the real state rather than assuming success.
      setTimeout(refreshStatus, 1500);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRequestPermission = async () => {
    setIsBusy(true);
    try {
      const res = await SecureDroidNative.requestVpnPermission();
      if (res.success && res.data?.granted) {
        setNeedsPermission(false);
        // Permission was already granted; try starting now.
        await SecureDroidNative.startVpn();
        setTimeout(refreshStatus, 1500);
      } else if (res.success && res.data?.permissionRequested) {
        // System dialog was opened; wait for the user to respond,
        // then let them tap the toggle again.
        setNeedsPermission(false);
      } else if (!res.success) {
        setError(res.message || 'Unable to request VPN permission.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const isActive = !!status?.isActive;

  return (
    <div
      className={`min-h-full pb-24 ${
        isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      <SecureDroidTopBar
        title="Network Protection"
        subtitle="VPN Tunnel Status"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="p-4 space-y-4">
        <SecureDroidCard isLight={isLight} className="p-5 text-center">
          <div className="flex flex-col items-center gap-3">
            {isActive ? (
              <ShieldCheck className="w-12 h-12 text-emerald-400" />
            ) : (
              <ShieldOff className="w-12 h-12 text-zinc-500" />
            )}

            <SecureDroidStatusChip
              status={isActive ? 'CONNECTED' : status?.filterMode === 'DISABLED' ? 'OFF' : 'DISCONNECTED'}
              label={isActive ? 'VPN Active' : 'VPN Disconnected'}
              isLight={isLight}
              size="md"
            />

            <p className="text-xs text-zinc-500">
              {isActive
                ? 'Your traffic is routed through the SecureDroid VPN tunnel.'
                : 'The VPN tunnel is not currently protecting this device.'}
            </p>

            {needsPermission && (
              <div className="w-full mt-2 p-3 rounded-lg bg-amber-950/40 border border-amber-700/50 text-xs text-amber-300">
                Android needs your permission to establish a VPN tunnel.
                <div className="mt-2">
                  <SecureDroidButton
                    onClick={handleRequestPermission}
                    isLight={isLight}
                    disabled={isBusy}
                  >
                    Grant VPN Permission
                  </SecureDroidButton>
                </div>
              </div>
            )}

            {error && (
              <div className="w-full mt-2 p-3 rounded-lg bg-red-950/40 border border-red-700/50 text-xs text-red-300">
                {error}
              </div>
            )}

            <SecureDroidButton
              onClick={handleToggle}
              isLight={isLight}
              disabled={isBusy}
              variant={isActive ? 'danger' : 'primary'}
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className={`w-4 h-4 ${isBusy ? 'animate-spin' : ''}`} />
                {isActive ? 'Disconnect VPN' : 'Connect VPN'}
              </span>
            </SecureDroidButton>
          </div>
        </SecureDroidCard>

        {status && (
          <>
            <SecureDroidSectionHeader title="Connection Details" isLight={isLight} />
            <SecureDroidCard isLight={isLight} className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">DNS Server</span>
                <span>{status.activeDns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Filter Mode</span>
                <span>{status.filterMode}</span>
              </div>
            </SecureDroidCard>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-500">
              Domain-level filtering (blocklists, tracker blocking) is not yet
              implemented. The VPN tunnel establishes real network isolation,
              but does not currently inspect or block specific domains.
            </div>
          </>
        )}
      </div>
    </div>
  );
};
