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
  }
};

export const SecureDroidPlugin = Capacitor.isNativePlatform()
  ? registerPlugin<SecureDroidPluginInterface>('SecureDroidPlugin')
  : StubPlugin;
