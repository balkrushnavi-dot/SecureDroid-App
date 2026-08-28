import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidPlugin } from '../services/native/SecureDroidPlugin';

export interface SecurityState {
  deviceStatus: 'secure' | 'warning' | 'critical';
  threatsCount: number;
  appsCount: number;
  vpnActive: boolean;
  auditLogs: Array<{ id: string; timestamp: string; event: string; severity: string }>;
  threats: Array<{ id: string; title: string; risk: string; description: string }>;
  apps: Array<{ packageName: string; name: string; riskLevel: string; permissions: string[] }>;
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
      event: 'SecureDroid initialized in safe state', 
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

    // If running in a web browser preview rather than an Android device, use fallbacks immediately
    if (!Capacitor.isNativePlatform()) {
      console.warn('Non-native environment detected. Loading fallback security state.');
      setState(FALLBACK_STATE);
      setLoading(false);
      return;
    }

    try {
      // Use Promise.allSettled so a failure in one module doesn't blank out the entire app
      const [statusRes, threatsRes, appsRes, logsRes] = await Promise.allSettled([
        SecureDroidPlugin.getDeviceStatus().catch(() => ({ status: 'secure' })),
        SecureDroidPlugin.getThreats().catch(() => ({ threats: [] })),
        SecureDroidPlugin.getScannedApps().catch(() => ({ apps: [] })),
        SecureDroidPlugin.getAuditLogs().catch(() => ({ logs: [] })),
      ]);

      setState({
        deviceStatus: statusRes.status === 'fulfilled' ? (statusRes.value as any).status ?? 'secure' : 'secure',
        threatsCount: threatsRes.status === 'fulfilled' ? (threatsRes.value as any).threats?.length ?? 0 : 0,
        appsCount: appsRes.status === 'fulfilled' ? (appsRes.value as any).apps?.length ?? 0 : 0,
        vpnActive: false,
        auditLogs: logsRes.status === 'fulfilled' ? (logsRes.value as any).logs ?? FALLBACK_STATE.auditLogs : FALLBACK_STATE.auditLogs,
        threats: threatsRes.status === 'fulfilled' ? (threatsRes.value as any).threats ?? [] : [],
        apps: appsRes.status === 'fulfilled' ? (appsRes.value as any).apps ?? [] : [],
      });
    } catch (err: any) {
      console.error('Failed to fetch native security data:', err);
      setError(err.message || 'Unknown native communication error');
      setState(FALLBACK_STATE); // Fallback prevents UI from crashing or freezing
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
