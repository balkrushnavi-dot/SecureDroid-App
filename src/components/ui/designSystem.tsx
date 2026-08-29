import { useCallback, useEffect, useState } from 'react';

export interface AppInfo {
  packageName: string;
  appName: string;
  label?: string;
  versionName: string;
  versionCode: number;
  targetSdk?: number;
  minSdk?: number;
  isSystemApp: boolean;
  isEnabled?: boolean;
  isLaunchable?: boolean;
  firstInstallTime: number;
  lastUpdateTime: number;
  installTime: number;
  updateTime: number;
  requestedPermissions: string[];
  grantedPermissions: string[];
  dangerousPermissions: string[];
  installerPackage?: string;
  installSource: string;
  installerKnown?: boolean;
  isSideloaded: boolean;
  isDebuggable?: boolean;
  enabled?: boolean;
  permissions: string[];
  signingCertSha256?: string;
}

export interface RiskInfo {
  appName: string;
  packageName: string;
  riskLevel: string;
  securityScore?: number;
  findingCount?: number;
  findings?: Array<{
    code?: string;
    title?: string;
    description?: string;
    severity?: string;
    points?: number;
  }>;
  reason?: string;
  installSource?: string;
  isSystemApp?: boolean;
}

export interface HardeningFinding {
  id: string;
  level: 'GOOD' | 'WARNING' | 'CRITICAL';
  summary: string;
}

export const useSecureDroid = () => {
  const [apps] = useState<AppInfo[]>([]);
  const [risks] = useState<RiskInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected] = useState(false);
  const [error] = useState<string | null>(null);
  const [score] = useState(0);
  const [hardeningFindings] = useState<HardeningFinding[]>([]);
  const [usingMock] = useState(false);

  const reload = useCallback(async () => {
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    apps,
    risks,
    loading,
    connected,
    error,
    score,
    hardeningFindings,
    usingMock,
    reload,
  };
};
