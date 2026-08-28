import { Capacitor } from '@capacitor/core';

import {
    SecureDroidNativePlugin,
} from './SecureDroidPlugin';

import type {
    NativeResult,
    NativeConnectionStatus,
    NativeInstalledApp,
    NativeAppRiskReport,
    NativeHardeningReport,
    NativeSecurityEvent,
    NativeVpnStatus,
    NativeScanResult,
} from '../../types/native';

export type { SecureDroidPlugin } from './SecureDroidPlugin';

type UnknownRecord = Record<string, unknown>;

/**
 * SecureDroid native service.
 *
 * Responsibilities:
 * - Detect native platform.
 * - Call Capacitor plugin.
 * - Normalize native responses.
 * - Preserve native failures.
 * - Never fabricate security data.
 * - Never convert malformed native data into success.
 */
class SecureDroidNativeService {
    private readonly isNative = Capacitor.isNativePlatform();

    // ============================================================
    // INTERNAL HELPERS
    // ============================================================

    private unavailable<T>(message: string): NativeResult<T> {
        return {
            success: false,
            errorCode: 'SERVICE_UNAVAILABLE',
            message,
            recoverable: true,
            isSupported: false,
            runtimePlatform: this.isNative
                ? 'android_native'
                : 'web_preview',
        };
    }

    private nativeFailure<T>(
        message: string,
        errorCode: NonNullable<NativeResult<T> extends infer _T ? any : never> = 'UNKNOWN_ERROR',
    ): NativeResult<T> {
        return {
            success: false,
            errorCode,
            message,
            recoverable: true,
            runtimePlatform: 'android_native',
        };
    }

    private isRecord(value: unknown): value is UnknownRecord {
        return (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        );
    }

    private getArray<T>(
        record: UnknownRecord,
        ...keys: string[]
    ): T[] {
        for (const key of keys) {
            const value = record[key];

            if (Array.isArray(value)) {
                return value as T[];
            }
        }

        return [];
    }

    private getNumber(
        record: UnknownRecord,
        key: string,
        fallback = 0,
    ): number {
        const value = record[key];

        return typeof value === 'number' &&
            Number.isFinite(value)
            ? value
            : fallback;
    }

    private getString(
        record: UnknownRecord,
        key: string,
        fallback = '',
    ): string {
        const value = record[key];

        return typeof value === 'string'
            ? value
            : fallback;
    }

    private getBoolean(
        record: UnknownRecord,
        key: string,
        fallback = false,
    ): boolean {
        const value = record[key];

        return typeof value === 'boolean'
            ? value
            : fallback;
    }

    /**
     * Extract a native error without hiding malformed responses.
     */
    private parseNativeFailure<T>(
        raw: unknown,
        fallbackMessage: string,
    ): NativeResult<T> | null {
        if (!this.isRecord(raw)) {
            return this.nativeFailure<T>(
                'Native plugin returned an invalid response.'
            );
        }

        if (raw.success === false) {
            const errorCode =
                typeof raw.errorCode === 'string'
                    ? raw.errorCode
                    : 'UNKNOWN_ERROR';

            return {
                success: false,
                errorCode: errorCode as any,
                message:
                    typeof raw.message === 'string'
                        ? raw.message
                        : fallbackMessage,
                recoverable:
                    typeof raw.recoverable === 'boolean'
                        ? raw.recoverable
                        : true,
                isSupported:
                    typeof raw.isSupported === 'boolean'
                        ? raw.isSupported
                        : undefined,
                runtimePlatform: 'android_native',
            };
        }

        return null;
    }

    // ============================================================
    // CONNECTION
    // ============================================================

    async checkConnection(): Promise<
        NativeResult<NativeConnectionStatus>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'SecureDroid native services are unavailable in web preview.'
            );
        }

        try {
            const raw = await SecureDroidNativePlugin.checkConnection();

            const failure =
                this.parseNativeFailure<NativeConnectionStatus>(
                    raw,
                    'Native connection check failed.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Native connection response is invalid.'
                );
            }

            if (raw.connected !== true) {
                return {
                    success: false,
                    errorCode: 'SERVICE_UNAVAILABLE',
                    message:
                        this.getString(
                            raw,
                            'message',
                            'SecureDroid native service is not connected.'
                        ),
                    recoverable: true,
                    isSupported: true,
                    runtimePlatform: 'android_native',
                };
            }

            return {
                success: true,
                data: {
                    connected: true,
                    message:
                        typeof raw.message === 'string'
                            ? raw.message
                            : undefined,
                    pluginVersion:
                        typeof raw.pluginVersion === 'string'
                            ? raw.pluginVersion
                            : undefined,
                    androidApiLevel:
                        typeof raw.androidApiLevel === 'number'
                            ? raw.androidApiLevel
                            : undefined,
                    mode:
                        typeof raw.mode === 'string'
                            ? raw.mode
                            : undefined,
                    isReal: raw.isReal === true,
                },
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Native connection check failed.'
            );
        }
    }

    // ============================================================
    // INSTALLED APPS
    // ============================================================

    async getInstalledApps(): Promise<
        NativeResult<NativeInstalledApp[]>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'Installed application inventory requires Android.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.getInstalledApps();

            const failure =
                this.parseNativeFailure<NativeInstalledApp[]>(
                    raw,
                    'Failed to retrieve installed applications.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Installed application response is invalid.'
                );
            }

            const apps =
                this.getArray<NativeInstalledApp>(
                    raw,
                    'data',
                    'apps'
                );

            if (!Array.isArray(apps)) {
                return this.nativeFailure(
                    'Native application inventory is malformed.'
                );
            }

            return {
                success: true,
                data: apps,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve installed applications.'
            );
        }
    }

    // ============================================================
    // APP RISK REPORTS
    // ============================================================

    async getAppRiskReports(): Promise<
        NativeResult<NativeAppRiskReport[]>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'Application risk analysis requires Android native services.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.getAppRiskReports();

            const failure =
                this.parseNativeFailure<NativeAppRiskReport[]>(
                    raw,
                    'Failed to retrieve application risk reports.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Application risk response is invalid.'
                );
            }

            const reports =
                this.getArray<NativeAppRiskReport>(
                    raw,
                    'data',
                    'reports'
                );

            return {
                success: true,
                data: reports,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve application risk reports.'
            );
        }
    }

    // ============================================================
    // DEVICE HARDENING
    // ============================================================

    async getHardeningReport(): Promise<
        NativeResult<NativeHardeningReport>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'Device hardening assessment requires Android native services.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.getHardeningReport();

            const failure =
                this.parseNativeFailure<NativeHardeningReport>(
                    raw,
                    'Failed to retrieve device hardening report.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Device hardening response is invalid.'
                );
            }

            const source =
                this.isRecord(raw.data)
                    ? raw.data
                    : raw;

            const score = this.getNumber(
                source,
                'score',
                0
            );

            const findings =
                Array.isArray(source.findings)
                    ? source.findings
                    : [];

            return {
                success: true,
                data: {
                    score: Math.max(
                        0,
                        Math.min(100, score)
                    ),
                    findings:
                        findings as NativeHardeningReport['findings'],
                    timestamp:
                        typeof source.timestamp === 'number'
                            ? source.timestamp
                            : undefined,
                    isReal:
                        source.isReal === true,
                },
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve device hardening report.'
            );
        }
    }

    // ============================================================
    // VPN STATUS
    // ============================================================

    async getVpnStatus(): Promise<
        NativeResult<NativeVpnStatus>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'VPN status requires Android native services.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.getVpnStatus();

            const failure =
                this.parseNativeFailure<NativeVpnStatus>(
                    raw,
                    'Failed to retrieve VPN status.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'VPN status response is invalid.'
                );
            }

            const source =
                this.isRecord(raw.data)
                    ? raw.data
                    : raw;

            return {
                success: true,
                data: source as unknown as NativeVpnStatus,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve VPN status.'
            );
        }
    }

    // ============================================================
    // VPN PERMISSION
    // ============================================================

    async requestVpnPermission(): Promise<
        NativeResult<{
            granted: boolean;
            permissionRequested?: boolean;
            state: string;
        }>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'VPN permission requires Android.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.requestVpnPermission();

            const failure =
                this.parseNativeFailure<{
                    granted: boolean;
                    permissionRequested?: boolean;
                    state: string;
                }>(
                    raw,
                    'Failed to request VPN permission.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'VPN permission response is invalid.'
                );
            }

            return {
                success: true,
                data: {
                    granted:
                        this.getBoolean(raw, 'granted'),
                    permissionRequested:
                        typeof raw.permissionRequested === 'boolean'
                            ? raw.permissionRequested
                            : undefined,
                    state:
                        this.getString(
                            raw,
                            'state',
                            'UNKNOWN'
                        ),
                },
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to request VPN permission.'
            );
        }
    }

    // ============================================================
    // START VPN
    // ============================================================

    async startVpn(): Promise<
        NativeResult<{
            state: string;
            permissionRequired?: boolean;
        }>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'VPN service requires Android.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.startVpn();

            const failure =
                this.parseNativeFailure<{
                    state: string;
                    permissionRequired?: boolean;
                }>(
                    raw,
                    'Failed to start VPN.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'VPN start response is invalid.'
                );
            }

            if (raw.success !== true) {
                return {
                    success: false,
                    errorCode: 'SERVICE_UNAVAILABLE',
                    message:
                        this.getString(
                            raw,
                            'message',
                            'VPN failed to start.'
                        ),
                    recoverable: true,
                    runtimePlatform: 'android_native',
                };
            }

            return {
                success: true,
                data: {
                    state:
                        this.getString(
                            raw,
                            'state',
                            'UNKNOWN'
                        ),
                    permissionRequired:
                        typeof raw.permissionRequired === 'boolean'
                            ? raw.permissionRequired
                            : undefined,
                },
                message:
                    typeof raw.message === 'string'
                        ? raw.message
                        : undefined,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to start VPN.'
            );
        }
    }

    // ============================================================
    // STOP VPN
    // ============================================================

    async stopVpn(): Promise<
        NativeResult<{ state: string }>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'VPN service requires Android.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.stopVpn();

            const failure =
                this.parseNativeFailure<{
                    state: string;
                }>(
                    raw,
                    'Failed to stop VPN.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'VPN stop response is invalid.'
                );
            }

            if (raw.success !== true) {
                return {
                    success: false,
                    errorCode: 'SERVICE_UNAVAILABLE',
                    message:
                        this.getString(
                            raw,
                            'message',
                            'VPN failed to stop.'
                        ),
                    recoverable: true,
                    runtimePlatform: 'android_native',
                };
            }

            return {
                success: true,
                data: {
                    state:
                        this.getString(
                            raw,
                            'state',
                            'UNKNOWN'
                        ),
                },
                message:
                    typeof raw.message === 'string'
                        ? raw.message
                        : undefined,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to stop VPN.'
            );
        }
    }

    // ============================================================
    // SECURITY LOGS
    // ============================================================

    async getSecurityLogs(
        limit = 50
    ): Promise<NativeResult<NativeSecurityEvent[]>> {
        if (!this.isNative) {
            return this.unavailable(
                'Security audit logs require Android native services.'
            );
        }

        const safeLimit =
            Math.max(
                1,
                Math.min(
                    500,
                    Math.floor(limit)
                )
            );

        try {
            const raw =
                await SecureDroidNativePlugin.getSecurityLogs({
                    limit: safeLimit,
                });

            const failure =
                this.parseNativeFailure<NativeSecurityEvent[]>(
                    raw,
                    'Failed to retrieve security logs.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Security log response is invalid.'
                );
            }

            const events =
                this.getArray<NativeSecurityEvent>(
                    raw,
                    'data',
                    'value'
                );

            return {
                success: true,
                data: events,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to retrieve security logs.'
            );
        }
    }

    // ============================================================
    // WRITE SECURITY EVENT
    // ============================================================

    async logSecurityEvent(
        event: NativeSecurityEvent
    ): Promise<NativeResult<NativeSecurityEvent>> {
        if (!this.isNative) {
            return this.unavailable(
                'Security event logging requires Android native services.'
            );
        }

        if (!event || typeof event !== 'object') {
            return {
                success: false,
                errorCode: 'INVALID_ARGUMENT',
                message: 'A valid security event is required.',
                recoverable: false,
                runtimePlatform: 'android_native',
            };
        }

        try {
            const raw =
                await SecureDroidNativePlugin.logSecurityEvent({
                    event,
                });

            const failure =
                this.parseNativeFailure<NativeSecurityEvent>(
                    raw,
                    'Failed to log security event.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Security event response is invalid.'
                );
            }

            const data =
                this.isRecord(raw.data)
                    ? raw.data
                    : null;

            return {
                success: true,
                data:
                    (data as unknown as NativeSecurityEvent) ||
                    event,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Failed to log security event.'
            );
        }
    }

    // ============================================================
    // FULL RISK SCAN
    // ============================================================

    async scanForRisks(): Promise<
        NativeResult<NativeScanResult>
    > {
        if (!this.isNative) {
            return this.unavailable(
                'Risk scanning requires Android native services.'
            );
        }

        try {
            const raw =
                await SecureDroidNativePlugin.scanForRisks();

            const failure =
                this.parseNativeFailure<NativeScanResult>(
                    raw,
                    'Risk scan failed.'
                );

            if (failure) {
                return failure;
            }

            if (!this.isRecord(raw)) {
                return this.nativeFailure(
                    'Risk scan response is invalid.'
                );
            }

            const data =
                this.isRecord(raw.data)
                    ? raw.data
                    : raw;

            if (
                typeof data.scanId !== 'string' ||
                typeof data.timestamp !== 'number'
            ) {
                return this.nativeFailure(
                    'Risk scan returned incomplete data.'
                );
            }

            return {
                success: true,
                data:
                    data as unknown as NativeScanResult,
                isSupported: true,
                runtimePlatform: 'android_native',
            };

        } catch (error: unknown) {
            return this.nativeFailure(
                error instanceof Error
                    ? error.message
                    : 'Risk scan failed.'
            );
        }
    }
}

export const SecureDroidNative =
    new SecureDroidNativeService();
