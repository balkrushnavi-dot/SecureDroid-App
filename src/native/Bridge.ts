import { registerPlugin } from '@capacitor/core';
import type { SecureDroidPlugin } from '../services/native/SecureDroidPlugin';

const SecureDroid = registerPlugin<SecureDroidPlugin>('SecureDroid');

export const SecurityBridge = {
    getInstalledApps: async () => {
        try {
            const result = await SecureDroid.getInstalledApps();
            return (result as any).apps || [];
        } catch (error) {
            console.error('Failed to get apps:', error);
            return [];
        }
    },

    startVPN: async () => {
        try {
            await SecureDroid.startVpn();
            return true;
        } catch (error) {
            console.error('Failed to start VPN:', error);
            return false;
        }
    },

    stopVPN: async () => {
        try {
            await SecureDroid.stopVpn();
            return true;
        } catch (error) {
            console.error('Failed to stop VPN:', error);
            return false;
        }
    },

    scanForRisks: async () => {
        try {
            const result = await SecureDroid.scanForRisks();
            return (result as any).riskDetails || [];
        } catch (error) {
            console.error('Failed to scan:', error);
            return [];
        }
    },

    checkConnection: async () => {
        try {
            const result = await SecureDroid.checkConnection();
            return result;
        } catch (error) {
            console.error('Plugin not connected:', error);
            return { connected: false };
        }
    }
};
