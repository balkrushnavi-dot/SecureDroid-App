import { Plugins } from '@capacitor/core';

const { SecureDroidPlugin: NativeSecureDroid } = Plugins;

export interface InstalledAppsResponse {
    apps: any[];
}

export interface HardeningResponse {
    screenLock: boolean;
    encryption: boolean;
    securityPatch: string;
    usbDebugging: boolean;
    developerOptions: boolean;
    unknownSources: boolean;
    vpnStatus: boolean;
}

export interface VpnStatusResponse {
    isConnected: boolean;
    isActive: boolean;
    message: string;
}

export interface ScanRisksResponse {
    totalApps: number;
    riskyApps: number;
    riskDetails: Array<{
        name: string;
        riskLevel: string;
        securityScore: number;
        privacyScore: number;
        reason: string;
    }>;
}

export const SecureDroidPlugin = {
    getInstalledApps: async (): Promise<{ apps: any[] }> => {
        return await NativeSecureDroid.getInstalledApps();
    },

    getDeviceHardening: async (): Promise<HardeningResponse> => {
        return await NativeSecureDroid.getDeviceHardening();
    },

    startVpn: async (): Promise<{ success: boolean; message: string }> => {
        return await NativeSecureDroid.startVpn();
    },

    stopVpn: async (): Promise<{ success: boolean; message: string }> => {
        return await NativeSecureDroid.stopVpn();
    },

    getVpnStatus: async (): Promise<VpnStatusResponse> => {
        return await NativeSecureDroid.getVpnStatus();
    },

    scanForRisks: async (): Promise<ScanRisksResponse> => {
        return await NativeSecureDroid.scanForRisks();
    }
};
