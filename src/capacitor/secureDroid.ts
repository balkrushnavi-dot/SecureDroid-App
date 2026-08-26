// src/capacitor/secureDroid.ts
import { Capacitor } from '@capacitor/core';

// Make sure the plugin name matches exactly
const SecureDroid = Capacitor.Plugins.SecureDroid;

export interface AppInfo {
    packageName: string;
    appName: string;
    versionName: string;
    versionCode: number;
    isSystemApp: boolean;
    installTime: number;
    updateTime: number;
    installSource: string;
    isSideloaded: boolean;
    permissions: string[];
}

export interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    reason: string;
    installSource: string;
}

export const secureDroid = {
    checkConnection: async () => {
        try {
            console.log('🔌 Checking connection...');
            const result = await SecureDroid.checkConnection();
            console.log('✅ Connection result:', result);
            return result as { connected: boolean; message: string };
        } catch (error) {
            console.error('❌ Connection failed:', error);
            return { connected: false, message: 'Plugin not available' };
        }
    },

    getInstalledApps: async (): Promise<AppInfo[]> => {
        try {
            console.log('📱 Getting installed apps...');
            const result = await SecureDroid.getInstalledApps();
            console.log('✅ Apps result:', result);
            return (result as any).apps || [];
        } catch (error) {
            console.error('❌ Failed to get apps:', error);
            return [];
        }
    },

    scanForRisks: async (): Promise<RiskInfo[]> => {
        try {
            console.log('🔍 Scanning for risks...');
            const result = await SecureDroid.scanForRisks();
            console.log('✅ Risk result:', result);
            return (result as any).riskDetails || [];
        } catch (error) {
            console.error('❌ Failed to scan:', error);
            return [];
        }
    },

    getAppRiskReports: async (): Promise<any> => {
        try {
            console.log('📊 Getting risk reports...');
            const result = await SecureDroid.getAppRiskReports();
            console.log('✅ Reports result:', result);
            return result;
        } catch (error) {
            console.error('❌ Failed to get reports:', error);
            return { success: false, message: 'Failed to get reports' };
        }
    },

    getHardeningReport: async () => {
        try {
            const result = await SecureDroid.getHardeningReport();
            return result;
        } catch (error) {
            console.error('❌ Failed to get hardening report:', error);
            return {};
        }
    },

    startVpn: async (): Promise<boolean> => {
        try {
            await SecureDroid.startVpn();
            return true;
        } catch (error) {
            console.error('❌ Failed to start VPN:', error);
            return false;
        }
    },

    stopVpn: async (): Promise<boolean> => {
        try {
            await SecureDroid.stopVpn();
            return true;
        } catch (error) {
            console.error('❌ Failed to stop VPN:', error);
            return false;
        }
    }
};
