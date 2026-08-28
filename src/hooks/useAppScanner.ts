import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeInstalledApp } from '../types/native';

export type AppItem = NativeInstalledApp;

export function useAppScanner() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const scanApps = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!Capacitor.isNativePlatform()) {
      setApps([]);
      setLoading(false);
      return;
    }

    try {
      const result = await SecureDroidNative.getInstalledApps();
      if (result.success && result.data) {
        setApps(result.data);
      } else {
        setApps([]);
        if (!result.success) {
          setError(result.message || 'Failed to scan installed apps');
        }
      }
    } catch (err: any) {
      console.error('App scanning failed:', err);
      setError(err.message || 'Failed to scan installed apps');
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scanApps();
  }, [scanApps]);

  return {
    apps,
    loading,
    error,
    rescan: scanApps,
  };
}

