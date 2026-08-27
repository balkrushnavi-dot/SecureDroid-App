import React, { useState } from 'react';
import {
    Eye,
    EyeOff,
    Camera,
    Mic,
    MapPin,
    Users,
    MessageSquare,
    Phone,
    Image,
    FileText,
    Calendar,
    Clock,
    Shield,
    ShieldCheck,
    ShieldOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Search,
    Filter,
    RefreshCw,
    Activity,
    Wifi,
    Bluetooth,
    Database,
    Server,
    Smartphone,
    Lock,
    Unlock,
    Info
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
    SecureDroidSearchBar
} from './ui/designSystem';

interface PrivacyRadarScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface PermissionUsage {
    id: string;
    appName: string;
    packageName: string;
    permission: string;
    permissionIcon: React.ElementType;
    lastUsed: string;
    usageCount: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    isSystemApp: boolean;
}

export const PrivacyRadarScreen: React.FC<PrivacyRadarScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');

    // Mock data for UI demonstration
    const permissionUsageData: PermissionUsage[] = [
        {
            id: '1',
            appName: 'Google Maps',
            packageName: 'com.google.android.apps.maps',
            permission: 'Location',
            permissionIcon: MapPin,
            lastUsed: '2 min ago',
            usageCount: 47,
            riskLevel: 'HIGH',
            isSystemApp: true
        },
        {
            id: '2',
            appName: 'WhatsApp',
            packageName: 'com.whatsapp',
            permission: 'Camera',
            permissionIcon: Camera,
            lastUsed: '15 min ago',
            usageCount: 12,
            riskLevel: 'HIGH',
            isSystemApp: false
        },
        {
            id: '3',
            appName: 'Google Photos',
            packageName: 'com.google.android.apps.photos',
            permission: 'Storage',
            permissionIcon: Image,
            lastUsed: '1
