import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'text-sky-400',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizeClasses[size]} ${color} animate-spin`}>
                <svg className="w-full h-full" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        </div>
    );
};

interface PulseAnimationProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
    children,
    className = '',
    delay = 0,
}) => {
    return (
        <div
            className={`animate-pulse ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

interface ShimmerAnimationProps {
    className?: string;
    width?: string;
    height?: string;
    rounded?: string;
}

export const ShimmerAnimation: React.FC<ShimmerAnimationProps> = ({
    className = '',
    width = 'w-full',
    height = 'h-4',
    rounded = 'rounded-lg',
}) => {
    return (
        <div
            className={`${width} ${height} ${rounded} bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 animate-pulse ${className}`}
        />
    );
};

interface ProgressBarProps {
    value: number;
    max?: number;
    color?: string;
    showLabel?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    color = 'bg-sky-500',
    showLabel = true,
    className = '',
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getColor = () => {
        if (percentage >= 80) return 'bg-emerald-500';
        if (percentage >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${color || getColor()}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>0%</span>
                    <span>{Math.round(percentage)}%</span>
                    <span>100%</span>
                </div>
            )}
        </div>
    );
};

interface ScoreRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
    className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    children,
    className = '',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 80) return '#22c55e';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#1e293b"
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
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children || (
                    <span className="text-xl font-bold text-slate-100">
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>
        </div>
    );
};
