import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SecurityBridge } from '../native/Bridge';

export const HomeScreen = () => {
    const [score, setScore] = useState(0);
    const [apps, setApps] = useState([]);
    const [vpnActive, setVpnActive] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const installedApps = await SecurityBridge.getInstalledApps();
        setApps(installedApps);
        calculateScore(installedApps);
    };

    const calculateScore = (apps) => {
        // Calculate based on installed apps
        const riskyApps = apps.filter(a => a.permissions?.length > 10);
        const score = Math.max(0, 100 - (riskyApps.length * 5));
        setScore(score);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Security Score */}
            <View style={styles.scoreCard}>
                <Text style={styles.scoreText}>{score}</Text>
                <Text style={styles.scoreLabel}>Security Score</Text>
                <View style={styles.statusIndicator}>
                    <Text style={score > 70 ? styles.safe : styles.warning}>
                        {score > 70 ? '🟢 Protected' : '⚠️ Needs Attention'}
                    </Text>
                </View>
            </View>

            {/* Protection Status */}
            <View style={styles.protectionGrid}>
                <TouchableOpacity 
                    style={styles.protectionItem}
                    onPress={() => SecurityBridge.startVPN()}
                >
                    <Text>🔒 VPN</Text>
                    <Text>{vpnActive ? 'Active' : 'Inactive'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.protectionItem}>
                    <Text>🛡️ DNS</Text>
                    <Text>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.protectionItem}>
                    <Text>📱 Apps</Text>
                    <Text>{apps.length} installed</Text>
                </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text>🔍 Scan Device</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text>🔐 Privacy Radar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    scoreCard: { 
        backgroundColor: '#1a1a2e', 
        borderRadius: 16, 
        padding: 24,
        alignItems: 'center',
        marginBottom: 16 
    },
    scoreText: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50' },
    scoreLabel: { fontSize: 18, color: '#888' },
    statusIndicator: { marginTop: 8 },
    safe: { color: '#4CAF50', fontSize: 16 },
    warning: { color: '#FF9800', fontSize: 16 },
    protectionGrid: { 
        flexDirection: 'row', 
        justifyContent: 'space-around',
        marginBottom: 16 
    },
    protectionItem: { 
        backgroundColor: '#16213e', 
        padding: 12, 
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        margin: 4 
    },
    actions: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    actionButton: { 
        backgroundColor: '#0f3460', 
        padding: 14, 
        borderRadius: 12,
        flex: 1,
        margin: 4,
        alignItems: 'center' 
    }
});
