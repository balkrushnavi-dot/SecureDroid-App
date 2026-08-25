import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidPlugin } from '../plugins/SecureDroidPlugin';
import { AppInfo, HardeningReport, VpnStatus } from '../types/security';

export function useAppScanner() {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hardening, setHardening] = useState<HardeningReport | null>(null);
    const [vpnStatus, setVpnStatus] = useState<VpnStatus | null>(null);

    const loadApps = async () => {
        if (!Capacitor.isNativePlatform()) {
            console.warn('Not running on native platform');
            return;
        }

        setLoading(true);
        try {
            const result = await SecureDroidPlugin.getInstalledApps();
            if (result.apps) {
                setApps(result.apps);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load apps');
        } finally {
            setLoading(false);
        }
    };

    const loadHardening = async () => {
        try {
            const result = await SecureDroidPlugin.getDeviceHardening();
            setHardening(result);
        } catch (err) {
            console.error('Failed to load hardening report:', err);
        }
    };

    const loadVpnStatus = async () => {
        try {
            const status = await SecureDroidPlugin.getVpnStatus();
            setVpnStatus(status);
        } catch (err) {
            console.error('Failed to load VPN status:', err);
        }
    };

    const startVpn = async () => {
        try {
            await SecureDroidPlugin.startVpn();
            await loadVpnStatus();
        } catch (err) {
            console.error('Failed to start VPN:', err);
        }
    };

    const stopVpn = async () => {
        try {
            await SecureDroidPlugin.stopVpn();
            await loadVpnStatus();
        } catch (err) {
            console.error('Failed to stop VPN:', err);
        }
    };

    const scanForRisks = async () => {
        try {
            const result = await SecureDroidPlugin.scanForRisks();
            return result;
        } catch (err) {
            console.error('Failed to scan for risks:', err);
            return null;
        }
    };

    useEffect(() => {
        loadApps();
        loadHardening();
        loadVpnStatus();
    }, []);

    return {
        apps,
        loading,
        error,
        hardening,
        vpnStatus,
        startVpn,
        stopVpn,
        loadApps,
        loadHardening,
        loadVpnStatus,
        scanForRisks,
        reload: () => {
            loadApps();
            loadHardening();
            loadVpnStatus();
        }
    };
}
