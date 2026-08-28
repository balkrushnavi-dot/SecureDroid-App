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

// ----- MOCK DATA (used when native bridge fails) -----
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
    score: 60,
    findings: [
        { id: 'SCREEN_LOCK_ENABLED', level: 'GOOD', summary: 'Screen lock is configured.' },
        { id: 'DEVICE_NOT_ENCRYPTED', level: 'WARNING', summary: 'Device storage is not encrypted.' },
    ],
};

export const useSecureDroid = () => {
    const [apps, setApps] = useState<AppInfo[]>(MOCK_APPS);
    const [risks, setRisks] = useState<RiskInfo[]>(MOCK_RISKS);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(MOCK_HARDENING.score);
    const [hardeningFindings, setHardeningFindings] = useState(MOCK_HARDENING.findings);
    const [usingMock, setUsingMock] = useState(true);
    const isNative = Capacitor.isNativePlatform();

    const loadData = useCallback(async () => {
        // If not native, use mock data (already set)
        if (!isNative) {
            setConnected(true);
            setUsingMock(true);
            setLoading(false);
            return;
        }

        // Native path — try to fetch real data
        setLoading(true);
        setError(null);

        try {
            // 1. Connection
            let connResult;
            try {
                connResult = await SecureDroidNative.checkConnection();
            } catch (e: any) {
                // Fallback to mock
                setUsingMock(true);
                setError('Native bridge unavailable — using mock data.');
                setLoading(false);
                return;
            }

            if (!connResult.success || !connResult.data?.connected) {
                setUsingMock(true);
                setError('Native bridge unavailable — using mock data.');
                setLoading(false);
                return;
            }
            setConnected(true);
            setUsingMock(false);

            // 2. Apps
            let appsResult;
            try {
                appsResult = await SecureDroidNative.getInstalledApps();
            } catch (e: any) {
                // Keep mock apps
                setUsingMock(true);
                setLoading(false);
                return;
            }

            if (appsResult.success && appsResult.data) {
                setApps(appsResult.data);
            }

            // 3. Risks
            let riskResult;
            try {
                riskResult = await SecureDroidNative.getAppRiskReports();
            } catch (e: any) {
                // Keep mock risks
                setUsingMock(true);
                setLoading(false);
                return;
            }

            if (riskResult.success && riskResult.data) {
                const appList = appsResult?.success && appsResult.data ? appsResult.data : MOCK_APPS;
                const userAppPackageNames = new Set(
                    appList.filter(app => !app.isSystemApp).map(app => app.packageName)
                );
                const allRiskDetails = riskResult.data.map((report: NativeAppRiskReport) => ({
                    appName: report.label,
                    packageName: report.packageName,
                    riskLevel: report.overallRisk,
                    findings: report.findings,
                    isSystemApp: false,
                }));
                const userAppRisks = allRiskDetails.filter(risk =>
                    userAppPackageNames.has(risk.packageName)
                );
                const meaningfulRisks = userAppRisks.filter(risk =>
                    ['MEDIUM', 'HIGH', 'CRITICAL'].includes(risk.riskLevel.toUpperCase())
                );
                if (meaningfulRisks.length > 0) {
                    setRisks(meaningfulRisks);
                }
            }

            // 4. Hardening
            let hardeningResult;
            try {
                hardeningResult = await SecureDroidNative.getHardeningReport();
            } catch (e: any) {
                // Keep mock hardening
                setUsingMock(true);
                setLoading(false);
                return;
            }

            if (hardeningResult.success && hardeningResult.data) {
                setScore(hardeningResult.data.score || 0);
                setHardeningFindings(hardeningResult.data.findings || []);
            }

        } catch (err: unknown) {
            console.error('SecureDroid data load failed:', err);
            setUsingMock(true);
            setError('Failed to load real data — using mock data.');
        } finally {
            setLoading(false);
        }
    }, [isNative]);

    // Load once on mount
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
        usingMock,
        reload: loadData,
    };
};
