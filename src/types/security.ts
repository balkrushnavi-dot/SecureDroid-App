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
    securityScore: number;
    privacyScore: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    riskColor: string;
    riskIcon: string;
    permissions: AppPermission[];
}

export interface AppPermission {
    name: string;
    isGranted: boolean;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
}

export interface HardeningReport {
    screenLock: boolean;
    encryption: boolean;
    securityPatch: string;
    usbDebugging: boolean;
    developerOptions: boolean;
    unknownSources: boolean;
    vpnStatus: boolean;
}

export interface VpnStatus {
    isConnected: boolean;
    isActive: boolean;
    message: string;
}

export interface SecurityScanResult {
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

export interface PluginResult<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
}
