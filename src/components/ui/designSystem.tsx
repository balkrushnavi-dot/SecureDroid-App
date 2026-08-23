import React from 'react';
import { ChevronRight, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Shield, LucideIcon } from 'lucide-react';
import { QualitativeSecurityTier, HostSecurityStatus, SystemLayer, PlatformRequirementTag } from '../../types/securedroid';

// -------------------------------------------------------------
// 1. Top Bar / App Header (Minimal & Restrained)
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
      className={`sticky top-0 z-20 px-4 py-3 border-b transition-colors flex items-center justify-between backdrop-blur-md ${
        isLight
          ? 'bg-zinc-50/95 border-zinc-200 text-zinc-900'
          : 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className={`p-2 -ml-2 rounded-xl transition-colors ${
              isLight ? 'hover:bg-zinc-200 text-zinc-700 active:bg-zinc-300' : 'hover:bg-zinc-800 text-zinc-300 active:bg-zinc-700'
            }`}
            aria-label="Navigate back"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
        <div className="truncate">
          <h1 className="text-base font-semibold tracking-tight truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className={`text-xs truncate font-normal ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && <div className="flex items-center gap-2 shrink-0">{rightAction}</div>}
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
    <div className="flex items-center justify-between px-1 pt-4 pb-2">
      <div>
        <h2 className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// -------------------------------------------------------------
// 3. Card Container (Subtle borders, no neon glows)
// -------------------------------------------------------------
interface SecureDroidCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isLight?: boolean;
  highlight?: boolean;
}

export const SecureDroidCard: React.FC<SecureDroidCardProps> = ({
  children,
  className = '',
  onClick,
  isLight = false,
  highlight = false,
}) => {
  const base = isLight
    ? 'bg-white border-zinc-200/90 text-zinc-900 shadow-sm'
    : 'bg-zinc-900/90 border-zinc-800 text-zinc-100';
  const interactive = onClick
    ? isLight
      ? 'cursor-pointer hover:bg-zinc-50 active:scale-[0.99] transition'
      : 'cursor-pointer hover:bg-zinc-800/80 active:scale-[0.99] transition'
    : '';
  const high = highlight
    ? isLight
      ? 'border-zinc-300 ring-1 ring-zinc-300/50'
      : 'border-zinc-700 ring-1 ring-zinc-700/50'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 transition-all ${base} ${interactive} ${high} ${className}`}
    >
      {children}
    </div>
  );
};

// -------------------------------------------------------------
// 4. List Item (Settings Row)
// -------------------------------------------------------------
interface SecureDroidListItemProps {
  icon?: any;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  value?: string | React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  isLight?: boolean;
  className?: string;
  disabled?: boolean;
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
}) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return <div className="shrink-0">{Icon}</div>;
    }
    const IconComponent = Icon as React.ComponentType<{ className?: string }>;
    return (
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          iconBgColor || (isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300')
        }`}
      >
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : onClick
          ? isLight
            ? 'hover:bg-zinc-100 active:bg-zinc-200 cursor-pointer'
            : 'hover:bg-zinc-800/60 active:bg-zinc-800 cursor-pointer'
          : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        {renderIcon()}
        <div className="min-w-0">
          <p className={`text-sm font-medium leading-snug truncate ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            {title}
          </p>
          {subtitle && (
            <p className={`text-xs mt-0.5 leading-normal ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {typeof value === 'string' ? (
          <span className={`text-xs font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {value}
          </span>
        ) : (
          value
        )}
        {showChevron && onClick && (
          <ChevronRight className={`w-4 h-4 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`} />
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. Minimalist Switch (Clean pill, calm tones)
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
// 6. Minimalist Buttons
// -------------------------------------------------------------
interface SecureDroidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLight?: boolean;
  icon?: any;
}

export const SecureDroidButton: React.FC<SecureDroidButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLight = false,
  icon: Icon,
  className = '',
  disabled,
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
      ? 'bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 border border-zinc-300/80'
      : 'bg-zinc-800 hover:bg-zinc-750 active:bg-zinc-700 text-zinc-200 border border-zinc-700/60';
  } else if (variant === 'danger') {
    variantClass = 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium';
  } else {
    variantClass = isLight
      ? 'hover:bg-zinc-100 text-zinc-700'
      : 'hover:bg-zinc-800 text-zinc-300';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClass} ${className}`}
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
  icon: any;
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
            : 'bg-zinc-800 text-zinc-100'
          : isLight
          ? 'hover:bg-zinc-200 text-zinc-600 active:bg-zinc-300'
          : 'hover:bg-zinc-800 text-zinc-300 active:bg-zinc-700'
      } ${className}`}
    >
      {React.isValidElement(Icon) ? Icon : Icon ? <Icon className="w-4 h-4" /> : null}
    </button>
  );
};

// -------------------------------------------------------------
// 7. Qualitative Status Chip (Muted & Minimalist)
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
    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700';
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
    norm === 'ACTIVE'
  ) {
    color = isLight
      ? 'bg-zinc-100 text-zinc-800 border-zinc-300'
      : 'bg-zinc-800 text-zinc-200 border-zinc-700';
    Icon = CheckCircle2;
  } else if (norm === 'ATTENTION REQUIRED' || norm === 'WARNING' || norm === 'PARTIAL' || norm === 'DEGRADED') {
    color = isLight
      ? 'bg-amber-50 text-amber-900 border-amber-300'
      : 'bg-amber-950/40 text-amber-200 border-amber-800/60';
    Icon = AlertTriangle;
  } else if (norm === 'CRITICAL' || norm === 'UNSUPPORTED' || norm === 'INVALID' || norm === 'UNAVAILABLE') {
    color = isLight
      ? 'bg-rose-50 text-rose-900 border-rose-300'
      : 'bg-rose-950/40 text-rose-200 border-rose-800/60';
    Icon = XCircle;
  }

  const text = label || status;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

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
// 8. Search Bar Component (Minimalist)
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
          : 'bg-zinc-900 border-zinc-800 text-zinc-100 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700/20'
      }`}
    >
      <svg
        className={`w-4 h-4 mr-2.5 shrink-0 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}
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
          className={`p-1 rounded-full ${isLight ? 'hover:bg-zinc-100 text-zinc-400' : 'hover:bg-zinc-800 text-zinc-500'}`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 9. Slider Component (Minimalist)
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
          <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>{label}</span>
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
          isLight ? 'bg-zinc-200 accent-zinc-800' : 'bg-zinc-800 accent-zinc-300'
        }`}
      />
    </div>
  );
};
