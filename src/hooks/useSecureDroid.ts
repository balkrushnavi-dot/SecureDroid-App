// src/hooks/useSecureDroid.ts
import { useState, useEffect, useCallback } from 'react';
import { registerPlugin } from '@capacitor/core';

// Use registerPlugin, not Capacitor.Plugins.SecureDroid directly.
// registerPlugin returns a lazy proxy that resolves the native
// implementation on each call, so it works correctly regardless of
// whether native plugin registration has completed by the time this
// module is first evaluated. Reading Capacitor.Plugins.SecureDroid
// into a top-level const instead can capture `undefined` if this
// module runs before Capacitor finishes registering native plugins,
// and that undefined value never updates afterward.
interface SecureDroidPluginShape {
    checkConnection(): Promise<unknown>;
    getInstalledApps(): Promise<unknown>;
    scanForRisks(): Promise<unknown>;
}

const SecureDroid = registerPlugin<SecureDroidPluginShape>('SecureDroid');

// Types
export interface AppInfo {
    packageName: string;
    appName: string;
    versionName: string;
    versionCode: number;
    isSystemApp: boolean;
    installTime: number;
    updateTime: number;
    installSource: string;
    isSideloaded: boolean;
    permissions: string[];
}

export interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    reason: string;
    installSource: string;
}

export const useSecureDroid = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 useSecureDroid: Starting load...');

            // Try to check connection
            try {
                const connectionResult = await SecureDroid.checkConnection();
                console.log('📡 Connection result:', connectionResult);
                const isConnected = connectionResult && (connectionResult as any).connected === true;
                setConnected(isConnected);

                if (!isConnected) {
                    setError('Plugin not connected');
                    setLoading(false);
                    return;
                }
            } catch (connErr) {
                console.warn('Connection check failed:', connErr);
                setConnected(false);
                setError('Failed to connect to plugin');
                setLoading(false);
                return;
            }

            // Get installed apps
            try {
                const appsResult = await SecureDroid.getInstalledApps();
                console.log('📱 Apps result:', appsResult);
                
                if (appsResult && (appsResult as any).apps) {
                    const appList = (appsResult as any).apps;
                    setApps(appList);
                }
            } catch (appsErr) {
                console.error('Failed to get apps:', appsErr);
                // Continue - maybe we can still get risks
            }

            // Get risk scan
            try {
                const riskResult = await SecureDroid.scanForRisks();
                console.log('⚠️ Risk result:', riskResult);
                
                if (riskResult && (riskResult as any).riskDetails) {
                    const riskList = (riskResult as any).riskDetails;
                    setRisks(riskList);
                }
            } catch (riskErr) {
                console.error('Failed to get risks:', riskErr);
            }

            // Calculate score
            const riskCount = risks.length || 0;
            const newScore = Math.max(0, 100 - (riskCount * 3));
            setScore(newScore);

            setConnected(true);
            setError(null);

        } catch (err) {
            console.error('❌ useSecureDroid error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        apps,
        risks,
        loading,
        connected,
        error,
        score,
        reload: loadData
    };
};
