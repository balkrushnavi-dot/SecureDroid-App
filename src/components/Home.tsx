import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Capacitor } from '@capacitor/core';

// Import your plugin
const SecureDroid = Capacitor.Plugins.SecureDroid;

// Interface for app data
interface AppInfo {
    packageName: string;
    appName: string;
    versionName: string;
    versionCode: number;
    isSystemApp: boolean;
    installTime: number;
    updateTime: number;
    installSource: string;
    permissions: string[];
}

interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    reason: string;
    installSource: string;
    isSystemApp?: boolean;
}

export const HomeScreen: React.FC = () => {
    const [score, setScore] = useState(100);
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [riskyApps, setRiskyApps] = useState<RiskInfo[]>([]);
    const [vpnActive, setVpnActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pluginConnected, setPluginConnected] = useState(false);

    useEffect(() => {
        checkPluginConnection();
        loadData();
    }, []);

    // Check if the plugin is available
    const checkPluginConnection = async () => {
        try {
            const result = await SecureDroid.checkConnection();
            console.log('Plugin connection:', result);
            setPluginConnected(true);
        } catch (error) {
            console.error('Plugin not available:', error);
            setPluginConnected(false);
            Alert.alert(
                'Plugin Error',
                'The SecureDroid plugin is not available. Please restart the app.'
            );
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // Get installed apps
            const result = await SecureDroid.getInstalledApps();
            console.log('Apps result:', result);
            
            if (result && (result as any).apps) {
                const appList = (result as any).apps;
                setApps(appList);
            }

            // Get risk scan
            const riskResult = await SecureDroid.scanForRisks();
            console.log('Risk result:', riskResult);
            
            if (riskResult && (riskResult as any).riskDetails) {
                const allRiskDetails = (riskResult as any).riskDetails;
                
                // Filter out system apps from risks
                // Cross-reference with apps list to check isSystemApp
                const userAppPackageNames = new Set(
                    apps
                        .filter(app => !app.isSystemApp)
                        .map(app => app.packageName)
                );
                
                const userAppRisks = allRiskDetails.filter((risk: RiskInfo) => {
                    // If the risk data has an isSystemApp flag, use it
                    if (risk.isSystemApp === true) {
                        return false;
                    }
                    // Otherwise cross-reference with the apps list
                    return userAppPackageNames.has(risk.packageName);
                });
                
                setRiskyApps(userAppRisks);
                
                // Calculate score based ONLY on user app risks
                const highRiskCount = userAppRisks.filter(
                    (r: RiskInfo) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL'
                ).length;
                
                const mediumRiskCount = userAppRisks.filter(
                    (r: RiskInfo) => r.riskLevel === 'MEDIUM'
                ).length;
                
                const lowRiskCount = userAppRisks.filter(
                    (r: RiskInfo) => r.riskLevel === 'LOW'
                ).length;
                
                const penalty = (highRiskCount * 8) + (mediumRiskCount * 3) + (lowRiskCount * 1);
                const calculatedScore = Math.max(0, Math.min(100, 100 - penalty));
                setScore(calculatedScore);
            }

        } catch (error) {
            console.error('Failed to load data:', error);
            Alert.alert('Error', 'Failed to load security data');
        } finally {
            setLoading(false);
        }
    };

    const startVPN = async () => {
        try {
            await SecureDroid.startVpn();
            setVpnActive(true);
            Alert.alert('Success', 'VPN started successfully');
        } catch (error) {
            console.error('Failed to start VPN:', error);
            Alert.alert('Error', 'Failed to start VPN. Please check permissions.');
        }
    };

    const stopVPN = async () => {
        try {
            await SecureDroid.stopVpn();
            setVpnActive(false);
            Alert.alert('Success', 'VPN stopped');
        } catch (error) {
            console.error('Failed to stop VPN:', error);
        }
    };

    const toggleVPN = () => {
        if (vpnActive) {
            stopVPN();
        } else {
            startVPN();
        }
    };

    // Count high and medium risks for display
    const highRiskCount = riskyApps.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
    const mediumRiskCount = riskyApps.filter(r => r.riskLevel === 'MEDIUM').length;

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading security data...</Text>
            </View>
        );
    }

    if (!pluginConnected) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Plugin Not Available</Text>
                <Text style={styles.errorText}>
                    The SecureDroid plugin is not responding. 
                    Please restart the app or reinstall.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={checkPluginConnection}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Connection Status */}
            <View style={styles.connectionStatus}>
                <Text style={styles.connectionText}>
                    {pluginConnected ? '✅ Plugin Connected' : '❌ Plugin Disconnected'}
                </Text>
            </View>

            {/* Security Score */}
            <View style={styles.scoreCard}>
                <Text style={styles.scoreText}>{score}</Text>
                <Text style={styles.scoreLabel}>Security Score</Text>
                <View style={styles.statusIndicator}>
                    <Text style={score >= 70 ? styles.safe : styles.warning}>
                        {score >= 70 ? '🟢 Protected' : '⚠️ Needs Attention'}
                    </Text>
                </View>
            </View>

            {/* Protection Status */}
            <View style={styles.protectionGrid}>
                <TouchableOpacity 
                    style={[styles.protectionItem, vpnActive && styles.activeProtection]}
                    onPress={toggleVPN}
                >
                    <Text style={styles.protectionIcon}>🔒</Text>
                    <Text style={styles.protectionLabel}>VPN</Text>
                    <Text style={vpnActive ? styles.activeText : styles.inactiveText}>
                        {vpnActive ? 'Active' : 'Inactive'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.protectionItem}>
                    <Text style={styles.protectionIcon}>🛡️</Text>
                    <Text style={styles.protectionLabel}>DNS</Text>
                    <Text style={styles.activeText}>Active</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.protectionItem}>
                    <Text style={styles.protectionIcon}>📱</Text>
                    <Text style={styles.protectionLabel}>Apps</Text>
                    <Text style={styles.activeText}>{apps.length} installed</Text>
                </TouchableOpacity>
            </View>

            {/* Risky Apps Alert - Only show if there are risky user apps */}
            {riskyApps.length > 0 && (
                <View style={styles.riskAlert}>
                    <Text style={styles.riskAlertTitle}>
                        ⚠️ {riskyApps.length} Risky User App{riskyApps.length > 1 ? 's' : ''} Found
                    </Text>
                    <Text style={styles.riskSubtitle}>
                        {highRiskCount > 0 ? `🔴 ${highRiskCount} high risk, ` : ''}
                        {mediumRiskCount > 0 ? `🟡 ${mediumRiskCount} medium risk` : ''}
                        {highRiskCount === 0 && mediumRiskCount === 0 ? '🟢 Low risk apps' : ''}
                    </Text>
                    {riskyApps.slice(0, 3).map((app, index) => (
                        <View key={index} style={styles.riskItem}>
                            <Text style={styles.riskAppName}>{app.appName}</Text>
                            <Text style={styles.riskReason}>{app.reason}</Text>
                            <Text style={[
                                styles.riskLevel,
                                app.riskLevel === 'HIGH' || app.riskLevel === 'CRITICAL' 
                                    ? styles.riskHigh 
                                    : app.riskLevel === 'MEDIUM' 
                                    ? styles.riskMedium 
                                    : styles.riskLow
                            ]}>
                                {app.riskLevel}
                            </Text>
                        </View>
                    ))}
                    {riskyApps.length > 3 && (
                        <Text style={styles.moreRisks}>+ {riskyApps.length - 3} more</Text>
                    )}
                </View>
            )}

            {/* No Risks Found */}
            {riskyApps.length === 0 && (
                <View style={styles.safeAlert}>
                    <Text style={styles.safeAlertTitle}>✅ No Risky Apps Found</Text>
                    <Text style={styles.safeAlertText}>
                        All user-installed apps appear to have normal permission footprints.
                    </Text>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={loadData}>
                    <Text style={styles.actionButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>🔐 Privacy Radar</Text>
                </TouchableOpacity>
            </View>

            {/* Debug Info */}
            <View style={styles.debugInfo}>
                <Text style={styles.debugText}>Apps loaded: {apps.length}</Text>
                <Text style={styles.debugText}>User apps: {apps.filter(a => !a.isSystemApp).length}</Text>
                <Text style={styles.debugText}>Risky user apps: {riskyApps.length}</Text>
                <Text style={styles.debugText}>Plugin: {pluginConnected ? 'Connected' : 'Disconnected'}</Text>
                <Text style={styles.debugText}>Score: {score}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#0a0a1a',
        padding: 16 
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#888',
        marginTop: 12,
        fontSize: 16,
    },
    connectionStatus: {
        backgroundColor: '#1a1a2e',
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    connectionText: {
        color: '#4CAF50',
        fontSize: 14,
    },
    scoreCard: { 
        backgroundColor: '#1a1a2e', 
        borderRadius: 16, 
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a3e',
    },
    scoreText: { 
        fontSize: 48, 
        fontWeight: 'bold', 
        color: '#4CAF50',
        fontFamily: 'monospace',
    },
    scoreLabel: { 
        fontSize: 18, 
        color: '#888',
        marginTop: 4,
    },
    statusIndicator: { 
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#1a2a1a',
    },
    safe: { 
        color: '#4CAF50', 
        fontSize: 16,
        fontWeight: '600',
    },
    warning: { 
        color: '#FF9800', 
        fontSize: 16,
        fontWeight: '600',
    },
    protectionGrid: { 
        flexDirection: 'row', 
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    protectionItem: { 
        backgroundColor: '#16213e', 
        padding: 12, 
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        margin: 4,
        borderWidth: 1,
        borderColor: '#1a2a3a',
    },
    activeProtection: {
        borderColor: '#4CAF50',
        backgroundColor: '#1a2a1a',
    },
    protectionIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    protectionLabel: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 2,
    },
    activeText: {
        color: '#4CAF50',
        fontSize: 11,
        fontWeight: '600',
    },
    inactiveText: {
        color: '#ff6b6b',
        fontSize: 11,
        fontWeight: '600',
    },
    riskAlert: {
        backgroundColor: '#2a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ff6b6b33',
    },
    riskAlertTitle: {
        color: '#ff6b6b',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    riskSubtitle: {
        color: '#888',
        fontSize: 13,
        marginBottom: 8,
    },
    riskItem: {
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    riskAppName: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    riskReason: {
        color: '#888',
        fontSize: 12,
        flex: 1,
        marginLeft: 8,
    },
    riskLevel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    riskHigh: {
        color: '#ff6b6b',
    },
    riskMedium: {
        color: '#ffa94d',
    },
    riskLow: {
        color: '#4CAF50',
    },
    moreRisks: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    safeAlert: {
        backgroundColor: '#1a2a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#4CAF5033',
    },
    safeAlertTitle: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    safeAlertText: {
        color: '#888',
        fontSize: 13,
    },
    actions: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionButton: { 
        backgroundColor: '#0f3460', 
        padding: 14, 
        borderRadius: 12,
        flex: 1,
        margin: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1a4a7a',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    debugInfo: {
        backgroundColor: '#0a0a1a',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#1a1a2a',
    },
    debugText: {
        color: '#444',
        fontSize: 11,
        fontFamily: 'monospace',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        color: '#ff6b6b',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    errorText: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 32,
    },
    retryButton: {
        backgroundColor: '#0f3460',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
