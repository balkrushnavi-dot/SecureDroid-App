import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Mock data for fallback
const MOCK_APPS = [/* ... your mock apps ... */];
const MOCK_RISKS = [/* ... your mock risks ... */];

export const useSecureDroid = () => {
  // Initialize state with mock data to guarantee a valid state on first render
  const [state, setState] = useState({
    apps: MOCK_APPS,
    risks: MOCK_RISKS,
    loading: false,
    connected: false,
    error: null,
    score: 0,
    hardeningFindings: [],
    usingMock: true,
  });

  const loadData = useCallback(async () => {
    // Update state to loading, preserving mock data as a fallback
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const isNative = Capacitor.isNativePlatform();
      if (!isNative) {
        setState(prev => ({ ...prev, loading: false, connected: true, usingMock: true }));
        return;
      }

      // Safely import the native module
      const { SecureDroidNative } = await import('../services/native/SecureDroidNative');
      const connResult = await SecureDroidNative.checkConnection();

      if (!connResult.success) {
        setState(prev => ({ ...prev, loading: false, error: 'Bridge unavailable.', usingMock: true }));
        return;
      }

      // ... fetch apps, risks, and hardening report ...
      // On any error in this block, fall back to mock data.
      // Update state with real data or keep mock data as fallback.

    } catch (error) {
      console.error('Failed to load data:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load real data. Using mock data.', usingMock: true }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    reload: loadData,
  };
};
