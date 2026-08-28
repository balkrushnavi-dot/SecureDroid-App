import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeInstalledApp, NativeAppRiskReport } from '../types/native';

export type AppInfo = NativeInstalledApp;

export interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    securityScore?: number;
    findingCount?: number;
    findings?: Array<{
        code?: string;
        title?: string;
        description?: string;
        severity?: string;
        points?: number;
    }>;
    reason?: string;
    installSource?: string;
    isSystemApp?: boolean;
}

// Mock data for web preview / fallback
const MOCK_APPS: AppInfo[] = [
    {
        packageName: 'com.example.demo',
        label: 'Demo App',
        versionName: '1.0.0',
        versionCode: 1,
        targetSdk: 33,
        minSdk: 21,
        isSystemApp: false,
        isLaunchable: true,
        firstInstallTime: Date.now() - 86400000,
        lastUpdateTime: Date.now(),
        requestedPermissions: ['android.permission.CAMERA'],
        grantedPermissions: ['android.permission.CAMERA'],
        dangerousPermissions: ['android.permission.CAMERA'],
        installerPackage: 'com.android.vending',
        isDebuggable: false,
        enabled: true,
    },
    {
        packageName: 'com.android.chrome',
        label: 'Chrome',
        versionName: '120.0.0',
        versionCode: 120,
        targetSdk: 33,
        minSdk: 21,
        isSystemApp: true,
        isLaunchable: true,
        firstInstallTime: Date.now() - 86400000 * 30,
        lastUpdateTime: Date.now() - 86400000,
        requestedPermissions: ['android.permission.INTERNET'],
        grantedPermissions: ['android.permission.INTERNET'],
        dangerousPermissions: [],
        installerPackage: 'com.android.vending',
        isDebuggable: false,
        enabled: true,
    },
];

const MOCK_RISKS: RiskInfo[] = [
    {
        appName: 'Demo App',
        packageName: 'com.example.demo',
        riskLevel: 'HIGH',
        findings: [{ code: 'CAMERA', title: 'Camera Permission', description: 'App has camera permission', severity: 'HIGH' }],
    },
];

const MOCK_HARDENING = {
    score: 75,
    findings: [
        { id: 'SCREEN_LOCK_ENABLED', level: 'GOOD', summary: 'Screen lock is configured.' },
        { id: 'DEVICE_ENCRYPTED', level: 'GOOD', summary: 'Device storage is encrypted.' },
    ],
};

export const useSecureDroid = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [hardeningFindings, setHardeningFindings] = useState<any[]>([]);
    const isNative = Capacitor.isNativePlatform();

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        // ---- Web preview fallback ----
        if (!isNative) {
            setApps(MOCK_APPS);
            setRisks(MOCK_RISKS);
            setScore(MOCK_HARDENING.score);
            setHardeningFindings(MOCK_HARDENING.findings);
            setConnected(true);
            setLoading(false);
            return;
        }

        // ---- Native path ----
        try {
            // 1. Check connection with timeout
            let connResult;
            try {
                connResult = await Promise.race([
                    SecureDroidNative.checkConnection(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000)),
                ]);
            } catch (e: any) {
                setConnected(false);
                setError('Native bridge timeout: ' + e.message);
                setLoading(false);
                return;
            }

            if (!connResult.success || !connResult.data?.connected) {
                setConnected(false);
                setError(connResult.message || 'Native bridge unavailable.');
                setLoading(false);
                return;
            }
            setConnected(true);

            // 2. Get installed apps
            let appsResult;
            try {
                appsResult = await Promise.race([
                    SecureDroidNative.getInstalledApps(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Apps fetch timeout')), 8000)),
                ]);
            } catch (e: any) {
                setError('Failed to get apps: ' + e.message);
                setLoading(false);
                return;
            }
            if (!appsResult.success || !appsResult.data) {
                setError(appsResult.message || 'Failed to get installed apps.');
                setLoading(false);
                return;
            }
            const appList = appsResult.data;
            setApps(appList);

            // 3. Get risk reports
            let riskResult;
            try {
                riskResult = await Promise.race([
                    SecureDroidNative.getAppRiskReports(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Risk fetch timeout')), 8000)),
                ]);
            } catch (e: any) {
                // Non-fatal, continue with empty risks
                setRisks([]);
            }
            const allRiskDetails = riskResult?.success && riskResult.data
                ? riskResult.data.map((report: NativeAppRiskReport) => ({
                    appName: report.label,
                    packageName: report.packageName,
                    riskLevel: report.overallRisk,
                    findings: report.findings,
                    isSystemApp: false,
                }))
                : [];

            // Filter system apps
            const userAppPackageNames = new Set(
                appList.filter(app => !app.isSystemApp).map(app => app.packageName)
            );
            const userAppRisks = allRiskDetails.filter(risk =>
                userAppPackageNames.has(risk.packageName)
            );
            const meaningfulRisks = userAppRisks.filter(risk =>
                ['MEDIUM', 'HIGH', 'CRITICAL'].includes(risk.riskLevel.toUpperCase())
            );
            setRisks(meaningfulRisks);

            // 4. Get device hardening report
            let hardeningResult;
            try {
                hardeningResult = await Promise.race([
                    SecureDroidNative.getHardeningReport(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Hardening fetch timeout')), 5000)),
                ]);
            } catch (e: any) {
                // Non-fatal, set score 0
                setScore(0);
                setHardeningFindings([]);
                setLoading(false);
                return;
            }

            if (hardeningResult.success && hardeningResult.data) {
                setScore(hardeningResult.data.score || 0);
                setHardeningFindings(hardeningResult.data.findings || []);
            } else {
                setScore(0);
                setHardeningFindings([]);
            }

        } catch (err: unknown) {
            console.error('SecureDroid data load failed:', err);
            setApps([]);
            setRisks([]);
            setScore(0);
            setConnected(false);
            setError(err instanceof Error ? err.message : 'Failed to load security data.');
        } finally {
            setLoading(false);
        }
    }, [isNative]);

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
        hardeningFindings,
        reload: loadData,
    };
};
