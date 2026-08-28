import { registerPlugin } from '@capacitor/core';

import type {
    NativeResult,
    NativeInstalledApp,
    NativeAppRiskReport,
    NativeHardeningReport,
    NativeSecurityEvent,
    NativeVpnStatus,
    NativeDeviceInfo,
    NativeBatteryStatus,
    NativeNetworkState,
    NativeStorageInfo,
    NativeBiometricStatus,
    BiometricAuthResult,
    PermissionStatusMap,
    CapabilityReport,
    DeviceManagementStatus,
    SystemSecurityAssessment,
    ThreatAssessmentReport,
    VmHardwareCapability,
    NativeServiceHealth,
    SecurityEngineStatus,
    SecureStorageItem,
} from '../../types/native';

/**
 * SecureDroid Capacitor Plugin Contract
 *
 * This interface defines the boundary between:
 *
 * React/TypeScript
 *        ↓
 * Capacitor
 *        ↓
 * SecureDroidCapacitorPlugin.kt
 *        ↓
 * Android security services
 *
 * SECURITY RULE:
 * The TypeScript layer must never assume that a method's existence
 * means the capability is available on the current device.
 *
 * Native code must return explicit capability/error information.
 */

export interface SecureDroidPlugin {

    // ========================================================
    // 1. BRIDGE / SERVICE HEALTH
    // ========================================================

    checkConnection(): Promise<{
        connected: boolean;
        message?: string;
        runtimePlatform?: 'android_native' | 'web_preview' | 'unknown';
    }>;

    getServiceHealth(): Promise<
        NativeResult<NativeServiceHealth>
    >;

    // ========================================================
    // 2. CAPABILITY ENGINE
    // ========================================================

    getCapabilities(): Promise<
        NativeResult<CapabilityReport>
    >;

    getDeviceManagementStatus(): Promise<
        NativeResult<DeviceManagementStatus>
    >;

    // ========================================================
    // 3. DEVICE INFORMATION
    // ========================================================

    getDeviceInfo(): Promise<
        NativeResult<NativeDeviceInfo>
    >;

    getBatteryStatus(): Promise<
        NativeResult<NativeBatteryStatus>
    >;

    getNetworkState(): Promise<
        NativeResult<NativeNetworkState>
    >;

    getStorageInfo(): Promise<
        NativeResult<NativeStorageInfo>
    >;

    // ========================================================
    // 4. BIOMETRICS
    // ========================================================

    getBiometricStatus(): Promise<
        NativeResult<NativeBiometricStatus>
    >;

    authenticateBiometric(options?: {
        reason?: string;
        allowDeviceCredential?: boolean;
    }): Promise<
        NativeResult<BiometricAuthResult>
    >;

    // ========================================================
    // 5. PERMISSIONS
    // ========================================================

    checkPermissions(options: {
        permissions: string[];
    }): Promise<
        NativeResult<PermissionStatusMap>
    >;

    requestPermissions(options: {
        permissions: string[];
    }): Promise<
        NativeResult<PermissionStatusMap>
    >;

    // ========================================================
    // 6. INSTALLED APPLICATIONS
    // ========================================================

    getInstalledApps(): Promise<
        NativeResult<NativeInstalledApp[]>
    >;

    getAppRiskReports(): Promise<
        NativeResult<NativeAppRiskReport[]>
    >;

    scanForRisks(): Promise<
        NativeResult<ThreatAssessmentReport>
    >;

    // ========================================================
    // 7. SECURITY ASSESSMENT
    // ========================================================

    getSecurityAssessment(): Promise<
        NativeResult<SystemSecurityAssessment>
    >;

    getHardeningReport(): Promise<
        NativeResult<NativeHardeningReport>
    >;

    getSecurityEngineStatus(): Promise<
        NativeResult<SecurityEngineStatus>
    >;

    // ========================================================
    // 8. VPN / NETWORK PROTECTION
    // ========================================================

    getVpnStatus(): Promise<
        NativeResult<NativeVpnStatus>
    >;

    requestVpnPermission(): Promise<
        NativeResult<{
            granted: boolean;
            permissionRequested: boolean;
            state: string;
        }>
    >;

    startVpn(): Promise<
        NativeResult<{
            state: string;
            permissionRequired?: boolean;
        }>
    >;

    stopVpn(): Promise<
        NativeResult<{
            state: string;
        }>
    >;

    // ========================================================
    // 9. SECURITY AUDIT LOG
    // ========================================================

    getSecurityLogs(options: {
        limit?: number;
        category?: string;
        severity?: string;
        since?: number;
    }): Promise<
        NativeResult<NativeSecurityEvent[]>
    >;

    logSecurityEvent(options: {
        event: NativeSecurityEvent;
    }): Promise<
        NativeResult<NativeSecurityEvent>
    >;

    // ========================================================
    // 10. SECURE STORAGE
    // ========================================================

    secureStorageSet(options: {
        key: string;
        value: string;
        requiresBiometric?: boolean;
    }): Promise<
        NativeResult<{ stored: boolean }>
    >;

    secureStorageGet(options: {
        key: string;
        authenticate?: boolean;
    }): Promise<
        NativeResult<SecureStorageItem | null>
    >;

    secureStorageDelete(options: {
        key: string;
    }): Promise<
        NativeResult<{ deleted: boolean }>
    >;

    secureStorageClear(): Promise<
        NativeResult<{ cleared: boolean }>
    >;

    // ========================================================
    // 11. VIRTUALIZATION / HARDWARE CAPABILITY
    // ========================================================

    getVmHardwareCapability(): Promise<
        NativeResult<VmHardwareCapability>
    >;
}

/**
 * Registered Capacitor plugin.
 *
 * IMPORTANT:
 * The native Android class must register itself using the
 * exact same plugin name:
 *
 *     @CapacitorPlugin(name = "SecureDroid")
 *
 * No security feature should silently fall back to simulated
 * native behavior in production.
 */
export const SecureDroidNativePlugin =
    registerPlugin<SecureDroidPlugin>('SecureDroid');

export type {
    SecureDroidPlugin,
};
