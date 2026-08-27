import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Shield,
    ShieldCheck,
    ShieldOff,
    RefreshCw,
    AlertTriangle,
    Wifi,
    Clock,
    Server,
    Filter,
    Activity,
    Lock,
    ChevronRight,
    Info,
    CheckCircle2,
    XCircle
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
    const [isHovered, setIsHovered] = useState(false);

    const pollInterval = useRef<NodeJS.Timeout | null>(null);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const pollAttempts = useRef(0);
    const maxPollAttempts = 15;

    const formatElapsedTime = useCallback((startTime: number): string => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, []);

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

    const refreshStatus = useCallback(async () => {
        try {
            const res = await SecureDroidNative.getVpnStatus();
            if (res.success && res.data) {
                setStatus(res.data);
                const state = res.data.state || 'DISCONNECTED';
                setConnectionState(state as ConnectionState);

                if (state === 'CONNECTED' && !connectionTime) {
                    setConnectionTime(Date.now());
                }
                if (state !== 'CONNECTED' && connectionTime) {
                    setConnectionTime(null);
                }

                setError(null);

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

    const handleToggle = async () => {
        setIsBusy(true);
        setError(null);
        setNeedsPermission(false);

        try {
            const isActive = status?.isActive;

            if (isActive) {
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

    const isConnected = connectionState === 'CONNECTED';
    const isConnecting = connectionState === 'CONNECTING' || connectionState === 'DISCONNECTING';
    const isError = connectionState === 'ERROR';

    const getStatusDisplay = () => {
        if (isConnected) return { label: 'Protected', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        if (isConnecting) return { label: 'Connecting...', icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10' };
        if (isError) return { label: 'Error', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' };
        return { label: 'Disconnected', icon: ShieldOff, color: 'text-slate-400', bg: 'bg-slate-800/50' };
    };

    const statusDisplay = getStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Network Protection"
                subtitle="VPN Tunnel Status"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="p-4 space-y-4">
                {/* Main Status Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                    <div className="flex flex-col items-center text-center">
                        <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${statusDisplay.bg} ${isConnected ? 'ring-4 ring-emerald-500/20' : ''
                                }`}
                        >
                            {isConnecting ? (
                                <RefreshCw className={`w-10 h-10 ${statusDisplay.color} animate-spin`} />
                            ) : (
                                <StatusIcon className={`w-10 h-10 ${statusDisplay.color}`} />
                            )}
                        </div>

                        <h2 className={`text-2xl font-bold ${statusDisplay.color}`}>
                            {statusDisplay.label}
                        </h2>

                        <p className="text-sm text-slate-400 mt-1 max-w-xs">
                            {isConnected
                                ? 'Your network traffic is encrypted and secure'
                                : isConnecting
                                    ? 'Establishing secure connection...'
                                    : isError
                                        ? 'Something went wrong with the VPN connection'
                                        : 'Enable VPN to protect your network traffic'}
                        </p>

                        {isConnected && connectionTime && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-400/70">
                                <Clock className="w-4 h-4" />
                                <span>Connected for {elapsedTime}</span>
                            </div>
                        )}

                        {needsPermission && (
                            <div className="w-full mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-700/50">
                                <p className="text-sm text-amber-300">Android requires permission to establish a VPN tunnel.</p>
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

                        <SecureDroidButton
                            onClick={handleToggle}
                            isLight={isLight}
                            disabled={isBusy || isConnecting}
                            variant={isConnected ? 'danger' : 'primary'}
                            className="mt-4 px-8 py-3 text-base min-w-[160px]"
                        >
                            <span className="flex items-center justify-center gap-2">
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
                </div>

                {/* Connection Details */}
                {status && (
                    <>
                        <SecureDroidSectionHeader title="Connection Details" isLight={isLight} />
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <Activity className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <span className="text-sm text-slate-400">Status</span>
                                </div>
                                <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
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
                        </div>
                    </>
                )}

                {/* Honest Disclaimer */}
                <div className="p-4 rounded-2xl border bg-amber-950/10 border-amber-800/30">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-400">Domain-level filtering is not yet implemented.</p>
                            <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                The VPN tunnel establishes real network isolation, but does not
                                currently inspect or block specific domains. This feature is coming
                                in a future update.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Use VPN */}
                <div className="p-4 rounded-2xl border bg-slate-900/50 border-slate-800">
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-300">Why use a VPN?</p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
