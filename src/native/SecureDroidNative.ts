import { NativeModules, Platform } from 'react-native';

const { SecureDroidModule } = NativeModules;

export interface AppInfo {
    packageName: string;
    appName: string;
    versionName: string;
    versionCode: number;
    isSystemApp: boolean;
    installTime: number;
    updateTime: number;
    isSideloaded: boolean;
    installSource: string;
    permissions: AppPermission[];
    securityScore: number;
    privacyScore: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AppPermission {
    name: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
}

export interface ScanResult {
    totalRiskyApps: number;
    riskDetails: Array<{
        appName: string;
        packageName: string;
        riskLevel: string;
        reason: string;
    }>;
}

export const SecureDroidNative = {
    getInstalledApps: async (): Promise<AppInfo[]> => {
        if (Platform.OS !== 'android') {
            console.warn('Not running on Android');
            return [];
        }

        try {
            const result = await SecureDroidModule.getInstalledApps();
            const parsed = JSON.parse(result);
            return parsed.apps || [];
        } catch (error) {
            console.error('Failed to get installed apps:', error);
            return [];
        }
    },

    startVpn: async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return false;
        }

        try {
            const result = await SecureDroidModule.startVpn();
            const parsed = JSON.parse(result);
            return parsed.success || false;
        } catch (error) {
            console.error('Failed to start VPN:', error);
            return false;
        }
    },

    stopVpn: async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return false;
        }

        try {
            const result = await SecureDroidModule.stopVpn();
            const parsed = JSON.parse(result);
            return parsed.success || false;
        } catch (error) {
            console.error('Failed to stop VPN:', error);
            return false;
        }
    },

    scanForRisks: async (): Promise<ScanResult | null> => {
        if (Platform.OS !== 'android') {
            return null;
        }

        try {
            const result = await SecureDroidModule.scanForRisks();
            const parsed = JSON.parse(result);
            return {
                totalRiskyApps: parsed.totalRiskyApps || 0,
                riskDetails: parsed.riskDetails || []
            };
        } catch (error) {
            console.error('Failed to scan for risks:', error);
            return null;
        }
    }
};
