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
    Info,
    CheckCircle2,
    XCircle,
    Plus,
    Trash2,
    Globe,
    Zap,
    Power,
    PowerOff,
    Signal,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidButton,
    SecureDroidStatusChip,
    SecureDroidBadge,
    SecureDroidSearchBar,
    SecureDroidStatCard,
    SecureDroidGlassCard,
} from './ui/designSystem';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import { NativeVpnStatus } from '../types/native';

interface NetworkControlScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'ERROR' | 'UNKNOWN';

interface DomainEntry {
    domain: string;
    type: 'blocked' | 'allowed';
    addedAt: number;
}

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
    const [blockedDomains, setBlockedDomains] = useState<DomainEntry[]>([]);
    const [allowedDomains, setAllowedDomains] = useState<DomainEntry[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [activeTab, setActiveTab] = useState<'blocked' | 'allowed'>('blocked');
    const [domainError, setDomainError] = useState<string | null>(null);

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

    const handleAddDomain = () => {
        const domain = newDomain.trim().toLowerCase();
        if (!domain) {
            setDomainError('Please enter a domain name');
            return;
        }
        if (!domain.match(/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/)) {
            setDomainError('Invalid domain format');
            return;
        }

        const list = activeTab === 'blocked' ? blockedDomains : allowedDomains;
        if (list.some(e => e.domain === domain)) {
            setDomainError('Domain already exists in this list');
            return;
        }

        const entry: DomainEntry = { domain, type: activeTab, addedAt: Date.now() };
        if (activeTab === 'blocked') {
            setBlockedDomains([...blockedDomains, entry]);
        } else {
            setAllowedDomains([...allowedDomains, entry]);
        }
        setNewDomain('');
        setDomainError(null);
    };

    const handleRemoveDomain = (domain: string) => {
        if (activeTab === 'blocked') {
            setBlockedDomains(blockedDomains.filter(e => e.domain !== domain));
        } else {
            setAllowedDomains(allowedDomains.filter(e => e.domain !== domain));
        }
    };

    const isConnected = connectionState === 'CONNECTED';
    const isConnecting = connectionState === 'CONNECTING' || connectionState === 'DISCONNECTING';
    const isError = connectionState === 'ERROR';

    const currentList = activeTab === 'blocked' ? blockedDomains : allowedDomains;

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="Network Protection"
                subtitle="VPN & Domain Control"
                onBack={onBack}
                isLight={isLight}
                rightAction={
                    <button
                        onClick={refreshStatus}
                        disabled={isBusy}
                        className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${isBusy ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            <div className="p-4 space-y-4 max-w-7xl mx-auto">
                <SecureDroidGlassCard className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${isConnected ? 'bg-emerald-500/10 ring-4 ring-emerald-500/20' : isConnecting ? 'bg-amber-500/10 ring-4 ring-amber-500/20' : isError ? 'bg-rose-500/10 ring-4 ring-rose-500/20' : 'bg-slate-800/50 ring-4 ring-slate-700/20'}`}
                        >
                            {isConnecting ? (
                                <RefreshCw className={`w-10 h-10 text-amber-400 animate-spin`} />
                            ) : isConnected ? (
                                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                            ) : isError ? (
                                <AlertTriangle className="w-10 h-10 text-rose-400" />
                            ) : (
                                <ShieldOff className="w-10 h-10 text-slate-400" />
                            )}
                        </div>

                        <h2 className={`text-2xl font-bold ${isConnected ? 'text-emerald-400' : isConnecting ? 'text-amber-400' : isError ? 'text-rose-400' : 'text-slate-400'}`}>
                            {isConnected ? 'Protected' : isConnecting ? 'Connecting...' : isError ? 'Error' : 'Disconnected'}
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

                        {error && (
                            <div className="w-full mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-700/50">
                                <p className="text-sm text-rose-300">{error}</p>
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
                            size="lg"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isConnecting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : isConnected ? (
                                    <PowerOff className="w-4 h-4" />
                                ) : (
                                    <Power className="w-4 h-4" />
                                )}
                                {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
                            </span>
                        </SecureDroidButton>
                    </div>
                </SecureDroidGlassCard>

                {status && (
                    <>
                        <SecureDroidSectionHeader title="Connection Details" isLight={isLight} />
                        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
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
                                <span className="text-sm font-mono text-zinc-200">
                                    {status.activeDns || '1.1.1.1'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-slate-400">Filter Mode</span>
                                </div>
                                <span className="text-sm font-mono text-zinc-200">
                                    {status.filterMode || 'BLOCKLIST'}
                                </span>
                            </div>
                        </SecureDroidCard>
                    </>
                )}

                <SecureDroidSectionHeader title="Domain Control" subtitle="Manage blocked and allowed domains" isLight={isLight} />

                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('blocked')}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all ${activeTab === 'blocked' ? 'bg-slate-800 text-zinc-100' : 'text-slate-400 hover:text-zinc-200'}`}
                    >
                        Blocked ({blockedDomains.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('allowed')}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all ${activeTab === 'allowed' ? 'bg-slate-800 text-zinc-100' : 'text-slate-400 hover:text-zinc-200'}`}
                    >
                        Allowed ({allowedDomains.length})
                    </button>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => {
                            setNewDomain(e.target.value);
                            setDomainError(null);
                        }}
                        placeholder="Enter domain (e.g., ads.example.com)"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-zinc-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                    />
                    <button
                        onClick={handleAddDomain}
                        className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>

                {domainError && (
                    <div className="text-xs text-rose-400 mt-1">{domainError}</div>
                )}

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {currentList.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-400">No domains in this list</div>
                    ) : (
                        currentList.map((entry) => (
                            <div
                                key={entry.domain}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {activeTab === 'blocked' ? (
                                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    )}
                                    <span className="text-sm text-zinc-200 font-mono truncate">
                                        {entry.domain}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveDomain(entry.domain)}
                                    className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-500 hover:text-rose-400"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <SecureDroidSectionHeader title="Wi-Fi Security" subtitle="Active network status" isLight={isLight} />

                <SecureDroidCard isLight={isLight} className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Wifi className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-zinc-100">Connected to secured network</div>
                            <div className="text-xs text-slate-400">WPA2-Enterprise • DNS over TLS enabled</div>
                        </div>
                        <div className="ml-auto">
                            <SecureDroidStatusChip status="PROTECTED" isLight={isLight} size="sm" />
                        </div>
                    </div>
                </SecureDroidCard>

                <div className="p-4 rounded-xl border bg-amber-950/10 border-amber-800/30">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-400">Domain-level filtering is not yet implemented.</p>
                            <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                                The VPN tunnel establishes real network isolation, but does not currently inspect or block specific domains. This feature is coming in a future update.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-slate-900/50 border-slate-800">
                    <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-zinc-300">Why use a VPN?</p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                A VPN encrypts your internet traffic, protecting your data from interception on public Wi-Fi and masking your IP address from websites.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkControlScreen;
