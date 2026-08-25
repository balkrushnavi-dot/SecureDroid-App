import { NativeModules, Platform } from 'react-native';

const { SecureDroidModule } = NativeModules;

export const SecurityBridge = {
    getInstalledApps: async () => {
        if (Platform.OS === 'android') {
            return await SecureDroidModule.getInstalledApps();
        }
        return [];
    },
    
    startVPN: async () => {
        if (Platform.OS === 'android') {
            return await SecureDroidModule.startVPN();
        }
    },
    
    stopVPN: async () => {
        if (Platform.OS === 'android') {
            return await SecureDroidModule.stopVPN();
        }
    }
};
