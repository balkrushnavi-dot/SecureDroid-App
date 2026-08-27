import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Shield,
    ShieldCheck,
    ShieldOff,
    RefreshCw,
    AlertTriangle,
    Wifi,
    WifiOff,
    Clock,
    Server,
    Filter,
    Activity,
    Lock,
    ChevronRight,
    Info
} from 'lucide-react';
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

type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'ERROR' | 'UNKNOWN';

export const NetworkControlScreen: React.FC<NetworkControlScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [status, setStatus] = useState<NativeVpnStatus | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('UNKNOWN');
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [connectionTime, setConnectionTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00');

    const pollInterval = useRef<NodeJS.Timeout | null>(null);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const pollAttempts = useRef(0);
    const maxPollAttempts = 15;

    // Format elapsed time
    const formatElapsedTime = useCallback((startTime: number): string => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, []);

    // Update elapsed time timer
    useEffect(() => {
        if (connectionState === 'CONNECTED' && connectionTime) {
            timerInterval.current = setInterval(() => {
                setElapsedTime(formatElapsedTime(connectionTime));
            }, 1000);
        } else {
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
            if (connectionState !== 'CONNECTED') {
                setElapsedTime('00:00');
            }
        }

        return () => {
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
        };
    }, [connectionState, connectionTime, formatElapsedTime]);

    // Refresh VPN status
    const refreshStatus = useCallback(async () => {
        try {
            const res = await SecureDroidNative.getVpnStatus();
            if (res.success && res.data) {
                setStatus(res.data);

                // Map state
                const state = res.data.state || 'DISCONNECTED';
                setConnectionState(state as ConnectionState);

                // If connected, track connection time
                if (state === 'CONNECTED' && !connectionTime) {
                    setConnectionTime(Date.now());
                }

                if (state !== 'CONNECTED' && connectionTime) {
                    setConnectionTime(null);
                }

                setError(null);

                // Stop polling if connected or error
                if ((state === 'CONNECTED' || state === 'ERROR') && pollInterval.current) {
                    clearInterval(pollInterval.current);
                    pollInterval.current = null;
                    pollAttempts.current = 0;
                }
            } else {
                setError(res.message || 'VPN status is unavailable.');
                setConnectionState('ERROR');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get VPN status');
            setConnectionState('ERROR');
        }
    }, [connectionTime]);

    // Start polling for connection status
    const startPolling = useCallback(() => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }

        pollAttempts.current = 0;

        pollInterval.current = setInterval(() => {
            pollAttempts.current++;
            if (pollAttempts.current > maxPollAttempts) {
                clearInterval(pollInterval.current!);
                pollInterval.current = null;
                setError('VPN connection timed out. Please try again.');
                setConnectionState('ERROR');
                return;
            }
            refreshStatus();
        }, 1500);

        refreshStatus();
    }, [refreshStatus]);

    // Initial load and cleanup
    useEffect(() => {
        refreshStatus();
        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
                pollInterval.current = null;
            }
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
        };
    }, [refreshStatus]);

    // Handle connect/disconnect toggle
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
                    setConnectionState(res.data.state as ConnectionState);
                }
                if (!res.success) {
                    setError(res.message || 'Unable to stop VPN.');
                }
                setConnectionTime(null);
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
                    setConnectionState('ERROR');
                    setIsBusy(false);
                    return;
                }

                setConnectionState('CONNECTING');
                startPolling();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'VPN operation failed');
            setConnectionState('ERROR');
        } finally {
            setIsBusy(false);
        }
    };

    // Handle permission request
    const handleRequestPermission = async () => {
        setIsBusy(true);
        setError(null);

        try {
            const res = await SecureDroidNative.requestVpnPermission();

            if (res.success && res.data?.granted) {
                setNeedsPermission(false);
                const startResult = await SecureDroidNative.startVpn();
                if (startResult.success) {
                    setConnectionState('CONNECTING');
                    startPolling();
                } else {
                    setError(startResult.message || 'Failed to start VPN after permission grant');
                }
            } else if (res.success && res.data?.permissionRequested) {
                setNeedsPermission(false);
                setError('Please grant VPN permission in the system dialog.');
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

    // Determine UI state
    const isConnected = connectionState === 'CONNECTED';
    const isConnecting = connectionState === 'CONNECTING' || connectionState === 'DISCONNECTING';
    const isError = connectionState === 'ERROR';

    // Get status display
    const getStatusDisplay = () => {
        if (isConnected) {
            return { label: 'Protected', icon: ShieldCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
        }
        if (isConnecting) {
            return { label: 'Connecting...', icon: RefreshCw, color: 'text-amber-400', bgColor: 'bg-amber-500/10' };
        }
        if (isError) {
            return { label: 'Error', icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/10' };
        }
        return { label: 'Disconnected', icon: ShieldOff, color: 'text-slate-400', bgColor: 'bg-slate-800/50' };
    };

    const statusDisplay = getStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    return (
        <div
            className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
                }`}
        >
            <SecureDroidTopBar
                title="Network Protection"
                subtitle="VPN Tunnel Status"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Main Status Card */}
                <SecureDroidCard isLight={isLight} highlight className="p-6">
                    <div className="flex flex-col items-center text-center">
                        {/* Large Status Icon */}
                        <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${statusDisplay.bgColor
                                } ${isConnected ? 'ring-4 ring-emerald-500/20' : ''
                                }`}
                        >
                            {isConnecting ? (
                                <RefreshCw className={`w-10 h-10 ${statusDisplay.color} animate-spin`} />
                            ) : (
                                <StatusIcon className={`w-10 h-10 ${statusDisplay.color}`} />
                            )}
                        </div>

                        {/* Status Label */}
                        <h2 className={`text-2xl font-bold ${statusDisplay.color}`}>
                            {statusDisplay.label}
                        </h2>

                        {/* Status Description */}
                        <p className="text-sm text-slate-400 mt-1 max-w-xs">
                            {isConnected
                                ? 'Your network traffic is encrypted and secure'
                                : isConnecting
                                    ? 'Establishing secure connection...'
                                    : isError
                                        ? 'Something went wrong with the VPN connection'
                                        : 'Enable VPN to protect your network traffic'}
                        </p>

                        {/* Connection Timer */}
                        {isConnected && connectionTime && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-400/70">
                                <Clock className="w-4 h-4" />
                                <span>Connected for {elapsedTime}</span>
                            </div>
                        )}

                        {/* Permission Required */}
                        {needsPermission && (
                            <div className="w-full mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-700/50">
                                <p className="text-sm text-amber-300">
                                    Android requires permission to establish a VPN tunnel.
                                </p>
                                <SecureDroidButton
                                    onClick={handleRequestPermission}
                                    isLight={isLight}
                                    disabled={isBusy}
                                    className="mt-3"
                                >
                                    Grant Permission
                                </SecureDroidButton>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="w-full mt-4 p-4 rounded-xl bg-red-950/40 border border-red-700/50">
                                <p className="text-sm text-red-300">{error}</p>
                                {error.includes('timed out') && (
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setConnectionState('DISCONNECTED');
                                        }}
                                        className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline"
                                    >
                                        Dismiss
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Connect/Disconnect Button */}
                        <SecureDroidButton
                            onClick={handleToggle}
                            isLight={isLight}
                            disabled={isBusy || isConnecting}
                            variant={isConnected ? 'danger' : 'primary'}
                            className="mt-4 px-8 py-3 text-base"
                        >
                            <span className="flex items-center gap-2">
                                {isConnecting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : isConnected ? (
                                    <Lock className="w-4 h-4" />
                                ) : (
                                    <Shield className="w-4 h-4" />
                                )}
                                {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
                            </span>
                        </SecureDroidButton>
                    </div>
                </SecureDroidCard>

                {/* Connection Details */}
                {status && (
                    <>
                        <SecureDroidSectionHeader
                            title="Connection Details"
                            isLight={isLight}
                        />

                        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <Activity className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <span className="text-sm text-slate-400">Status</span>
                                </div>
                                <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-400'
                                    }`}>
                                    {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <Server className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-slate-400">DNS Server</span>
                                </div>
                                <span className="text-sm font-mono text-slate-200">
                                    {status.activeDns || '1.1.1.1'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-slate-400">Filter Mode</span>
                                </div>
                                <span className="text-sm font-mono text-slate-200">
                                    {status.filterMode || 'BLOCKLIST'}
                                </span>
                            </div>
                        </SecureDroidCard>
                    </>
                )}

                {/* Data Stats (Future) */}
                {isConnected && (
                    <SecureDroidCard isLight={isLight} className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-xs text-slate-400">Data Received</div>
                                <div className="text-sm font-semibold text-slate-200">0 MB</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-400">Data Sent</div>
                                <div className="text-sm font-semibold text-slate-200">0 MB</div>
                            </div>
                        </div>
                    </SecureDroidCard>
                )}

                {/* Honest Disclaimer */}
                <div
                    className={`p-4 rounded-xl border text-xs ${isLight
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-amber-950/20 border-amber-800/30 text-amber-400'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Domain-level filtering is not yet implemented.</p>
                            <p className="mt-1 opacity-80 leading-relaxed">
                                The VPN tunnel establishes real network isolation, but does not
                                currently inspect or block specific domains. This feature is coming
                                in a future update.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Tips */}
                <div
                    className={`p-4 rounded-xl border text-xs ${isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                        <div>
                            <p className="font-medium text-slate-300">Why use a VPN?</p>
                            <p className="mt-1 opacity-70 leading-relaxed">
                                A VPN encrypts your internet traffic, protecting your data from
                                interception on public Wi-Fi and masking your IP address from websites.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkControlScreen;
