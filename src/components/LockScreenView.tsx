import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  PhoneCall,
  Camera,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { HostSecurityStatus, QualitativeSecurityTier } from '../types/securedroid';

interface LockScreenViewProps {
  isLocked: boolean;
  onUnlock: () => void;
  isLockdownActive: boolean;
  onToggleLockdown: () => void;
  hostStatus: HostSecurityStatus;
  qualitativeTier: QualitativeSecurityTier;
  timeString: string;
  isLight?: boolean;
}

export const LockScreenView: React.FC<LockScreenViewProps> = ({
  isLocked,
  onUnlock,
  isLockdownActive,
  onToggleLockdown,
  hostStatus,
  qualitativeTier,
  timeString,
  isLight = false,
}) => {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (isRateLimited) return;
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 6) {
        // Standard Android KeyMint rate-limited PIN check
        if (nextPin === '123456' || nextPin === '000000') {
          setPin('');
          setAttempts(0);
          setErrorMessage('');
          onUnlock();
        } else {
          const nextAttempts = attempts + 1;
          setAttempts(nextAttempts);
          setPin('');
          if (nextAttempts >= 4) {
            setIsRateLimited(true);
            setErrorMessage('Too many attempts. KeyMint rate limit active (30s).');
            setTimeout(() => {
              setIsRateLimited(false);
              setAttempts(0);
              setErrorMessage('');
            }, 30000);
          } else {
            setErrorMessage(`Incorrect PIN. ${4 - nextAttempts} attempts remaining.`);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 select-none transition-colors backdrop-blur-3xl ${
        isLight
          ? 'bg-zinc-100/95 text-zinc-900'
          : 'bg-zinc-950/95 text-zinc-100'
      }`}
    >
      {/* Top Header: Protection Status */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          <span className={`text-xs font-medium tracking-tight ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            SecureDroid OS • Protected
          </span>
        </div>
        <button
          onClick={onToggleLockdown}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isLockdownActive
              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
              : isLight
              ? 'bg-white hover:bg-zinc-200 border-zinc-300 text-zinc-700'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{isLockdownActive ? 'Lockdown Active' : 'Engage Lockdown'}</span>
        </button>
      </div>

      {/* Center Display: Android Large Clock & Date */}
      <div className="flex flex-col items-center justify-center my-auto">
        <h1 className="text-7xl sm:text-8xl font-light tracking-tighter tabular-nums mb-1 font-sans">
          {timeString}
        </h1>
        <p className={`text-sm sm:text-base font-normal ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {todayStr}
        </p>

        {isLockdownActive && (
          <div className="mt-4 px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Lockdown mode active: Biometric unlock and notifications suspended.</span>
          </div>
        )}

        {/* PIN Entry Indicators */}
        <div className="mt-8 flex flex-col items-center">
          <div className="flex gap-3 mb-3">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                  pin.length > idx
                    ? isLight
                      ? 'bg-zinc-900 border-zinc-900 scale-110'
                      : 'bg-zinc-100 border-zinc-100 scale-110'
                    : isLight
                    ? 'border-zinc-300 bg-transparent'
                    : 'border-zinc-700 bg-transparent'
                }`}
              />
            ))}
          </div>
          {errorMessage ? (
            <p className="text-xs text-rose-400 font-mono animate-shake">{errorMessage}</p>
          ) : (
            <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Enter PIN (123456)
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3.5 mt-6 max-w-xs w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              disabled={isRateLimited}
              onClick={() => handleKeyPress(digit)}
              className={`h-14 rounded-full text-xl font-normal transition-all active:scale-95 disabled:opacity-30 ${
                isLight
                  ? 'bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800'
              }`}
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => {
              if (!isLockdownActive) {
                // Quick unlock simulation
                onUnlock();
              } else {
                setErrorMessage('Biometrics disabled in lockdown mode. Enter PIN.');
              }
            }}
            className={`h-14 rounded-full flex items-center justify-center transition-all ${
              isLockdownActive ? 'opacity-30' : isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-zinc-850 text-zinc-300'
            }`}
            title="Biometric Fingerprint"
          >
            <Fingerprint className="w-6 h-6 text-zinc-400" />
          </button>
          <button
            disabled={isRateLimited}
            onClick={() => handleKeyPress('0')}
            className={`h-14 rounded-full text-xl font-normal transition-all active:scale-95 disabled:opacity-30 ${
              isLight
                ? 'bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800'
            }`}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className={`h-14 rounded-full flex items-center justify-center transition-all ${
              isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-zinc-850 text-zinc-300'
            }`}
            title="Backspace"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Shortcuts */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => {}}
          className={`p-3.5 rounded-full border transition-colors ${
            isLight
              ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
          }`}
          title="Emergency SOS"
        >
          <PhoneCall className="w-5 h-5" />
        </button>

        <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          SecureDroid Hardened Lock
        </span>

        <button
          onClick={() => {}}
          className={`p-3.5 rounded-full border transition-colors ${
            isLight
              ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
          }`}
          title="Camera"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
