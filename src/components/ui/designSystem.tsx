import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export function SecureDroidTopBar({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
            <Shield className="h-5 w-5 text-sky-400" />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-white">
            {title}
          </h1>
          <p className="text-xs text-slate-500">
            SecureDroid
          </p>
        </div>
      </div>
    </header>
  );
}
