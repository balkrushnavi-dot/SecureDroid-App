import React from 'react';

interface AppSecurityAuditorScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const AppSecurityAuditorScreen: React.FC<
  AppSecurityAuditorScreenProps
> = ({ onBack, isLight = false }) => {
  return (
    <div
      className={`min-h-full p-4 pb-24 ${
        isLight
          ? 'bg-zinc-50 text-zinc-900'
          : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      <div className="pt-4">
        <button
          onClick={onBack}
          className="mb-4 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200"
        >
          Back
        </button>

        <h1 className="text-xl font-semibold">
          App Security Auditor
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Review installed applications for security-relevant signals.
        </p>
      </div>
    </div>
  );
};
