import React from 'react';
import {
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    HelpCircle,
    Shield,
    Lock,
    Wifi,
    Smartphone,
    Database,
    Server,
    Globe,
    Users,
    Activity,
    Clock,
    Bell,
    Settings,
    Moon,
    Sun,
    Info,
    Search,
    Plus,
    Minus,
    Trash2,
    RefreshCw,
} from 'lucide-react';

interface SecureDroidTopBarProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    isLight?: boolean;
}

export const SecureDroidTopBar: React.FC<SecureDroidTopBarProps> = ({
    title,
    subtitle,
    onBack,
    rightAction,
    isLight = false,
}) => {
    return (
        <header
            className={`sticky top-0 z-30 px-4 py-3 border-b transition-colors flex items-center justify-between backdrop-blur-xl ${
                isLight
                    ? 'bg-white/90 border-zinc-200/60 text-zinc-900'
                    : 'bg-slate-950/90 border-slate-800/60 text-zinc-100'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                {onBack && (
                    <button
                        onClick={onBack}
                        className={`p-1.5 -ml-1.5 rounded-lg transition-colors ${
                            isLight
                                ? 'hover:bg-zinc-200/70 text-zinc-600 active:bg-zinc-300/70'
                                : 'hover:bg-slate-800/70 text-slate-400 active:bg-slate-700/70'
                        }`}
                        aria-label="Navigate back"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                )}
                <div className="truncate">
                    <h1 className="text-base font-semibold tracking-tight truncate leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={`text-xs font-normal truncate ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {rightAction && <div className="flex items-center gap-2 shrink-0">{rightAction}</div>}
        </header>
    );
};

interface SecureDroidSectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    isLight?: boolean;
}

export const SecureDroidSectionHeader: React.FC<SecureDroidSectionHeaderProps> = ({
    title,
    subtitle,
    action,
    isLight = false,
}) => {
    return (
        <div className="flex items-center justify-between px-0.5 pt-5 pb-2">
            <div>
                <h2 className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {title}
                </h2>
                {subtitle && <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

interface SecureDroidCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    isLight?: boolean;
    highlight?: boolean;
    noPadding?: boolean;
}

export const SecureDroidCard: React.FC<SecureDroidCardProps> = ({
    children,
    className = '',
    onClick,
    isLight = false,
    highlight = false,
    noPadding = false,
}) => {
    const base = isLight
        ? 'bg-white/90 border-zinc-200/80 text-zinc-900 shadow-sm'
        : 'bg-slate-900/80 border-slate-800/80 text-zinc-100';
    const interactive =
        onClick &&
        (isLight
            ? 'cursor-pointer hover:bg-zinc-50/90 active:scale-[0.99] transition-all duration-150'
            : 'cursor-pointer hover:bg-slate-800/80 active:scale-[0.99] transition-all duration-150');
    const high = highlight
        ? isLight
            ? 'border-zinc-300/80 ring-1 ring-zinc-300/40'
            : 'border-slate-700/80 ring-1 ring-slate-700/40'
        : '';
    const padding = noPadding ? '' : 'p-4';

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border ${padding} transition-all duration-150 ${base} ${interactive} ${high} ${className}`}
        >
            {children}
        </div>
    );
};

interface SecureDroidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLight?: boolean;
    icon?: React.ElementType;
    fullWidth?: boolean;
}

export const SecureDroidButton: React.FC<SecureDroidButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLight = false,
    icon: Icon,
    className = '',
    disabled,
    fullWidth = false,
    ...props
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]',
        md: 'px-4 py-2 text-sm rounded-xl gap-2 font-medium min-h-[44px]',
        lg: 'px-6 py-3 text-base rounded-xl gap-2 font-semibold min-h-[52px]',
    }[size];

    let variantClass = '';
    if (variant === 'primary') {
        variantClass = isLight
            ? 'bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white font-medium shadow-sm'
            : 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-medium shadow-lg shadow-sky-500/20';
    } else if (variant === 'success') {
        variantClass = 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/20';
    } else if (variant === 'secondary') {
        variantClass = isLight
            ? 'bg-zinc-100/80 hover:bg-zinc-200/80 active:bg-zinc-300/80 text-zinc-800 border border-zinc-300/60'
            : 'bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600/80 text-zinc-200 border border-slate-700/60';
    } else if (variant === 'danger') {
        variantClass = 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-medium shadow-lg shadow-rose-500/20';
    } else {
        variantClass = isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-slate-800 text-slate-300';
    }

    const width = fullWidth ? 'w-full' : '';

    return (
        <button
            disabled={disabled}
            className={`inline-flex items-center justify-center transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClass} ${width} ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{children}</span>
        </button>
    );
};

interface SecureDroidStatusChipProps {
    status: 'SECURE' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' | 'CONNECTED' | 'DISCONNECTED' | 'PROTECTED';
    label?: string;
    isLight?: boolean;
    size?: 'sm' | 'md';
}

export const SecureDroidStatusChip: React.FC<SecureDroidStatusChipProps> = ({
    status,
    label,
    isLight = false,
    size = 'sm',
}) => {
    const configs = {
        SECURE: { icon: CheckCircle2, color: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' },
        PROTECTED: { icon: Shield, color: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' },
        CONNECTED: { icon: CheckCircle2, color: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' },
        WARNING: { icon: AlertTriangle, color: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/40 text-amber-300 border-amber-800/60' },
        CRITICAL: { icon: XCircle, color: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/40 text-rose-300 border-rose-800/60' },
        DISCONNECTED: { icon: XCircle, color: isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/40 text-rose-300 border-rose-800/60' },
        UNKNOWN: { icon: HelpCircle, color: isLight ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-slate-800/60 text-slate-400 border-slate-700' },
    };

    const config = configs[status] || configs.UNKNOWN;
    const Icon = config.icon;
    const displayLabel = label || status.charAt(0) + status.slice(1).toLowerCase();
    const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs font-medium';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${config.color} select-none whitespace-nowrap`}>
            <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            <span>{displayLabel}</span>
        </span>
    );
};

interface SecureDroidBadgeProps {
    count: number;
    isLight?: boolean;
    max?: number;
}

export const SecureDroidBadge: React.FC<SecureDroidBadgeProps> = ({
    count,
    isLight = false,
    max = 99,
}) => {
    const display = count > max ? `${max}+` : count;
    if (count === 0) return null;
    return (
        <span
            className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full ${
                isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-900'
            }`}
        >
            {display}
        </span>
    );
};

interface SecureDroidProgressRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    isLight?: boolean;
    children?: React.ReactNode;
    color?: 'emerald' | 'amber' | 'rose' | 'sky';
}

export const SecureDroidProgressRing: React.FC<SecureDroidProgressRingProps> = ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    label,
    isLight = false,
    children,
    color = 'sky',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const offset = circumference - (percentage / 100) * circumference;

    const colorMap = {
        emerald: '#22C55E',
        amber: '#F59E0B',
        rose: '#EF4444',
        sky: '#3B82F6',
    };

    const strokeColor = colorMap[color] || colorMap.sky;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isLight ? '#E5E7EB' : '#1E293B'}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children || <span className="text-2xl font-bold text-zinc-100">{Math.round(percentage)}</span>}
            </div>
            {label && (
                <span className="absolute -bottom-6 text-[10px] text-slate-400">{label}</span>
            )}
        </div>
    );
};

interface SecureDroidSearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    isLight?: boolean;
    onClear?: () => void;
    className?: string;
}

export const SecureDroidSearchBar: React.FC<SecureDroidSearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    isLight = false,
    onClear,
    className = '',
}) => {
    return (
        <div
            className={`flex items-center px-4 py-2.5 rounded-xl border transition-colors ${
                isLight
                    ? 'bg-white border-zinc-200 text-zinc-900 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-400/20'
                    : 'bg-slate-900 border-slate-800 text-zinc-100 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
            } ${className}`}
        >
            <Search className={`w-4 h-4 mr-2.5 shrink-0 ${isLight ? 'text-zinc-400' : 'text-slate-500'}`} />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none ${
                    isLight ? 'text-zinc-900' : 'text-zinc-100'
                }`}
            />
            {value && onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className={`p-1 rounded-full transition-colors ${
                        isLight ? 'hover:bg-zinc-100 text-zinc-400' : 'hover:bg-slate-800 text-slate-500'
                    }`}
                >
                    <XCircle className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

interface SecureDroidSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    isLight?: boolean;
    label?: string;
}

export const SecureDroidSwitch: React.FC<SecureDroidSwitchProps> = ({
    checked,
    onChange,
    disabled = false,
    isLight = false,
    label,
}) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label || 'Toggle switch'}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onChange(!checked);
            }}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                disabled
                    ? 'opacity-40 cursor-not-allowed bg-zinc-400'
                    : checked
                    ? 'bg-sky-500'
                    : isLight
                    ? 'bg-zinc-300'
                    : 'bg-slate-700'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
};

interface SecureDroidStatCardProps {
    label: string;
    value: string | number;
    icon?: React.ElementType;
    color?: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';
    isLight?: boolean;
}

export const SecureDroidStatCard: React.FC<SecureDroidStatCardProps> = ({
    label,
    value,
    icon: Icon,
    color = 'slate',
    isLight = false,
}) => {
    const colorMap = {
        emerald: isLight ? 'text-emerald-600' : 'text-emerald-400',
        amber: isLight ? 'text-amber-600' : 'text-amber-400',
        rose: isLight ? 'text-rose-600' : 'text-rose-400',
        sky: isLight ? 'text-sky-600' : 'text-sky-400',
        slate: isLight ? 'text-zinc-600' : 'text-slate-400',
    };

    return (
        <div
            className={`p-3 rounded-xl border text-center transition-all ${
                isLight
                    ? 'bg-white border-zinc-200/80'
                    : 'bg-slate-900/80 border-slate-800/80'
            }`}
        >
            {Icon && <Icon className={`w-4 h-4 mx-auto mb-1 ${colorMap[color]}`} />}
            <div className={`text-xl font-bold ${colorMap[color]}`}>{value}</div>
            <div className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-slate-500'}`}>
                {label}
            </div>
        </div>
    );
};

interface SecureDroidSkeletonProps {
    className?: string;
    isLight?: boolean;
}

export const SecureDroidSkeleton: React.FC<SecureDroidSkeletonProps> = ({
    className = '',
    isLight = false,
}) => {
    return (
        <div
            className={`animate-pulse rounded-xl ${isLight ? 'bg-zinc-200' : 'bg-slate-800'} ${className}`}
        />
    );
};

interface SecureDroidEmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
    isLight?: boolean;
}

export const SecureDroidEmptyState: React.FC<SecureDroidEmptyStateProps> = ({
    title,
    description,
    icon: Icon = Info,
    action,
    isLight = false,
}) => {
    return (
        <div className="p-8 text-center">
            <Icon className={`w-12 h-12 mx-auto mb-3 ${isLight ? 'text-zinc-300' : 'text-slate-700'}`} />
            <p className={`text-sm font-medium ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{title}</p>
            {description && (
                <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-slate-500'}`}>{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export const SecureDroidGlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`glass-dark rounded-2xl border border-slate-800/60 p-4 ${className}`}>
            {children}
        </div>
    );
};
