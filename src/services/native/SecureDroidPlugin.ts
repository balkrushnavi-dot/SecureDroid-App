import { registerPlugin, Capacitor } from '@capacitor/core';

export interface ThreatItem {
  id: string;
  title: string;
  risk: string;
  description: string;
}

export interface AppItem {
  packageName: string;
  name: string;
  riskLevel: string;
  permissions: string[];
  isSystemApp?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  event: string;
  severity: string;
}

export interface SecureDroidPluginInterface {
  getDeviceStatus(): Promise<{ status: 'secure' | 'warning' | 'critical' }>;
  getThreats(): Promise<{ threats: ThreatItem[] }>;
  getScannedApps(): Promise<{ apps: AppItem[] }>;
  getAuditLogs(): Promise<{ logs: AuditLogItem[] }>;
  getNetworkStatus(): Promise<{ vpnActive: boolean }>;

  // Native Bridge methods
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
  getSecurityLogs(options?: { limit?: number; category?: string }): Promise<any>;
  logSecurityEvent(options: { event: any }): Promise<any>;

  // Domain Blocklist & Allowlist methods
  getBlockedDomains(): Promise<any>;
  addBlockedDomain(options: { domain: string }): Promise<any>;
  removeBlockedDomain(options: { domain: string }): Promise<any>;
  addAllowedDomain(options: { domain: string }): Promise<any>;
  removeAllowedDomain(options: { domain: string }): Promise<any>;
}

const StubPlugin: SecureDroidPluginInterface = {
  async getDeviceStatus() {
    return { status: 'secure' };
  },
  async getThreats() {
    return { threats: [] };
  },
  async getScannedApps() {
    return { apps: [] };
  },
  async getAuditLogs() {
    return { 
      logs: [
        { 
          id: '1', 
          timestamp: new Date().toISOString(), 
          event: 'SecureDroid running in web fallback mode', 
          severity: 'low' 
        }
      ] 
    };
  },
  async getNetworkStatus() {
    return { vpnActive: false };
  },
  async checkConnection() {
    return { connected: false, message: 'Web preview mode' };
  },
  async getInstalledApps() {
    return { success: false, data: [] };
  },
  async scanForRisks() {
    return { success: false, data: [] };
  },
  async getAppRiskReports() {
    return { success: false, data: [] };
  },
  async getHardeningReport() {
    return { success: false, data: { score: 0, findings: [] } };
  },
  async getDeviceHardening() {
    return { success: false, data: { score: 0, findings: [] } };
  },
  async requestVpnPermission() {
    return { success: false, granted: false };
  },
  async getVpnStatus() {
    return { success: false, data: { isActive: false, state: 'DISCONNECTED' } };
  },
  async startVpn() {
    return { success: false, state: 'DISCONNECTED' };
  },
  async stopVpn() {
    return { success: false, state: 'DISCONNECTED' };
  },
  async getSecurityLogs() {
    return { success: true, data: [] };
  },
  async logSecurityEvent() {
    return { success: true };
  },
  async getBlockedDomains() {
    return { success: true, data: { blockedDomains: [], allowedDomains: [] } };
  },
  async addBlockedDomain() {
    return { success: true, added: true };
  },
  async removeBlockedDomain() {
    return { success: true, removed: true };
  },
  async addAllowedDomain() {
    return { success: true, added: true };
  },
  async removeAllowedDomain() {
    return { success: true, removed: true };
  }
};

export const SecureDroidPlugin = Capacitor.isNativePlatform()
  ? registerPlugin<SecureDroidPluginInterface>('SecureDroid')
  : StubPlugin;

// Export SecureDroidNativePlugin alias to satisfy SecureDroidNative.ts imports
export const SecureDroidNativePlugin = SecureDroidPlugin;
