import { Capacitor } from '@capacitor/core';

export interface AppInfo {
    packageName: string;
    appName: string;
    versionName: string;
    versionCode: number;
    isSystemApp: boolean;
    installTime: number;
    updateTime: number;
    installSource: string;
    permissions: string[];
}

export interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    reason: string;
    installSource: string;
}

export interface ScanResult {
    totalRiskyApps: number;
    riskDetails: RiskInfo[];
}

// Get the plugin
const SecureDroid = Capacitor.Plugins.SecureDroid;

export const secureDroid = {
    /**
     * Test if the plugin is working
     */
    checkConnection: async (): Promise<{ connected: boolean; message: string }> => {
        try {
            const result = await SecureDroid.checkConnection();
            return result as any;
        } catch (error) {
            console.error('Plugin connection failed:', error);
            return { connected: false, message: 'Plugin not available' };
        }
    },

    /**
     * Get all installed apps
     */
    getInstalledApps: async (): Promise<AppInfo[]> => {
        try {
            const result = await SecureDroid.getInstalledApps();
            return (result as any).apps || [];
        } catch (error) {
            console.error('Failed to get installed apps:', error);
            return [];
        }
    },

    /**
     * Scan for risky apps
     */
    scanForRisks: async (): Promise<ScanResult> => {
        try {
            const result = await SecureDroid.scanForRisks();
            return {
                totalRiskyApps: (result as any).totalRiskyApps || 0,
                riskDetails: (result as any).riskDetails || []
            };
        } catch (error) {
            console.error('Failed to scan for risks:', error);
            return { totalRiskyApps: 0, riskDetails: [] };
        }
    },

    /**
     * Get device hardening report
     */
    getHardeningReport: async (): Promise<any> => {
        try {
            const result = await SecureDroid.getHardeningReport();
            return result;
        } catch (error) {
            console.error('Failed to get hardening report:', error);
            return {};
        }
    }
};
