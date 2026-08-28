import { registerPlugin } from '@capacitor/core';

import type {
  NativeAppRiskReport,
  NativeInstalledApp,
  NativeSecurityEvent,
  NativeVpnStatus,
} from '../../types/native';

export interface SecureDroidPlugin {
  checkConnection(): Promise<{
    connected: boolean;
    plugin?: string;
    platform?: string;
    message?: string;
    timestamp?: number;
  }>;

  getInstalledApps(): Promise<{
    success: boolean;
    data?: NativeInstalledApp[];
    apps?: any[];
    count?: number;
    isSupported?: boolean;
    runtimePlatform?: string;
    message?: string;
    errorCode?: string;
  }>;

  scanForRisks(): Promise<{
    success: boolean;
    data?: NativeAppRiskReport[];
    riskDetails?: any[];
    totalRiskyApps?: number;
    totalApps?: number;
    isSupported?: boolean;
    runtimePlatform?: string;
    message?: string;
    errorCode?: string;
  }>;

  getAppRiskReports(): Promise<{
    success: boolean;
    data?: NativeAppRiskReport[];
    reports?: any[];
    totalRiskyApps?: number;
    isSupported?: boolean;
    runtimePlatform?: string;
    message?: string;
    errorCode?: string;
  }>;

  getHardeningReport(): Promise<{
    success: boolean;
    data?: any;
    score?: number;
    findings?: any[];
    vpnStatus?: boolean;
    vpnState?: string;
    screenLock?: boolean;
    screenLockStatus?: string;
    usbDebugging?: boolean;
    usbDebuggingStatus?: string;
    developerOptions?: boolean;
    developerOptionsStatus?: string;
    securityPatchStatus?: string;
    unknownSources?: boolean;
    unknownSourcesStatus?: string;
    isSupported?: boolean;
    runtimePlatform?: string;
    message?: string;
    errorCode?: string;
  }>;

  getDeviceHardening(): Promise<{
    success: boolean;
    data?: any;
    score?: number;
    findings?: any[];
    vpnStatus?: boolean;
    vpnState?: string;
    screenLock?: boolean;
    screenLockStatus?: string;
    usbDebugging?: boolean;
    usbDebuggingStatus?: string;
    developerOptions?: boolean;
    developerOptionsStatus?: string;
    securityPatchStatus?: string;
    unknownSources?: boolean;
    unknownSourcesStatus?: string;
    isSupported?: boolean;
    runtimePlatform?: string;
    message?: string;
    errorCode?: string;
  }>;

  requestVpnPermission(): Promise<{
    success: boolean;
    granted?: boolean;
    permissionRequested?: boolean;
    state?: string;
    message?: string;
    errorCode?: string;
  }>;

  getVpnStatus(): Promise<{
    success: boolean;
    data?: NativeVpnStatus;
    state?: string;
    isConnected?: boolean;
    isActive?: boolean;
    message?: string;
    isSupported?: boolean;
    runtimePlatform?: string;
    errorCode?: string;
  }>;

  startVpn(): Promise<{
    success: boolean;
    permissionRequired?: boolean;
    state?: string;
    message?: string;
    isSupported?: boolean;
    runtimePlatform?: string;
    errorCode?: string;
  }>;

  stopVpn(): Promise<{
    success: boolean;
    state?: string;
    message?: string;
    isSupported?: boolean;
    runtimePlatform?: string;
    errorCode?: string;
  }>;

  getSecurityLogs(options?: {
    limit?: number;
    category?: string;
  }): Promise<{
    success: boolean;
    data?: NativeSecurityEvent[];
    value?: any[];
    isSupported?: boolean;
    runtimePlatform?: string;
    message?: string;
    errorCode?: string;
  }>;

  logSecurityEvent(options: {
    event: Omit<NativeSecurityEvent, 'id' | 'timestamp'>;
  }): Promise<{
    success: boolean;
    data?: NativeSecurityEvent;
    value?: NativeSecurityEvent;
    id?: string;
    timestamp?: number;
    category?: string;
    severity?: string;
    description?: string;
    source?: string;
    message?: string;
    errorCode?: string;
    isSupported?: boolean;
    runtimePlatform?: string;
  }>;
}

/**
 * Single Capacitor bridge registration for the SecureDroid
 * Android native plugin.
 *
 * IMPORTANT:
 * The name MUST exactly match:
 *
 * @CapacitorPlugin(name = "SecureDroid")
 *
 * in SecureDroidCapacitorPlugin.kt.
 */
export const SecureDroidNativePlugin =
  registerPlugin<SecureDroidPlugin>('SecureDroid');
