import React, { useEffect, useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import {
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidButton,
} from '../ui/designSystem';
import { SecureDroidNative } from '../../services/native/SecureDroidNative';
import { NativeAppRiskReport } from '../../types/native';

interface AppSecurityAuditorScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const AppSecurityAuditorScreen: React.FC<
  AppSecurityAuditorScreenProps
> = ({ onBack, isLight = false }) => {
  const [reports, setReports] = useState<NativeAppRiskReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await SecureDroidNative.getAppRiskReports();
      if (res.success && res.data) {
        const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const sorted = [...res.data].sort(
          (a, b) => order[a.overallRisk] - order[b.overallRisk]
        );
        setReports(sorted);
        setLoadError(null);
      } else {
        setReports([]);
        setLoadError(
          res.message || 'App risk analysis is unavailable on this device.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const highCount = reports.filter((r) => r.overallRisk === 'HIGH').length;
  const mediumCount = reports.filter((r) => r.overallRisk === 'MEDIUM').length;

  return (
    <div
      className={`min-h-full p-4 pb-24 ${
        isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      <div className="pt-4">
        <button
          onClick={onBack}
          className="mb-4 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200"
        >
          Back
        </button>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">App Security Auditor</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Review installed applications for security-relevant signals.
            </p>
          </div>

          <SecureDroidButton onClick={fetchReports} isLight={isLight}>
            <span className="flex items-center gap-1.5">
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Scan
            </span>
          </SecureDroidButton>
        </div>

        {!isLoading && !loadError && reports.length > 0 && (
          <div className="mt-4 flex gap-2 text-xs">
            {highCount > 0 && (
              <SecureDroidStatusChip
                status="HIGH"
                label={`${highCount} High`}
                isLight={isLight}
              />
            )}
            {mediumCount > 0 && (
              <SecureDroidStatusChip
                status="MEDIUM"
                label={`${mediumCount} Medium`}
                isLight={isLight}
              />
            )}
            <SecureDroidStatusChip
              status="INFO"
              label={`${reports.length} apps scanned`}
              isLight={isLight}
            />
          </div>
        )}

        <div className="mt-4 space-y-3">
          {isLoading && (
            <SecureDroidCard isLight={isLight} className="p-6 text-center text-sm text-zinc-400">
              Scanning installed applications...
            </SecureDroidCard>
          )}

          {!isLoading && loadError && (
            <SecureDroidCard
              isLight={isLight}
              className="p-4 text-xs text-amber-400 whitespace-pre-wrap break-words font-mono"
            >
              {loadError}
            </SecureDroidCard>
          )}

          {!isLoading && !loadError && reports.length === 0 && (
            <SecureDroidCard
              isLight={isLight}
              className="p-6 text-center text-sm text-zinc-400"
            >
              No installed applications were found.
            </SecureDroidCard>
          )}

          {!isLoading &&
            !loadError &&
            reports.map((report) => {
              const isExpanded = expandedPackage === report.packageName;
              return (
                <SecureDroidCard
                  key={report.packageName}
                  isLight={isLight}
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedPackage(isExpanded ? null : report.packageName)
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {report.label}
                      </h4>
                      <p className="text-xs mt-0.5 truncate text-zinc-500">
                        {report.packageName}
                      </p>
                    </div>
                    <SecureDroidStatusChip
                      status={report.overallRisk}
                      label={report.overallRisk}
                      isLight={isLight}
                    />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                      {report.findings.length === 0 ? (
                        <p className="text-xs text-zinc-500">
                          No specific risk signals found for this app.
                        </p>
                      ) : (
                        report.findings.map((finding) => (
                          <div key={finding.id} className="text-xs">
                            <span
                              className={`font-medium ${
                                finding.level === 'HIGH'
                                  ? 'text-red-400'
                                  : finding.level === 'MEDIUM'
                                  ? 'text-amber-400'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {finding.level}
                            </span>
                            <span className="text-zinc-400">
                              {' '}
                              &mdash; {finding.summary}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </SecureDroidCard>
              );
            })}
        </div>
      </div>
    </div>
  );
};
