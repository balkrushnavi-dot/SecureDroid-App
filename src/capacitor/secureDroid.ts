// src/capacitor/secureDroid.ts
import { Capacitor } from '@capacitor/core';

// This MUST match the @CapacitorPlugin(name = "SecureDroid")
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
            console.log('🔌 Checking plugin connection...');
            const result = await SecureDroid.checkConnection();
            console.log('✅ Plugin connected:', result);
            return result as { connected: boolean; message: string };
        } catch (error) {
            console.error('❌ Plugin NOT connected:', error);
            return { connected: false, message: 'Plugin not available' };
        }
    },

    getInstalledApps: async (): Promise<AppInfo[]> => {
        try {
            console.log('📱 Getting installed apps...');
            const result = await SecureDroid.getInstalledApps();
            const apps = (result as any).apps || [];
            console.log(`✅ Found ${apps.length} apps`);
            return apps;
        } catch (error) {
            console.error('❌ Failed to get apps:', error);
            return [];
        }
    },

    scanForRisks: async (): Promise<RiskInfo[]> => {
        try {
            console.log('🔍 Scanning for risks...');
            const result = await SecureDroid.scanForRisks();
            const risks = (result as any).riskDetails || [];
            console.log(`✅ Found ${risks.length} risky apps`);
            return risks;
        } catch (error) {
            console.error('❌ Failed to scan:', error);
            return [];
        }
    },

    startVpn: async (): Promise<boolean> => {
        try {
            await SecureDroid.startVpn();
            console.log('✅ VPN started');
            return true;
        } catch (error) {
            console.error('❌ Failed to start VPN:', error);
            return false;
        }
    },

    stopVpn: async (): Promise<boolean> => {
        try {
            await SecureDroid.stopVpn();
            console.log('✅ VPN stopped');
            return true;
        } catch (error) {
            console.error('❌ Failed to stop VPN:', error);
            return false;
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
    }
};
