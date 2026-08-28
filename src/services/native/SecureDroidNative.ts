import { Capacitor, registerPlugin } from '@capacitor/core';

import type {
  NativeResult,
  NativeInstalledApp,
  NativeAppRiskReport,
  NativeSecurityEvent,
  NativeVpnStatus,
} from '../../types/native';

/**
 * ============================================================
 * Capacitor native plugin contract
 * ============================================================
 *
 * IMPORTANT:
 * Android registers:
 *
 * @CapacitorPlugin(name = "SecureDroid")
 *
 * Therefore this MUST be:
 *
 * registerPlugin<SecureDroidPlugin>('SecureDroid')
 *
 * Do not use "SecureDroidPlugin" here.
 */
export interface SecureDroidPlugin {
  checkConnection(): Promise<any>;

  getInstalledApps(): Promise<any>;

  scanForRisks(): Promise<any>;

  getAppRiskReports(): Promise<any>;

  getHardeningReport(): Promise<any>;

  getDeviceHardening(): Promise<any>;

  requestVpnPermission(): Promise<any>;

  getVpnStatus(): Promise<any>;

  startVpn(): Promise<any>;

  stopVpn(): Promise<any>;

  getSecurityLogs(options?: {
    limit?: number;
    category?: string;
  }): Promise<any>;

  logSecurityEvent(options: {
    event: Omit<NativeSecurityEvent, 'id' | 'timestamp'>;
  }): Promise<any>;
}

/**
 * Single native Capacitor plugin instance.
 */
const NativePlugin = registerPlugin<SecureDroidPlugin>('SecureDroid');

/**
 * SecureDroid Native Service
 *
 * This is the ONLY TypeScript adapter that should be used by
 * the React application for native SecureDroid functionality.
 *
 * Android response formats are normalized here into the
 * application's NativeResult<T> contract.
 */
class SecureDroidNativeService {
  private readonly isNative = Capacitor.isNativePlatform();

  // ============================================================
  // CONNECTION
  // ============================================================

  async checkConnection(): Promise<
    NativeResult<{
      connected: boolean;
      plugin?: string;
      platform?: string;
      message?: string;
      timestamp?: number;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Native SecureDroid functionality requires Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any = await NativePlugin.checkConnection();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode || 'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'SecureDroid native bridge is unavailable.',
          isSupported: false,
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: {
          connected: Boolean(raw.connected),
          plugin:
            typeof raw.plugin === 'string'
              ? raw.plugin
              : undefined,
          platform:
            typeof raw.platform === 'string'
              ? raw.platform
              : undefined,
          message:
            typeof raw.message === 'string'
              ? raw.message
              : undefined,
          timestamp:
            typeof raw.timestamp === 'number'
              ? raw.timestamp
              : undefined,
        },
        message: raw.message,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] checkConnection failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'SecureDroid native bridge is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // INSTALLED APPLICATIONS
  // ============================================================

  async getInstalledApps(): Promise<
    NativeResult<NativeInstalledApp[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Installed-app evidence requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.getInstalledApps();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Installed-app evidence is unavailable from the native Android bridge.',
          runtimePlatform: 'android_native',
        };
      }

      /*
       * Android currently returns:
       *
       * {
       *   success: true,
       *   data: [...],
       *   apps: [...]
       * }
       *
       * Prefer data, then fall back to apps.
       */
      const rawApps = Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.apps)
          ? raw.apps
          : [];

      const apps: NativeInstalledApp[] =
        rawApps.map(
          (app: any): NativeInstalledApp => {
            const requestedPermissions =
              Array.isArray(
                app.requestedPermissions
              )
                ? app.requestedPermissions
                : Array.isArray(app.permissions)
                  ? app.permissions
                  : [];

            const dangerousPermissions =
              Array.isArray(
                app.dangerousPermissions
              )
                ? app.dangerousPermissions
                : requestedPermissions.filter(
                    (permission: string) =>
                      this.isDangerousPermission(
                        permission
                      )
                  );

            const installerPackage =
              app.installerPackage ??
              app.installerPackageName ??
              (
                app.installSource &&
                app.installSource !== 'UNKNOWN'
                  ? app.installSource
                  : undefined
              );

            return {
              packageName: String(
                app.packageName || ''
              ),

              label: String(
                app.label ||
                  app.appName ||
                  app.packageName ||
                  'Unknown application'
              ),

              versionName: String(
                app.versionName || 'Unknown'
              ),

              versionCode: Number(
                app.versionCode || 0
              ),

              targetSdk: Number(
                app.targetSdk || 0
              ),

              minSdk: Number(
                app.minSdk || 0
              ),

              isSystemApp: Boolean(
                app.isSystemApp
              ),

              isLaunchable: Boolean(
                app.isLaunchable
              ),

              iconBase64:
                typeof app.iconBase64 ===
                'string'
                  ? app.iconBase64
                  : undefined,

              firstInstallTime: Number(
                app.firstInstallTime ??
                  app.installTime ??
                  0
              ),

              lastUpdateTime: Number(
                app.lastUpdateTime ??
                  app.updateTime ??
                  0
              ),

              requestedPermissions,

              /*
               * Never fabricate granted permissions.
               */
              grantedPermissions:
                Array.isArray(
                  app.grantedPermissions
                )
                  ? app.grantedPermissions
                  : [],

              dangerousPermissions,

              installerPackage,

              isDebuggable: Boolean(
                app.isDebuggable
              ),

              signingCertSha256:
                typeof app.signingCertSha256 ===
                'string'
                  ? app.signingCertSha256
                  : undefined,

              enabled: Boolean(
                app.enabled ??
                  app.isEnabled ??
                  true
              ),
            };
          }
        );

      return {
        success: true,
        data: apps,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getInstalledApps failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Installed-app evidence is unavailable from the native Android bridge.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // APPLICATION RISK SCAN
  // ============================================================

  async scanForRisks(): Promise<
    NativeResult<NativeAppRiskReport[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Application risk analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.scanForRisks();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Application risk analysis is unavailable on this device.',
          runtimePlatform: 'android_native',
        };
      }

      const rawReports = Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.riskDetails)
          ? raw.riskDetails
          : [];

      const reports: NativeAppRiskReport[] =
        rawReports.map(
          (report: any): NativeAppRiskReport => {
            const rawFindings =
              Array.isArray(report.findings)
                ? report.findings
                : [];

            const findings =
              rawFindings.map(
                (
                  finding: any,
                  index: number
                ) => ({
                  id: String(
                    finding.id ||
                      finding.code ||
                      `finding_${index}`
                  ),

                  level:
                    this.normalizeRiskLevel(
                      finding.level ||
                        finding.severity
                    ),

                  summary: String(
                    finding.summary ||
                      finding.title ||
                      finding.description ||
                      'Security finding'
                  ),
                })
              );

            return {
              packageName: String(
                report.packageName || ''
              ),

              label: String(
                report.label ||
                  report.appName ||
                  report.packageName ||
                  'Unknown application'
              ),

              overallRisk:
                this.normalizeRiskLevel(
                  report.overallRisk ||
                    report.riskLevel
                ),

              findings,
            };
          }
        );

      return {
        success: true,
        data: reports,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] scanForRisks failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Application risk analysis is unavailable on this device.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // APPLICATION RISK REPORTS
  // ============================================================

  async getAppRiskReports(): Promise<
    NativeResult<NativeAppRiskReport[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Application risk analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.getAppRiskReports();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'App risk analysis is unavailable on this device.',
          runtimePlatform: 'android_native',
        };
      }

      const rawReports = Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.reports)
          ? raw.reports
          : Array.isArray(raw.riskDetails)
            ? raw.riskDetails
            : [];

      const reports: NativeAppRiskReport[] =
        rawReports.map(
          (report: any): NativeAppRiskReport => {
            const rawFindings =
              Array.isArray(report.findings)
                ? report.findings
                : [];

            const findings =
              rawFindings.map(
                (
                  finding: any,
                  index: number
                ) => ({
                  id: String(
                    finding.id ||
                      finding.code ||
                      `finding_${index}`
                  ),

                  level:
                    this.normalizeRiskLevel(
                      finding.level ||
                        finding.severity
                    ),

                  summary: String(
                    finding.summary ||
                      finding.title ||
                      finding.description ||
                      'Security finding'
                  ),
                })
              );

            return {
              packageName: String(
                report.packageName || ''
              ),

              label: String(
                report.label ||
                  report.appName ||
                  report.packageName ||
                  'Unknown application'
              ),

              overallRisk:
                this.normalizeRiskLevel(
                  report.overallRisk ||
                    report.riskLevel
                ),

              findings,
            };
          }
        );

      return {
        success: true,
        data: reports,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getAppRiskReports failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'App risk analysis is unavailable on this device.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // DEVICE HARDENING
  // ============================================================

  async getHardeningReport(): Promise<
    NativeResult<any>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Device hardening analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.getHardeningReport();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Device hardening analysis is unavailable.',
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: raw.data ?? raw,
        message: raw.message,
        isSupported:
          raw.isSupported !== false,
        runtimePlatform:
          raw.runtimePlatform ||
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getHardeningReport failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Device hardening analysis is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  async getDeviceHardening(): Promise<
    NativeResult<any>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Device hardening analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.getDeviceHardening();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Device hardening analysis is unavailable.',
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: raw.data ?? raw,
        message: raw.message,
        isSupported:
          raw.isSupported !== false,
        runtimePlatform:
          raw.runtimePlatform ||
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getDeviceHardening failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Device hardening analysis is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
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
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'VPN permission requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.requestVpnPermission();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'VPN_PERMISSION_FAILED',
          message:
            raw?.message ||
            'Unable to request VPN permission.',
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: {
          granted: Boolean(raw.granted),

          permissionRequested:
            Boolean(
              raw.permissionRequested
            ),

          state: String(
            raw.state ||
              'DISCONNECTED'
          ),
        },

        message: raw.message,

        isSupported: true,

        runtimePlatform:
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] requestVpnPermission failed:',
        error
      );

      return {
        success: false,
        errorCode:
          'VPN_PERMISSION_FAILED',
        message:
          error?.message ||
          'Unable to request VPN permission.',
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    }
  }

  // ============================================================
  // VPN STATUS
  // ============================================================

  async getVpnStatus(): Promise<
    NativeResult<NativeVpnStatus>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'VPN status requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.getVpnStatus();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'VPN_STATUS_UNAVAILABLE',
          message:
            raw?.message ||
            'VPN status is unavailable on this device.',
          runtimePlatform: 'android_native',
        };
      }

      const rawData =
        raw.data &&
        typeof raw.data === 'object'
          ? raw.data
          : raw;

      const status =
        this.normalizeVpnStatus(
          rawData
        );

      return {
        success: true,
        data: status,
        message: raw.message,
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getVpnStatus failed:',
        error
      );

      return {
        success: false,
        errorCode:
          'VPN_STATUS_UNAVAILABLE',
        message:
          error?.message ||
          'VPN status is unavailable on this device.',
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    }
  }

  // ============================================================
  // VPN START
  // ============================================================

  async startVpn(): Promise<
    NativeResult<{
      state: string;
      permissionRequired?: boolean;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Starting the VPN requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      /*
       * Check VPN permission first.
       *
       * This prevents sending a start request when Android
       * still requires the system VPN confirmation screen.
       */
      const prepareResult =
        await this.checkVpnPermission();

      if (!prepareResult.granted) {
        return {
          success: false,
          errorCode:
            'VPN_PERMISSION_REQUIRED',
          message:
            'VPN permission is required before starting the VPN.',
          data: {
            state: 'DISCONNECTED',
            permissionRequired: true,
          },
          isSupported: true,
          runtimePlatform:
            'android_native',
        };
      }

      const raw: any =
        await NativePlugin.startVpn();

      /*
       * IMPORTANT:
       *
       * success means the START REQUEST was accepted.
       * It does NOT necessarily mean the VPN is already CONNECTED.
       *
       * Android will normally transition:
       *
       * DISCONNECTED
       *      ↓
       * CONNECTING
       *      ↓
       * CONNECTED
       */
      const state = String(
        raw?.state ||
          'CONNECTING'
      );

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.permissionRequired
              ? 'VPN_PERMISSION_REQUIRED'
              : 'VPN_START_FAILED',

          message:
            raw?.message ||
            'Unable to start VPN.',

          data: {
            state,
            permissionRequired:
              Boolean(
                raw?.permissionRequired
              ),
          },

          isSupported: true,
          runtimePlatform:
            'android_native',
        };
      }

      return {
        success: true,

        data: {
          state,

          permissionRequired:
            Boolean(
              raw.permissionRequired
            ),
        },

        message:
          raw.message ||
          'VPN start requested.',

        isSupported: true,

        runtimePlatform:
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] startVpn failed:',
        error
      );

      return {
        success: false,
        errorCode:
          'VPN_START_FAILED',
        message:
          error?.message ||
          'Unable to start VPN.',
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    }
  }

  // ============================================================
  // VPN STOP
  // ============================================================

  async stopVpn(): Promise<
    NativeResult<{
      state: string;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Stopping the VPN requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.stopVpn();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'VPN_STOP_FAILED',
          message:
            raw?.message ||
            'Unable to stop VPN.',
          data: {
            state: String(
              raw?.state ||
                'ERROR'
            ),
          },
          isSupported: true,
          runtimePlatform:
            'android_native',
        };
      }

      return {
        success: true,

        data: {
          state: String(
            raw.state ||
              'DISCONNECTING'
          ),
        },

        message:
          raw.message ||
          'VPN stop requested.',

        isSupported: true,

        runtimePlatform:
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] stopVpn failed:',
        error
      );

      return {
        success: false,
        errorCode:
          'VPN_STOP_FAILED',
        message:
          error?.message ||
          'Unable to stop VPN.',
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    }
  }

  // ============================================================
  // SECURITY AUDIT LOG
  // ============================================================

  async getSecurityLogs(
    limit = 50,
    category?: string
  ): Promise<
    NativeResult<NativeSecurityEvent[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Security logs require native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.getSecurityLogs({
          limit,
          category,
        });

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Security logs are unavailable on this device.',
          runtimePlatform:
            'android_native',
        };
      }

      const rawEvents =
        Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.value)
            ? raw.value
            : [];

      const events: NativeSecurityEvent[] =
        rawEvents.map(
          (
            event: any,
            index: number
          ) => ({
            id: String(
              event.id ||
                `event_${index}`
            ),

            timestamp: Number(
              event.timestamp ||
                Date.now()
            ),

            category:
              this.normalizeEventCategory(
                event.category
              ),

            severity:
              this.normalizeEventSeverity(
                event.severity
              ),

            description: String(
              event.description ||
                'Security event'
            ),

            source: String(
              event.source ||
                'SecureDroid'
            ),

            metadata:
              event.metadata &&
              typeof event.metadata ===
                'object'
                ? event.metadata
                : undefined,
          })
        );

      return {
        success: true,
        data: events,
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getSecurityLogs failed:',
        error
      );

      return {
        success: false,
        errorCode:
          'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Security logs are unavailable on this device.',
        isSupported: false,
        runtimePlatform:
          'android_native',
      };
    }
  }

  // ============================================================
  // WRITE SECURITY EVENT
  // ============================================================

  async logSecurityEvent(
    event: Omit<
      NativeSecurityEvent,
      'id' | 'timestamp'
    >
  ): Promise<
    NativeResult<NativeSecurityEvent>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Security event logging requires native Android execution.',
        isSupported: false,
        runtimePlatform:
          'web_preview',
      };
    }

    try {
      const raw: any =
        await NativePlugin.logSecurityEvent({
          event,
        });

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Unable to write security event.',
          runtimePlatform:
            'android_native',
        };
      }

      const source =
        raw.data &&
        typeof raw.data === 'object'
          ? raw.data
          : raw;

      const normalizedEvent:
        NativeSecurityEvent = {
          id: String(
            source.id ||
              `evt_${Date.now()}`
          ),

          timestamp: Number(
            source.timestamp ||
              Date.now()
          ),

          category:
            this.normalizeEventCategory(
              source.category ||
                event.category
            ),

          severity:
            this.normalizeEventSeverity(
              source.severity ||
                event.severity
            ),

          description: String(
            source.description ||
              event.description ||
              'Security event'
          ),

          source: String(
            source.source ||
              event.source ||
              'SecureDroid'
          ),

          metadata:
            source.metadata &&
            typeof source.metadata ===
              'object'
              ? source.metadata
              : undefined,
        };

      return {
        success: true,
        data: normalizedEvent,
        isSupported: true,
        runtimePlatform:
          'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] logSecurityEvent failed:',
        error
      );

      return {
        success: false,
        errorCode:
          'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Unable to write security event.',
        isSupported: false,
        runtimePlatform:
          'android_native',
      };
    }
  }

  // ============================================================
  // PRIVATE VPN PERMISSION CHECK
  // ============================================================

  private async checkVpnPermission(): Promise<{
    granted: boolean;
  }> {
    /*
     * requestVpnPermission() is intentionally used as the
     * permission-status API because the Android implementation
     * calls VpnService.prepare().
     *
     * When permission is already granted:
     *
     * {
     *   success: true,
     *   granted: true
     * }
     *
     * When permission is not granted, Android opens the
     * system permission activity.
     */
    try {
      const raw: any =
        await NativePlugin.requestVpnPermission();

      if (!raw || raw.success === false) {
        return {
          granted: false,
        };
      }

      return {
        granted:
          raw.granted === true,
      };
    } catch (error) {
      console.error(
        '[SecureDroid] VPN permission check failed:',
        error
      );

      return {
        granted: false,
      };
    }
  }

  // ============================================================
  // VPN STATUS NORMALIZATION
  // ============================================================

  private normalizeVpnStatus(
    raw: any
  ): NativeVpnStatus {
    const state = String(
      raw?.state ||
        (raw?.isActive
          ? 'CONNECTED'
          : 'DISCONNECTED')
    ).toUpperCase();

    const isActive =
      state === 'CONNECTED' ||
      Boolean(raw?.isActive);

    return {
      ...(raw as NativeVpnStatus),

      isActive,

      isConnected:
        state === 'CONNECTED' ||
        Boolean(raw?.isConnected),

      state,

      establishedTime:
        typeof raw?.establishedTime ===
        'number'
          ? raw.establishedTime
          : undefined,

      bytesReceived: Number(
        raw?.bytesReceived || 0
      ),

      bytesTransmitted: Number(
        raw?.bytesTransmitted || 0
      ),

      blockedDomainsCount: Number(
        raw?.blockedDomainsCount || 0
      ),

      activeDns: String(
        raw?.activeDns ||
          '1.1.1.1'
      ),

      filterMode: String(
        raw?.filterMode ||
          'BLOCKLIST'
      ),
    } as NativeVpnStatus;
  }

  // ============================================================
  // RISK NORMALIZATION
  // ============================================================

  private normalizeRiskLevel(
    value: any
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    switch (
      String(value || '')
        .toUpperCase()
    ) {
      case 'HIGH':
      case 'CRITICAL':
        return 'HIGH';

      case 'MEDIUM':
      case 'MODERATE':
        return 'MEDIUM';

      case 'LOW':
      default:
        return 'LOW';
    }
  }

  // ============================================================
  // SECURITY EVENT NORMALIZATION
  // ============================================================

  private normalizeEventSeverity(
    value: any
  ): 'INFO' | 'WARNING' | 'CRITICAL' {
    switch (
      String(value || '')
        .toUpperCase()
    ) {
      case 'CRITICAL':
        return 'CRITICAL';

      case 'WARNING':
      case 'WARN':
        return 'WARNING';

      case 'INFO':
      default:
        return 'INFO';
    }
  }

  private normalizeEventCategory(
    value: any
  ): NativeSecurityEvent['category'] {
    switch (
      String(value || '')
        .toUpperCase()
    ) {
      case 'PERMISSION':
        return 'PERMISSION';

      case 'AUTH':
      case 'AUTHENTICATION':
        return 'AUTH';

      case 'NETWORK':
        return 'NETWORK';

      case 'SCAN':
      case 'APPLICATIONS':
        return 'SCAN';

      case 'CONFIG':
        return 'CONFIG';

      case 'EMERGENCY':
        return 'EMERGENCY';

      case 'BACKUP':
        return 'BACKUP';

      case 'AUDIT':
      case 'SECURITY':
      default:
        return 'AUDIT';
    }
  }

  // ============================================================
  // DANGEROUS PERMISSION DETECTION
  // ============================================================

  private isDangerousPermission(
    permission: string
  ): boolean {
    const dangerousPermissions =
      new Set([
        'android.permission.CAMERA',

        'android.permission.RECORD_AUDIO',

        'android.permission.ACCESS_FINE_LOCATION',

        'android.permission.ACCESS_COARSE_LOCATION',

        'android.permission.READ_CONTACTS',

        'android.permission.WRITE_CONTACTS',

        'android.permission.READ_CALENDAR',

        'android.permission.WRITE_CALENDAR',

        'android.permission.READ_SMS',

        'android.permission.SEND_SMS',

        'android.permission.RECEIVE_SMS',

        'android.permission.CALL_PHONE',

        'android.permission.READ_CALL_LOG',

        'android.permission.WRITE_CALL_LOG',

        'android.permission.READ_PHONE_STATE',

        'android.permission.READ_PHONE_NUMBERS',

        'android.permission.BODY_SENSORS',

        'android.permission.ACTIVITY_RECOGNITION',

        'android.permission.READ_MEDIA_IMAGES',

        'android.permission.READ_MEDIA_VIDEO',

        'android.permission.READ_MEDIA_AUDIO',

        'android.permission.POST_NOTIFICATIONS',
      ]);

    return dangerousPermissions.has(
      permission
    );
  }
}

export const SecureDroidNative =
  new SecureDroidNativeService();

export default SecureDroidNative;
