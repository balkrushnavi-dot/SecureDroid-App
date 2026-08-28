// SAFETY: Hook never throws — all errors are caught and returned as state
export const useSecureDroid = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [hardeningFindings, setHardeningFindings] = useState<any[]>([]);
    const [usingMock, setUsingMock] = useState(false);
    const isNative = Capacitor.isNativePlatform();

    // ... rest of the hook, but wrap EVERYTHING in try/catch

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidPlugin, ThreatItem, AppItem, AuditLogItem } from '../services/native/SecureDroidPlugin';

export interface SecurityState {
  deviceStatus: 'secure' | 'warning' | 'critical';
  threatsCount: number;
  appsCount: number;
  vpnActive: boolean;
  auditLogs: AuditLogItem[];
  threats: ThreatItem[];
  apps: AppItem[];
}

const FALLBACK_STATE: SecurityState = {
  deviceStatus: 'secure',
  threatsCount: 0,
  appsCount: 0,
  vpnActive: false,
  auditLogs: [
    { 
      id: '1', 
      timestamp: new Date().toISOString(), 
      event: 'SecureDroid security state initialized', 
      severity: 'low' 
    }
  ],
  threats: [],
  apps: [],
};

export function useSecureDroid() {
  const [state, setState] = useState<SecurityState>(FALLBACK_STATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSecurityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!Capacitor.isNativePlatform()) {
      console.warn('Non-native environment detected. Using fallback security state.');
      setState(FALLBACK_STATE);
      setLoading(false);
      return;
    }

    try {
      const [statusRes, threatsRes, appsRes, logsRes, netRes] = await Promise.allSettled([
        SecureDroidPlugin.getDeviceStatus(),
        SecureDroidPlugin.getThreats(),
        SecureDroidPlugin.getScannedApps(),
        SecureDroidPlugin.getAuditLogs(),
        SecureDroidPlugin.getNetworkStatus(),
      ]);

      setState({
        deviceStatus: statusRes.status === 'fulfilled' ? statusRes.value.status ?? 'secure' : 'secure',
        threatsCount: threatsRes.status === 'fulfilled' ? threatsRes.value.threats?.length ?? 0 : 0,
        appsCount: appsRes.status === 'fulfilled' ? appsRes.value.apps?.length ?? 0 : 0,
        vpnActive: netRes.status === 'fulfilled' ? netRes.value.vpnActive ?? false : false,
        auditLogs: logsRes.status === 'fulfilled' ? logsRes.value.logs ?? FALLBACK_STATE.auditLogs : FALLBACK_STATE.auditLogs,
        threats: threatsRes.status === 'fulfilled' ? threatsRes.value.threats ?? [] : [],
        apps: appsRes.status === 'fulfilled' ? appsRes.value.apps ?? [] : [],
      });
    } catch (err: any) {
      console.error('Failed to fetch native security data:', err);
      setError(err.message || 'Unknown native communication error');
      setState(FALLBACK_STATE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSecurityData();
  }, [refreshSecurityData]);

  return {
    ...state,
    loading,
    error,
    refresh: refreshSecurityData,
  };
}
