import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ShieldCheck, ShieldOff, RefreshCw, AlertTriangle } from 'lucide-react';
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
  const [uiState, setUiState] = useState<UiState>('UNKNOWN');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const pollAttempts = useRef(0);
  const maxPollAttempts = 10;

  const refreshStatus = useCallback(async () => {
    try {
      const res = await SecureDroidNative.getVpnStatus();
      if (res.success && res.data) {
        setStatus(res.data);
        setUiState(res.data.state as UiState);
        setError(null);

        // If we're trying to connect and we get CONNECTED, stop polling
        if (res.data.state === 'CONNECTED' && pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
          pollAttempts.current = 0;
        }
        // If we get ERROR, stop polling
        if (res.data.state === 'ERROR' && pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
          pollAttempts.current = 0;
        }
      } else {
        setError(res.message || 'VPN status is unavailable on this device.');
        setUiState('ERROR');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get VPN status');
      setUiState('ERROR');
    }
  }, []);

  // Initial load and cleanup
  useEffect(() => {
    refreshStatus();
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [refreshStatus]);

  const startPolling = useCallback(() => {
    // Clear any existing poll
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }

    pollAttempts.current = 0;

    // Poll every 1.5 seconds for up to maxPollAttempts
    pollInterval.current = setInterval(() => {
      pollAttempts.current++;
      if (pollAttempts.current > maxPollAttempts) {
        clearInterval(pollInterval.current!);
        pollInterval.current = null;
        setError('VPN connection timed out. Please try again.');
        setUiState('ERROR');
        return;
      }
      refreshStatus();
    }, 1500);

    // Do an immediate refresh
    refreshStatus();
  }, [refreshStatus]);

  const handleToggle = async () => {
    setIsBusy(true);
    setError(null);
    setNeedsPermission(false);

    try {
      const isActive = status?.isActive;

      if (isActive) {
        // Disconnect
        const res = await SecureDroidNative.stopVpn();
        if (res.data?.state) {
          setUiState(res.data.state as UiState);
        }
        if (!res.success) {
          setError(res.message || 'Unable to stop VPN.');
        }
        // Refresh status after stop
        setTimeout(refreshStatus, 1000);
      } else {
        // Connect
        const res = await SecureDroidNative.startVpn();

        if (res.data?.permissionRequired) {
          setNeedsPermission(true);
          setError(null);
          setIsBusy(false);
          return;
        }

        if (!res.success) {
          setError(res.message || 'Unable to start VPN.');
          setUiState('ERROR');
          setIsBusy(false);
          return;
        }

        // Set state to CONNECTING and start polling
        setUiState('CONNECTING');
        startPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'VPN operation failed');
      setUiState('ERROR');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRequestPermission = async () => {
    setIsBusy(true);
    setError(null);

    try {
      const res = await SecureDroidNative.requestVpnPermission();

      if (res.success && res.data?.granted) {
        setNeedsPermission(false);
        // Permission was already granted or just granted
        const startResult = await SecureDroidNative.startVpn();
        if (startResult.success) {
          setUiState('CONNECTING');
          startPolling();
        } else {
          setError(startResult.message || 'Failed to start VPN after permission grant');
        }
      } else if (res.success && res.data?.permissionRequested) {
        // System dialog was opened
        setNeedsPermission(false);
        setError('Please grant VPN permission in the system dialog.');
        // Start polling to check when permission is granted
        startPolling();
      } else {
        setError(res.message || 'Unable to request VPN permission.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permission request failed');
    } finally {
      setIsBusy(false);
    }
  };

  const isActive = uiState === 'CONNECTED';
  const isConnecting = uiState === 'CONNECTING' || uiState === 'DISCONNECTING';

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
            ) : isConnecting ? (
              <RefreshCw className="w-12 h-12 text-amber-400 animate-spin" />
            ) : uiState === 'ERROR' ? (
              <AlertTriangle className="w-12 h-12 text-red-400" />
            ) : (
              <ShieldOff className="w-12 h-12 text-zinc-500" />
            )}

            <SecureDroidStatusChip
              status={isActive ? 'CONNECTED' : isConnecting ? 'CONNECTING' : uiState === 'ERROR' ? 'ERROR' : 'DISCONNECTED'}
              label={isActive ? 'VPN Active' : isConnecting ? 'Connecting...' : uiState === 'ERROR' ? 'Error' : 'VPN Disconnected'}
              isLight={isLight}
              size="md"
            />

            <p className="text-xs text-zinc-500">
              {isActive
                ? 'Your traffic is routed through the SecureDroid VPN tunnel.'
                : isConnecting
                ? 'Establishing VPN connection...'
                : uiState === 'ERROR'
                ? 'There was an error with the VPN connection.'
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
                {error.includes('timed out') && (
                  <button
                    onClick={() => {
                      setError(null);
                      setUiState('DISCONNECTED');
                    }}
                    className="mt-1 text-amber-400 hover:text-amber-300 underline"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            )}

            <SecureDroidButton
              onClick={handleToggle}
              isLight={isLight}
              disabled={isBusy || isConnecting}
              variant={isActive ? 'danger' : 'primary'}
            >
              <span className="flex items-center gap-1.5">
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isActive ? 'Disconnect VPN' : isConnecting ? 'Connecting...' : 'Connect VPN'}
              </span>
            </SecureDroidButton>
          </div>
        </SecureDroidCard>

        {status && (
          <>
            <SecureDroidSectionHeader title="Connection Details" isLight={isLight} />
            <SecureDroidCard isLight={isLight} className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>
                  {isActive ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
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

export default NetworkControlScreen;
