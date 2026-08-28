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
} from 'lucide-react';
import {
    QualitativeSecurityTier,
    HostSecurityStatus,
    SystemLayer,
    PlatformRequirementTag,
} from '../../types/securedroid';

// -------------------------------------------------------------
// 1. Top Bar / App Header
// -------------------------------------------------------------
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
            className={`sticky top-0 z-30 px-4 py-3 border-b transition-colors flex items-center justify-between backdrop-blur-lg ${
                isLight
                    ? 'bg-white/80 border-zinc-200/60 text-zinc-900'
                    : 'bg-slate-950/80 border-slate-800/60 text-zinc-100'
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
                        <p
                            className={`text-xs font-normal truncate ${
                                isLight ? 'text-zinc-500' : 'text-slate-400'
                            }`}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {rightAction && (
                <div className="flex items-center gap-2 shrink-0">{rightAction}</div>
            )}
        </header>
    );
};

// -------------------------------------------------------------
// 2. Section Header
// -------------------------------------------------------------
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
                <h2
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                        isLight ? 'text-zinc-500' : 'text-slate-400'
                    }`}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

// -------------------------------------------------------------
// 3. Card
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 4. List Item
// -------------------------------------------------------------
interface SecureDroidListItemProps {
    icon?: React.ElementType | React.ReactNode;
    iconBgColor?: string;
    title: string;
    subtitle?: string;
    value?: string | React.ReactNode;
    onClick?: () => void;
    showChevron?: boolean;
    isLight?: boolean;
    className?: string;
    disabled?: boolean;
    compact?: boolean;
}

export const SecureDroidListItem: React.FC<SecureDroidListItemProps> = ({
    icon: Icon,
    iconBgColor,
    title,
    subtitle,
    value,
    onClick,
    showChevron = true,
    isLight = false,
    className = '',
    disabled = false,
    compact = false,
}) => {
    const renderIcon = () => {
        if (!Icon) return null;
        if (React.isValidElement(Icon)) {
            return <div className="shrink-0">{Icon}</div>;
        }
        const IconComponent = Icon as React.ComponentType<{ className?: string }>;
        return (
            <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    iconBgColor ||
                    (isLight
                        ? 'bg-zinc-100 text-zinc-700'
                        : 'bg-slate-800 text-slate-300')
                }`}
            >
                <IconComponent className="w-4 h-4" />
            </div>
        );
    };

    const padding = compact ? 'p-2.5' : 'p-3.5';

    return (
        <div
            onClick={disabled ? undefined : onClick}
            className={`flex items-center justify-between ${padding} rounded-xl transition-colors ${
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : onClick
                    ? isLight
                        ? 'hover:bg-zinc-100/70 active:bg-zinc-200/70 cursor-pointer'
                        : 'hover:bg-slate-800/60 active:bg-slate-700/60 cursor-pointer'
                    : ''
            } ${className}`}
        >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
                {renderIcon()}
                <div className="min-w-0">
                    <p
                        className={`text-sm font-medium leading-snug truncate ${
                            isLight ? 'text-zinc-900' : 'text-zinc-100'
                        }`}
                    >
                        {title}
                    </p>
                    {subtitle && (
                        <p
                            className={`text-xs mt-0.5 leading-normal ${
                                isLight ? 'text-zinc-500' : 'text-slate-400'
                            }`}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {typeof value === 'string' ? (
                    <span
                        className={`text-xs font-medium ${
                            isLight ? 'text-zinc-500' : 'text-slate-400'
                        }`}
                    >
                        {value}
                    </span>
                ) : (
                    value
                )}
                {showChevron && onClick && (
                    <ChevronRight
                        className={`w-4 h-4 ${isLight ? 'text-zinc-400' : 'text-slate-500'}`}
                    />
                )}
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// 5. Switch
// -------------------------------------------------------------
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
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                disabled
                    ? 'opacity-40 cursor-not-allowed bg-zinc-400'
                    : checked
                    ? isLight
                        ? 'bg-zinc-800'
                        : 'bg-zinc-200'
                    : isLight
                    ? 'bg-zinc-300'
                    : 'bg-zinc-700'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${
                    checked
                        ? isLight
                            ? 'translate-x-5 bg-white'
                            : 'translate-x-5 bg-zinc-900'
                        : 'translate-x-0 bg-white'
                }`}
            />
        </button>
    );
};

// -------------------------------------------------------------
// 6. Buttons
// -------------------------------------------------------------
interface SecureDroidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
        md: 'px-4 py-2 text-xs rounded-xl gap-2 font-medium',
        lg: 'px-5 py-2.5 text-sm rounded-xl gap-2 font-medium',
    }[size];

    let variantClass = '';
    if (variant === 'primary') {
        variantClass = isLight
            ? 'bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white font-medium shadow-sm'
            : 'bg-zinc-100 hover:bg-white active:bg-zinc-200 text-zinc-900 font-medium shadow-sm';
    } else if (variant === 'secondary') {
        variantClass = isLight
            ? 'bg-zinc-100/80 hover:bg-zinc-200/80 active:bg-zinc-300/80 text-zinc-800 border border-zinc-300/60'
            : 'bg-slate-800/80 hover:bg-slate-750/80 active:bg-slate-700/80 text-zinc-200 border border-slate-700/60';
    } else if (variant === 'danger') {
        variantClass = 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium';
    } else {
        variantClass = isLight
            ? 'hover:bg-zinc-100 text-zinc-700'
            : 'hover:bg-slate-800 text-slate-300';
    }

    const width = fullWidth ? 'w-full' : '';

    return (
        <button
            disabled={disabled}
            className={`inline-flex items-center justify-center transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClass} ${width} ${className}`}
            {...props}
        >
            {Icon && (React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 shrink-0" />)}
            <span>{children}</span>
        </button>
    );
};

export const SecureDroidPrimaryButton: React.FC<SecureDroidButtonProps> = (props) => (
    <SecureDroidButton variant="primary" {...props} />
);

export const SecureDroidSecondaryButton: React.FC<SecureDroidButtonProps> = (props) => (
    <SecureDroidButton variant="secondary" {...props} />
);

export const SecureDroidIconButton: React.FC<{
    icon: React.ElementType;
    onClick: () => void;
    label: string;
    isLight?: boolean;
    active?: boolean;
    className?: string;
}> = ({ icon: Icon, onClick, label, isLight = false, active = false, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
                active
                    ? isLight
                        ? 'bg-zinc-200 text-zinc-900'
                        : 'bg-slate-800 text-zinc-100'
                    : isLight
                    ? 'hover:bg-zinc-200 text-zinc-600 active:bg-zinc-300'
                    : 'hover:bg-slate-800 text-slate-300 active:bg-slate-700'
            } ${className}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};

// -------------------------------------------------------------
// 7. Status Chip
// -------------------------------------------------------------
interface SecureDroidStatusChipProps {
    status: string;
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
    const norm = (status || '').toUpperCase();
    let color = isLight
        ? 'bg-zinc-100 text-zinc-700 border-zinc-300'
        : 'bg-slate-800/80 text-slate-300 border-slate-700';
    let Icon = HelpCircle;

    if (
        norm === 'PROTECTED' ||
        norm === 'VERIFIED' ||
        norm === 'PASS' ||
        norm === 'HARDWARE_TEE' ||
        norm === 'HARDWARE_STRONGBOX' ||
        norm === 'SECURE' ||
        norm === 'SUPPORTED' ||
        norm === 'AVAILABLE' ||
        norm === 'ACTIVE' ||
        norm === 'CONNECTED' ||
        norm === 'ON' ||
        norm === 'ENABLED' ||
        norm === 'GOOD' ||
        norm === 'SAFE'
    ) {
        color = isLight
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
        Icon = CheckCircle2;
    } else if (
        norm === 'ATTENTION REQUIRED' ||
        norm === 'WARNING' ||
        norm === 'PARTIAL' ||
        norm === 'DEGRADED' ||
        norm === 'CONNECTING' ||
        norm === 'DISCONNECTING' ||
        norm === 'LIMITED' ||
        norm === 'RESTRICTED' ||
        norm === 'MODERATE'
    ) {
        color = isLight
            ? 'bg-amber-50 text-amber-900 border-amber-300'
            : 'bg-amber-950/40 text-amber-200 border-amber-800/60';
        Icon = AlertTriangle;
    } else if (
        norm === 'CRITICAL' ||
        norm === 'UNSUPPORTED' ||
        norm === 'INVALID' ||
        norm === 'UNAVAILABLE' ||
        norm === 'ERROR' ||
        norm === 'FAILED' ||
        norm === 'OFF' ||
        norm === 'DISABLED' ||
        norm === 'DISCONNECTED' ||
        norm === 'UNKNOWN'
    ) {
        color = isLight
            ? 'bg-rose-50 text-rose-900 border-rose-300'
            : 'bg-rose-950/40 text-rose-200 border-rose-800/60';
        Icon = norm === 'OFF' || norm === 'DISABLED' || norm === 'DISCONNECTED' || norm === 'UNKNOWN' ? Shield : XCircle;
    }

    const text = label || status;
    const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs font-medium';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-normal ${padding} ${color} select-none whitespace-nowrap`}
        >
            <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            <span>{text}</span>
        </span>
    );
};

// -------------------------------------------------------------
// 8. Search Bar
// -------------------------------------------------------------
interface SecureDroidSearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    isLight?: boolean;
    onClear?: () => void;
    autoFocus?: boolean;
}

export const SecureDroidSearchBar: React.FC<SecureDroidSearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search settings, apps & privacy...',
    isLight = false,
    onClear,
    autoFocus = false,
}) => {
    return (
        <div
            className={`flex items-center px-3.5 py-2.5 rounded-2xl border transition-colors ${
                isLight
                    ? 'bg-white border-zinc-300 text-zinc-900 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400/20'
                    : 'bg-slate-900 border-slate-800 text-zinc-100 focus-within:border-slate-700 focus-within:ring-1 focus-within:ring-slate-700/20'
            }`}
        >
            <svg
                className={`w-4 h-4 mr-2.5 shrink-0 ${isLight ? 'text-zinc-400' : 'text-slate-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={`w-full bg-transparent text-xs placeholder:text-zinc-400 focus:outline-none ${
                    isLight ? 'text-zinc-900' : 'text-zinc-100'
                }`}
            />
            {value && onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className={`p-1 rounded-full ${isLight ? 'hover:bg-zinc-100 text-zinc-400' : 'hover:bg-slate-800 text-slate-500'}`}
                >
                    <XCircle className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// -------------------------------------------------------------
// 9. Slider
// -------------------------------------------------------------
interface SecureDroidSliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
    label?: string;
    isLight?: boolean;
}

export const SecureDroidSlider: React.FC<SecureDroidSliderProps> = ({
    value,
    min,
    max,
    step = 1,
    onChange,
    label,
    isLight = false,
}) => {
    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-1 text-xs">
                    <span className={isLight ? 'text-zinc-600' : 'text-slate-400'}>{label}</span>
                    <span className="font-mono font-medium">{value}</span>
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                    isLight ? 'bg-zinc-200 accent-zinc-800' : 'bg-slate-800 accent-zinc-300'
                }`}
            />
        </div>
    );
};

// -------------------------------------------------------------
// 10. Progress Ring
// -------------------------------------------------------------
interface SecureDroidProgressRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    isLight?: boolean;
    children?: React.ReactNode;
}

export const SecureDroidProgressRing: React.FC<SecureDroidProgressRingProps> = ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    label,
    isLight = false,
    children,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 80) return '#22c55e';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isLight ? '#e5e7eb' : '#1e293b'}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children || (
                    <span className="text-lg font-bold text-zinc-100">{Math.round(percentage)}%</span>
                )}
            </div>
            {label && (
                <span className="absolute bottom-0 translate-y-full text-[10px] text-slate-400">
                    {label}
                </span>
            )}
        </div>
    );
};

// -------------------------------------------------------------
// 11. Badge
// -------------------------------------------------------------
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
            className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold rounded-full ${
                isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-200 text-zinc-900'
            }`}
        >
            {display}
        </span>
    );
};

// -------------------------------------------------------------
// 12. Skeleton Loader
// -------------------------------------------------------------
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
            className={`animate-pulse rounded-lg ${
                isLight ? 'bg-zinc-200' : 'bg-slate-800'
            } ${className}`}
        />
    );
};
