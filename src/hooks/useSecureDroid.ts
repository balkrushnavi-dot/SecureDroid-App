import { useState, useEffect, useCallback } from 'react';
import { secureDroid, AppInfo, RiskInfo } from '../capacitor/secureDroid';

export const useSecureDroid = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Check connection
            const connection = await secureDroid.checkConnection();
            console.log('Plugin connection:', connection);
            setConnected(connection.connected);

            if (!connection.connected) {
                setError('Plugin not connected. Please ensure you are running on Android.');
                setLoading(false);
                return;
            }

            // Load apps
            const installedApps = await secureDroid.getInstalledApps();
            setApps(installedApps);

            // Scan risks
            const riskyApps = await secureDroid.scanForRisks();
            setRisks(riskyApps);

            // Calculate score
            const newScore = Math.max(0, 100 - (riskyApps.length * 3));
            setScore(newScore);

        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load security data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        apps,
        risks,
        loading,
        connected,
        error,
        score,
        reload: loadData
    };
};
