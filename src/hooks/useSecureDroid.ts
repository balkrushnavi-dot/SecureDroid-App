import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

import type {
    NativeInstalledApp,
    NativeAppRiskReport,
    NativeHardeningReport,
    NativeSecurityEvent,
    NativeVpnStatus,
    SecureDroidMode,
} from '../types/native';

export type AppInfo = NativeInstalledApp;

export interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    securityScore?: number;
    findingCount?: number;
    findings?: Array<{
        id?: string;
        code?: string;
        title?: string;
        description?: string;
        severity?: string;
        level?: string;
        summary?: string;
        points?: number;
    }>;
    reason?: string;
    installSource?: string;
    isSystemApp?: boolean;
    isReal: boolean;
}

export interface HardeningInfo {
    score: number;
    findings: NativeHardeningReport['findings'];
    timestamp?: number;
    isReal: boolean;
}

export interface SecureDroidHookState {
    apps: AppInfo[];
    risks: RiskInfo[];

    loading: boolean;
    connected: boolean;

    error: string | null;

    score: number;
    hardeningFindings: NativeHardeningReport['findings'];

    usingMock: boolean;

    mode: SecureDroidMode;

    vpnStatus: NativeVpnStatus | null;

    securityLogs: NativeSecurityEvent[];

    dataVerified: boolean;

    reload: () => Promise<void>;
}

/**
 * SecureDroid application data hook.
 *
 * SECURITY RULE:
 * This hook NEVER substitutes fabricated security data for native data.
 *
 * Web preview:
 *   - No security claims
 *   - Empty datasets
 *   - usingMock = false
 *   - dataVerified = false
 *
 * Native Android:
 *   - Native bridge is queried
 *   - Failed calls remain failed
 *   - Unknown/unavailable capabilities are represented explicitly
 *   - No fake apps, risks, scores, or hardening findings are injected
 */
export const useSecureDroid = (): SecureDroidHookState => {
    const isNative = Capacitor.isNativePlatform();

    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);

    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [score, setScore] = useState(0);
    const [hardeningFindings, setHardeningFindings] =
        useState<NativeHardeningReport['findings']>([]);

    const [mode, setMode] = useState<SecureDroidMode>('UNKNOWN');

    const [vpnStatus, setVpnStatus] =
        useState<NativeVpnStatus | null>(null);

    const [securityLogs, setSecurityLogs] =
        useState<NativeSecurityEvent[]>([]);

    const [dataVerified, setDataVerified] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDataVerified(false);

        /*
         * WEB PREVIEW
         *
         * Do not inject fake Android data.
         */
        if (!isNative) {
            setApps([]);
            setRisks([]);
            setScore(0);
            setHardeningFindings([]);
            setSecurityLogs([]);
            setVpnStatus(null);
            setConnected(false);
            setMode('UNKNOWN');
            setLoading(false);

            setError(
                'Android native security services are unavailable in web preview.'
            );

            return;
        }

        /*
         * Clear previous state before a fresh native scan.
         *
         * This prevents stale data from being presented as current.
         */
        setApps([]);
        setRisks([]);
        setScore(0);
        setHardeningFindings([]);
        setSecurityLogs([]);
        setVpnStatus(null);
        setConnected(false);
        setMode('UNKNOWN');

        try {
            // ====================================================
            // 1. NATIVE CONNECTION
            // ====================================================

            const connectionResult =
                await SecureDroidNative.checkConnection();

            if (!connectionResult.success) {
                setError(
                    connectionResult.message ||
                    'SecureDroid native security service is unavailable.'
                );

                return;
            }

            if (!connectionResult.data.connected) {
                setError(
                    connectionResult.data.message ||
                    'SecureDroid native bridge is not connected.'
                );

                return;
            }

            setConnected(true);

            if (connectionResult.data.mode) {
                setMode(connectionResult.data.mode);
            }


            // ====================================================
            // 2. INSTALLED APPLICATIONS
            // ====================================================

            const appsResult =
                await SecureDroidNative.getInstalledApps();

            if (!appsResult.success) {
                setError(
                    appsResult.message ||
                    'Unable to retrieve installed applications.'
                );

                return;
            }

            const nativeApps = appsResult.data || [];

            setApps(nativeApps);


            // ====================================================
            // 3. APPLICATION RISK ANALYSIS
            // ====================================================

            const riskResult =
                await SecureDroidNative.getAppRiskReports();

            if (!riskResult.success) {
                setError(
                    riskResult.message ||
                    'Application risk analysis is unavailable.'
                );

                /*
                 * App inventory is still valid, so do not discard it.
                 */
            } else {
                const userAppPackageNames = new Set(
                    nativeApps
                        .filter(app => !app.isSystemApp)
                        .map(app => app.packageName)
                );

                const realRiskReports: RiskInfo[] =
                    (riskResult.data || [])
                        .filter(report => {
                            /*
                             * Keep the report associated with an installed
                             * application actually observed by Android.
                             */
                            return userAppPackageNames.has(
                                report.packageName
                            );
                        })
                        .map((report: NativeAppRiskReport) => ({
                            appName: report.label,
                            packageName: report.packageName,
                            riskLevel: report.overallRisk,
                            securityScore: report.securityScore,
                            findingCount:
                                report.findingCount ??
                                report.findings.length,
                            findings: report.findings,
                            reason: report.reason,
                            installSource: report.installSource,
                            isSystemApp: report.isSystemApp ?? false,
                            isReal: report.isReal === true,
                        }))
                        .filter(report => report.isReal);

                setRisks(realRiskReports);
            }


            // ====================================================
            // 4. DEVICE HARDENING
            // ====================================================

            const hardeningResult =
                await SecureDroidNative.getHardeningReport();

            if (!hardeningResult.success) {
                setError(prev =>
                    prev ||
                    hardeningResult.message ||
                    'Device hardening assessment is unavailable.'
                );
            } else if (hardeningResult.data?.isReal === true) {
                const report = hardeningResult.data;

                setScore(
                    Number.isFinite(report.score)
                        ? Math.max(0, Math.min(100, report.score))
                        : 0
                );

                setHardeningFindings(
                    (report.findings || []).filter(
                        finding => finding.isReal === true
                    )
                );
            }


            // ====================================================
            // 5. VPN STATUS
            // ====================================================

            const vpnResult =
                await SecureDroidNative.getVpnStatus();

            if (vpnResult.success) {
                setVpnStatus(vpnResult.data);
            }


            // ====================================================
            // 6. SECURITY AUDIT LOG
            // ====================================================

            const logsResult =
                await SecureDroidNative.getSecurityLogs(50);

            if (logsResult.success) {
                setSecurityLogs(logsResult.data || []);
            }


            // ====================================================
            // 7. VERIFIED DATA STATE
            // ====================================================

            /*
             * The connection itself must be real before the hook
             * can claim that native data was successfully collected.
             */
            setDataVerified(true);

        } catch (nativeError: unknown) {
            const message =
                nativeError instanceof Error
                    ? nativeError.message
                    : 'Unexpected native security service failure.';

            setConnected(false);
            setDataVerified(false);

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [isNative]);


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        void loadData();
    }, [loadData]);


    // ============================================================
    // PUBLIC API
    // ============================================================

    return {
        apps,
        risks,

        loading,
        connected,

        error,

        score,
        hardeningFindings,

        /*
         * Kept for compatibility with existing screens.
         *
         * IMPORTANT:
         * This is NEVER true because of mock fallback.
         */
        usingMock: false,

        mode,

        vpnStatus,

        securityLogs,

        dataVerified,

        reload: loadData,
    };
};
