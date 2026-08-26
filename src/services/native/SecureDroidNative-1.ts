import { registerPlugin, Capacitor } from '@capacitor/core';
import type {
  NativeResult,
  NativeDeviceInfo,
  NativeBatteryStatus,
  NativeNetworkState,
  NativeStorageInfo,
  NativeSensorInfo,
  NativeCameraCapability,
  CapturePhotoResult,
  NativeBiometricStatus,
  BiometricAuthResult,
  RuntimePermissionName,
  PermissionStatusMap,
  NativeInstalledApp,
  NativeCalendarEvent,
  NativeContact,
  NativeFileInfo,
  NativeCapturedNotification,
  SystemSecurityAssessment,
  NativeSecurityEvent,
  NativeVpnStatus,
  VmHardwareCapability,
  NativeAppRiskReport,
  NativeHardeningReport,
} from '../../types/native';

export interface SecureDroidPlugin {
  getDeviceInfo(): Promise<NativeResult<NativeDeviceInfo>>;
  getBatteryStatus(): Promise<NativeResult<NativeBatteryStatus>>;
  getNetworkState(): Promise<NativeResult<NativeNetworkState>>;
  getStorageInfo(): Promise<NativeResult<NativeStorageInfo>>;
  getAvailableSensors(): Promise<NativeResult<NativeSensorInfo[]>>;
  startSensorListener(options: { sensorType: string }): Promise<NativeResult<boolean>>;
  stopSensorListener(options: { sensorType: string }): Promise<NativeResult<boolean>>;
  getCameraCapability(): Promise<NativeResult<NativeCameraCapability>>;
  capturePhoto(options: { facing: 'front' | 'back'; flash: boolean }): Promise<NativeResult<CapturePhotoResult>>;
  isBiometricAvailable(): Promise<NativeResult<NativeBiometricStatus>>;
  authenticateBiometric(options: { title: string; subtitle?: string; description?: string }): Promise<NativeResult<BiometricAuthResult>>;
  checkPermissions(options: { permissions: RuntimePermissionName[] }): Promise<NativeResult<PermissionStatusMap>>;
  requestPermissions(options: { permissions: RuntimePermissionName[] }): Promise<NativeResult<PermissionStatusMap>>;
  openAppSettings(): Promise<NativeResult<boolean>>;
  getInstalledApps(): Promise<NativeResult<NativeInstalledApp[]>>;
  launchApp(options: { packageName: string }): Promise<NativeResult<boolean>>;
  openAppDetails(options: { packageName: string }): Promise<NativeResult<boolean>>;
  uninstallAppRequest(options: { packageName: string }): Promise<NativeResult<boolean>>;
  getCalendarEvents(): Promise<NativeResult<NativeCalendarEvent[]>>;
  getContacts(): Promise<NativeResult<NativeContact[]>>;
  listFiles(options: { directoryPath?: string }): Promise<NativeResult<NativeFileInfo[]>>;
  getNotifications(): Promise<NativeResult<NativeCapturedNotification[]>>;
  startVpn(options: { blocklist: string[]; dnsServer?: string }): Promise<NativeResult<NativeVpnStatus>>;
  stopVpn(): Promise<NativeResult<NativeVpnStatus>>;
  getVpnStatus(): Promise<NativeResult<NativeVpnStatus>>;
  secureStorageSet(options: { key: string; value: string; requiresBiometric?: boolean }): Promise<NativeResult<boolean>>;
  secureStorageGet(options: { key: string; promptBiometric?: boolean }): Promise<NativeResult<string | null>>;
  secureStorageRemove(options: { key: string }): Promise<NativeResult<boolean>>;
  logSecurityEvent(options: { event: Omit<NativeSecurityEvent, 'id' | 'timestamp'> }): Promise<NativeResult<NativeSecurityEvent>>;
  getSecurityLogs(options?: { limit?: number; category?: string }): Promise<NativeResult<NativeSecurityEvent[]>>;
  getVmHardwareCapability(): Promise<NativeResult<VmHardwareCapability>>;
  getAppRiskReports(): Promise<NativeResult<NativeAppRiskReport[]>>;
  getHardeningReport(): Promise<NativeResult<NativeHardeningReport>>;
  scanInstalledApps(): Promise<{ apps: NativeInstalledApp[] }>;
  analyzeInstalledApp(options: { packageName: string }): Promise<{ report: NativeAppRiskReport | null }>;
  analyzeAllInstalledApps(): Promise<{ reports: NativeAppRiskReport[] }>;
  isDeviceAdminEnabled(): Promise<{ enabled: boolean }>;
  getVpnState(): Promise<{ state: string }>;
}

const NativePlugin = registerPlugin<SecureDroidPlugin>('SecureDroid');

/**
 * High-Level Native Bridge Service with Capability Detection & Transparent Web Fallback
 */
class SecureDroidNativeService {
  private isNative = Capacitor.isNativePlatform();

  // 1. Device Info
  async getDeviceInfo(): Promise<NativeResult<NativeDeviceInfo>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getDeviceInfo();
      } catch (err: any) {
        console.warn('Native getDeviceInfo error, falling back to Web API:', err);
      }
    }

    const nav = typeof navigator !== 'undefined' ? navigator : ({} as any);
    const screenObj = typeof window !== 'undefined' && window.screen ? window.screen : { width: 1080, height: 2400 };

    let ramEstimate = 8192;
    if ('deviceMemory' in nav && typeof nav.deviceMemory === 'number') {
      ramEstimate = nav.deviceMemory * 1024;
    }

    const info: NativeDeviceInfo = {
      manufacturer: 'Google / Web Container',
      brand: 'Browser Client',
      model: nav.userAgentData?.platform || 'Web Environment',
      device: 'sandboxed-client',
      product: 'SecureDroid Web Host',
      androidVersion: '15 (Simulated Engine)',
      sdkVersion: 35,
      securityPatch: '2026-08-01',
      kernelVersion: 'Linux 6.6.x (Isolated Container)',
      cpuArchitecture: nav.userAgent.includes('x86_64') ? 'x86_64' : 'arm64-v8a',
      supportedAbis: ['arm64-v8a', 'armeabi-v7a'],
      totalRamMb: ramEstimate,
      availableRamMb: Math.round(ramEstimate * 0.58),
      totalStorageBytes: 128 * 1024 * 1024 * 1024,
      availableStorageBytes: 54 * 1024 * 1024 * 1024,
      screenWidth: screenObj.width,
      screenHeight: screenObj.height,
      screenDensity: typeof window !== 'undefined' ? window.devicePixelRatio : 2.5,
      locale: nav.language || 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      uptimeSeconds: typeof performance !== 'undefined' ? Math.round(performance.now() / 1000) : 3600,
      isCharging: false,
      isEmulator: true,
      buildFingerprint: 'securedroid/hardened/aosp:15/AP4A.260805.004/rel:user',
      bootloaderLocked: true,
      kvmVirtualizationSupported: false,
    };

    return {
      success: true,
      data: info,
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 2. Battery Status
  async getBatteryStatus(): Promise<NativeResult<NativeBatteryStatus>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getBatteryStatus();
      } catch (err: any) {
        console.warn('Native getBatteryStatus error:', err);
      }
    }

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        return {
          success: true,
          data: {
            percentage: Math.round(battery.level * 100),
            isCharging: battery.charging,
            chargingSource: battery.charging ? 'AC' : 'NONE',
            health: 'GOOD',
            temperatureCelsius: 28.5,
            voltageMillivolts: 4120,
            currentNowMicroamperes: battery.charging ? 1200000 : -350000,
            capacityMicroampereHours: 5000000,
            estimatedRemainingMinutes: battery.dischargingTime && Number.isFinite(battery.dischargingTime)
              ? Math.round(battery.dischargingTime / 60)
              : null,
          },
          isSupported: true,
          runtimePlatform: 'web_preview',
        };
      } catch {
        // Fall through
      }
    }

    return {
      success: true,
      data: {
        percentage: 86,
        isCharging: true,
        chargingSource: 'AC',
        health: 'GOOD',
        temperatureCelsius: 29.2,
        voltageMillivolts: 4180,
        currentNowMicroamperes: 850000,
        capacityMicroampereHours: 4920000,
        estimatedRemainingMinutes: 75,
      },
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 3. Network State
  async getNetworkState(): Promise<NativeResult<NativeNetworkState>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getNetworkState();
      } catch (err: any) {
        console.warn('Native getNetworkState error:', err);
      }
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const connection = typeof navigator !== 'undefined' ? (navigator as any).connection : null;

    let connType: NativeNetworkState['connectionType'] = 'WIFI';
    if (connection?.type === 'cellular') connType = 'CELLULAR';
    if (connection?.type === 'ethernet') connType = 'ETHERNET';

    return {
      success: true,
      data: {
        isConnected: isOnline,
        connectionType: isOnline ? connType : 'NONE',
        isValidated: isOnline,
        isMetered: connection?.saveData || false,
        isVpnActive: false,
        ipAddress: '192.168.1.144',
        dnsServers: ['1.1.1.1', '9.9.9.9'],
        linkSpeedMbps: connection?.downlink ? Math.round(connection.downlink) : 150,
        rxBytes: 41829012,
        txBytes: 12948201,
        downlinkSpeedKbps: 45000,
        uplinkSpeedKbps: 18000,
        captivePortalDetected: false,
      },
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 4. Storage Info
  async getStorageInfo(): Promise<NativeResult<NativeStorageInfo>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getStorageInfo();
      } catch (err: any) {
        console.warn('Native getStorageInfo error:', err);
      }
    }

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const total = estimate.quota || 128 * 1024 * 1024 * 1024;
        const used = estimate.usage || 45 * 1024 * 1024 * 1024;
        const available = total - used;
        return {
          success: true,
          data: {
            internalTotalBytes: total,
            internalAvailableBytes: available,
            internalUsedBytes: used,
            internalUsagePercent: Math.round((used / total) * 100),
            externalStorageAvailable: false,
          },
          isSupported: true,
          runtimePlatform: 'web_preview',
        };
      } catch {
        // Fallback
      }
    }

    const total = 128 * 1024 * 1024 * 1024;
    const available = 74 * 1024 * 1024 * 1024;
    const used = total - available;

    return {
      success: true,
      data: {
        internalTotalBytes: total,
        internalAvailableBytes: available,
        internalUsedBytes: used,
        internalUsagePercent: Math.round((used / total) * 100),
        externalStorageAvailable: true,
        externalTotalBytes: 64 * 1024 * 1024 * 1024,
        externalAvailableBytes: 58 * 1024 * 1024 * 1024,
        externalUsedBytes: 6 * 1024 * 1024 * 1024,
      },
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 5. Sensors
  async getAvailableSensors(): Promise<NativeResult<NativeSensorInfo[]>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getAvailableSensors();
      } catch (err: any) {
        console.warn('Native getAvailableSensors error:', err);
      }
    }

    const sensors: NativeSensorInfo[] = [
      {
        id: 'sensor_accel',
        name: 'STMicroelectronics LSM6DSO Accelerometer',
        vendor: 'STMicroelectronics',
        type: 1,
        typeName: 'ACCELEROMETER',
        powerMa: 0.18,
        resolution: 0.000598,
        maxRange: 78.45,
        isAvailable: typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
      },
      {
        id: 'sensor_gyro',
        name: 'STMicroelectronics LSM6DSO Gyroscope',
        vendor: 'STMicroelectronics',
        type: 4,
        typeName: 'GYROSCOPE',
        powerMa: 0.55,
        resolution: 0.001065,
        maxRange: 34.9,
        isAvailable: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
      },
      {
        id: 'sensor_mag',
        name: 'Asahi Kasei Microdevices AK09918 Magnetometer',
        vendor: 'AKM',
        type: 2,
        typeName: 'MAGNETOMETER',
        powerMa: 0.45,
        resolution: 0.15,
        maxRange: 4912.0,
        isAvailable: true,
      },
      {
        id: 'sensor_prox',
        name: 'AMS TMD3725 Proximity Sensor',
        vendor: 'AMS',
        type: 8,
        typeName: 'PROXIMITY',
        powerMa: 0.12,
        resolution: 1.0,
        maxRange: 5.0,
        isAvailable: true,
      },
      {
        id: 'sensor_light',
        name: 'AMS TMD3725 Ambient Light Sensor',
        vendor: 'AMS',
        type: 5,
        typeName: 'LIGHT',
        powerMa: 0.08,
        resolution: 1.0,
        maxRange: 60000.0,
        isAvailable: typeof window !== 'undefined' && 'AmbientLightSensor' in window,
      },
    ];

    return {
      success: true,
      data: sensors,
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 6. Camera Capabilities
  async getCameraCapability(): Promise<NativeResult<NativeCameraCapability>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getCameraCapability();
      } catch (err: any) {
        console.warn('Native getCameraCapability error:', err);
      }
    }

    let hasCam = true;
    let hasFront = true;
    let hasBack = true;

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        hasCam = videoInputs.length > 0;
        hasFront = videoInputs.some((d) => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('user'));
        hasBack = videoInputs.some((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
        if (hasCam && !hasFront && !hasBack) {
          hasBack = true;
          hasFront = true;
        }
      } catch {
        // Fallback defaults
      }
    }

    return {
      success: true,
      data: {
        hasCamera: hasCam,
        hasFrontCamera: hasFront,
        hasBackCamera: hasBack,
        hasFlash: true,
        supportedResolutions: ['1920x1080', '3840x2160', '1280x720'],
        maxZoomRatio: 8.0,
        permissionGranted: true,
      },
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 7. Biometrics
  async isBiometricAvailable(): Promise<NativeResult<NativeBiometricStatus>> {
    if (this.isNative) {
      try {
        return await NativePlugin.isBiometricAvailable();
      } catch (err: any) {
        console.warn('Native isBiometricAvailable error:', err);
      }
    }

    let platformAuth = false;
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        platformAuth = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        platformAuth = true;
      }
    }

    return {
      success: true,
      data: {
        isAvailable: true,
        biometricType: platformAuth ? 'FINGERPRINT' : 'MULTIPLE',
        hardwarePresent: true,
        enrolled: true,
        canAuthenticateStrong: true,
        canAuthenticateWeak: true,
        canAuthenticateDeviceCredential: true,
      },
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  async authenticateBiometric(options: { title: string; subtitle?: string; description?: string }): Promise<NativeResult<BiometricAuthResult>> {
    if (this.isNative) {
      try {
        return await NativePlugin.authenticateBiometric(options);
      } catch (err: any) {
        return {
          success: false,
          errorCode: 'AUTHENTICATION_FAILED',
          message: err?.message || 'Biometric authentication failed.',
          recoverable: true,
        };
      }
    }

    return {
      success: true,
      data: {
        authenticated: true,
        authType: 'BIOMETRIC_STRONG',
        timestamp: Date.now(),
      },
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // 8. Permissions
  async checkPermissions(options: { permissions: RuntimePermissionName[] }): Promise<NativeResult<PermissionStatusMap>> {
    if (this.isNative) {
      try {
        return await NativePlugin.checkPermissions(options);
      } catch (err: any) {
        console.warn('Native checkPermissions error:', err);
      }
    }

    const map: PermissionStatusMap = {};
    for (const p of options.permissions) {
      map[p] = {
        granted: true,
        canRequest: true,
        shouldShowRationale: false,
      };
    }

    return {
      success: true,
      data: map,
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  async requestPermissions(options: { permissions: RuntimePermissionName[] }): Promise<NativeResult<PermissionStatusMap>> {
    if (this.isNative) {
      try {
        return await NativePlugin.requestPermissions(options);
      } catch (err: any) {
        console.warn('Native requestPermissions error:', err);
      }
    }

    const map: PermissionStatusMap = {};
    for (const p of options.permissions) {
      map[p] = {
        granted: true,
        canRequest: true,
        shouldShowRationale: false,
      };
    }

    return {
      success: true,
      data: map,
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  async openAppSettings(): Promise<NativeResult<boolean>> {
    if (this.isNative) {
      try {
        return await NativePlugin.openAppSettings();
      } catch (err: any) {
        return { success: false, errorCode: 'UNKNOWN_ERROR', message: err?.message };
      }
    }
    return {
      success: true,
      data: true,
      message: 'App Settings intent dispatched (Simulated Web Environment).',
      runtimePlatform: 'web_preview',
    };
  }

  // 9. Installed Apps
  async getInstalledApps(): Promise<NativeResult<NativeInstalledApp[]>> {
    if (this.isNative) {
      try {
        const res = await NativePlugin.getInstalledApps();
        return res;
      } catch (err: any) {
        console.warn('Native getInstalledApps error:', err);
        return {
          success: false,
          errorCode: 'SERVICE_UNAVAILABLE',
          message: err?.message || 'Installed app data is unavailable on this device.',
        };
      }
    }

    // Web Fallback Mock Apps
    const apps: NativeInstalledApp[] = [
      {
        packageName: 'org.securedroid.vault',
        label: 'SecureDroid Vault',
        versionName: '2.4.0',
        versionCode: 240,
        targetSdk: 35,
        minSdk: 31,
        isSystemApp: true,
        isLaunchable: true,
        firstInstallTime: Date.now() - 86400000 * 30,
        lastUpdateTime: Date.now() - 86400000 * 2,
        requestedPermissions: ['android.permission.USE_BIOMETRIC', 'android.permission.INTERNET'],
        grantedPermissions: ['android.permission.USE_BIOMETRIC'],
        dangerousPermissions: [],
        installerPackage: 'com.android.vending',
        isDebuggable: false,
        signingCertSha256: '9E:B8:31:4A:22:91:D4:5C:8B:11:32:FA:7E:44:91:02:18:90:7E:5D',
        enabled: true,
      },
    ];

    return {
      success: true,
      data: apps,
      isSupported: true,
      runtimePlatform: 'web_preview',
    };
  }

  // Additional Native Wrappers
  async getAppRiskReports(): Promise<NativeResult<NativeAppRiskReport[]>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getAppRiskReports();
      } catch (err: any) {
        const debugDump = JSON.stringify(
          {
            message: err?.message,
            code: err?.code,
            name: err?.name,
            errorMessage: err?.errorMessage,
            stack: typeof err?.stack === 'string' ? err.stack.slice(0, 300) : undefined,
            keys: err && typeof err === 'object' ? Object.keys(err) : undefined,
            raw: (() => {
              try {
                return JSON.stringify(err);
              } catch {
                return String(err);
              }
            })(),
          },
          null,
          2
        );
        return {
          success: false,
          errorCode: 'SERVICE_UNAVAILABLE',
          message: `DEBUG: ${debugDump}`,
        };
      }
    }
    return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: 'Requires native execution.' };
  }

  async getHardeningReport(): Promise<NativeResult<NativeHardeningReport>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getHardeningReport();
      } catch (err: any) {
        return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: err?.message || 'Hardening report unavailable.' };
      }
    }
    return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: 'Requires native execution.' };
  }

  async launchApp(options: { packageName: string }): Promise<NativeResult<boolean>> {
    if (this.isNative) {
      try {
        return await NativePlugin.launchApp(options);
      } catch (err: any) {
        return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: err?.message, recoverable: true };
      }
    }
    return { success: true, data: true, runtimePlatform: 'web_preview' };
  }

  async secureStorageSet(key: string, value: string, requiresBiometric = false): Promise<NativeResult<boolean>> {
    if (this.isNative) {
      try {
        return await NativePlugin.secureStorageSet({ key, value, requiresBiometric });
      } catch (err: any) {
        return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: err?.message || 'Secure hardware vault unavailable.' };
      }
    }
    try {
      localStorage.setItem(`__securedroid_keystore_${key}`, JSON.stringify({ value, requiresBiometric }));
      return { success: true, data: true, runtimePlatform: 'web_preview' };
    } catch (e: any) {
      return { success: false, errorCode: 'UNKNOWN_ERROR', message: e?.message };
    }
  }

  async secureStorageGet(key: string, promptBiometric = false): Promise<NativeResult<string | null>> {
    if (this.isNative) {
      try {
        return await NativePlugin.secureStorageGet({ key, promptBiometric });
      } catch (err: any) {
        return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: err?.message || 'Secure hardware vault unavailable.' };
      }
    }
    try {
      const raw = localStorage.getItem(`__securedroid_keystore_${key}`);
      if (!raw) return { success: true, data: null };
      return { success: true, data: JSON.parse(raw).value, runtimePlatform: 'web_preview' };
    } catch (e: any) {
      return { success: false, errorCode: 'UNKNOWN_ERROR', message: e?.message };
    }
  }

  async logSecurityEvent(event: Omit<NativeSecurityEvent, 'id' | 'timestamp'>): Promise<NativeResult<NativeSecurityEvent>> {
    const fullEvent: NativeSecurityEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    if (this.isNative) {
      try {
        return await NativePlugin.logSecurityEvent({ event });
      } catch (err: any) {
        return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: err?.message || 'Security logging unavailable.' };
      }
    }
    return { success: true, data: fullEvent, runtimePlatform: 'web_preview' };
  }

  async getSecurityLogs(limit = 50, category?: string): Promise<NativeResult<NativeSecurityEvent[]>> {
    if (this.isNative) {
      try {
        return await NativePlugin.getSecurityLogs({ limit, category });
      } catch (err: any) {
        return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: err?.message || 'Security logs unavailable.' };
      }
    }
    return { success: true, data: [], runtimePlatform: 'web_preview' };
  }

  async startVpn(blocklist: string[] = [], dnsServer = '1.1.1.1'): Promise<NativeResult<NativeVpnStatus>> {
    if (this.isNative) {
      try {
        return await NativePlugin.startVpn({ blocklist, dnsServer });
      } catch (err: any) {
        return { success: false, errorCode: 'PERMISSION_DENIED', message: err?.message || 'VPN permission denied.', recoverable: true };
      }
    }
    return {
      success: true,
      data: {
        isActive: true,
        establishedTime: Date.now(),
        bytesIn: 0,
        bytesOut: 0,
        activeTunnelType: 'WIREGUARD',
        connectedServer: 'localhost-sim',
      },
      runtimePlatform: 'web_preview',
    };
  }
}

export const SecureDroidNative = new SecureDroidNativeService();
