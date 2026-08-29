import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type {
NativeInstalledApp,
NativeAppRiskReport,
} from '../types/native';

export interface AppInfo {
packageName: string;
appName: string;
label?: string;
versionName: string;
versionCode: number;
targetSdk?: number;
minSdk?: number;
isSystemApp: boolean;
isEnabled?: boolean;
isLaunchable?: boolean;
firstInstallTime: number;
lastUpdateTime: number;
installTime: number;
updateTime: number;
requestedPermissions: string[];
grantedPermissions: string[];
dangerousPermissions: string[];
installerPackage?: string;
installSource: string;
installerKnown?: boolean;
isSideloaded: boolean;
isDebuggable?: boolean;
enabled?: boolean;
permissions: string[];
signingCertSha256?: string;
}

export interface RiskInfo {
appName: string;
packageName: string;
riskLevel: string;
securityScore?: number;
findingCount?: number;
findings?: Array<{
code?: string;
title?: string;
description?: string;
severity?: string;
points?: number;
}>;
reason?: string;
installSource?: string;
isSystemApp?: boolean;
}

export interface HardeningFinding {
id: string;
level: 'GOOD' | 'WARNING' | 'CRITICAL';
summary: string;
}

const stringValue = (value: unknown, fallback = '') =>
typeof value === 'string' ? value : fallback;

const numberValue = (value: unknown, fallback = 0) =>
typeof value === 'number' && Number.isFinite(value)
? value
: fallback;

const booleanValue = (value: unknown, fallback = false) =>
typeof value === 'boolean' ? value : fallback;

const stringArray = (value: unknown): string[] =>
Array.isArray(value)
? value.filter((item): item is string => typeof item === 'string')
: [];

const normalizeApp = (app: NativeInstalledApp): AppInfo => {
const raw = app as unknown as Record<string, unknown>;

const requestedPermissions = stringArray(
raw.requestedPermissions ?? raw.permissions
);

const grantedPermissions = stringArray(raw.grantedPermissions);

const dangerousPermissions = stringArray(
raw.dangerousPermissions
);

const firstInstallTime = numberValue(
raw.firstInstallTime ?? raw.installTime
);

const lastUpdateTime = numberValue(
raw.lastUpdateTime ?? raw.updateTime
);

const installerPackage =
stringValue(
raw.installerPackage ??
raw.installerPackageName ??
raw.installSource
) || undefined;

const installSource = stringValue(
raw.installSource ??
raw.installerPackage ??
raw.installerPackageName,
'UNKNOWN'
);

const enabled = booleanValue(
raw.enabled ?? raw.isEnabled,
true
);

return {
packageName: stringValue(raw.packageName, 'UNKNOWN'),
appName: stringValue(
raw.label ?? raw.appName ?? raw.packageName,
'Unknown application'
),
label:
stringValue(raw.label ?? raw.appName) || undefined,
versionName: stringValue(raw.versionName, 'Unknown'),
versionCode: numberValue(raw.versionCode),
targetSdk: numberValue(raw.targetSdk),
minSdk: numberValue(raw.minSdk),
isSystemApp: booleanValue(raw.isSystemApp),
isEnabled: enabled,
isLaunchable:
typeof raw.isLaunchable === 'boolean'
? raw.isLaunchable
: undefined,
firstInstallTime,
lastUpdateTime,
installTime: firstInstallTime,
updateTime: lastUpdateTime,
requestedPermissions,
grantedPermissions,
dangerousPermissions,
installerPackage,
installSource,
installerKnown:
typeof raw.installerKnown === 'boolean'
? raw.installerKnown
: installerPackage !== undefined,
isSideloaded: booleanValue(raw.isSideloaded),
isDebuggable:
typeof raw.isDebuggable === 'boolean'
? raw.isDebuggable
: undefined,
enabled,
permissions: requestedPermissions,
signingCertSha256:
stringValue(raw.signingCertSha256) || undefined,
};
};

const normalizeRisk = (
report: NativeAppRiskReport,
appMap: Map<string, AppInfo>
): RiskInfo => {
const raw = report as unknown as Record<string, unknown>;

const packageName = stringValue(raw.packageName);
const app = appMap.get(packageName);

const rawFindings = Array.isArray(raw.findings)
? raw.findings
: [];

const findings = rawFindings.map((finding) => {
const item = finding as Record<string, unknown>;

return {
  code:
    stringValue(item.id ?? item.code) || undefined,
  title:
    stringValue(
      item.title ?? item.summary,
      'Security finding'
    ),
  description:
    stringValue(
      item.summary ?? item.description
    ),
  severity:
    stringValue(
      item.severity ?? item.level,
      'UNKNOWN'
    ),
  points:
    typeof item.points === 'number'
      ? item.points
      : undefined,
};

});

const riskLevel = stringValue(
raw.overallRisk ??
raw.riskLevel ??
raw.severity,
'UNKNOWN'
);

const securityScore =
typeof raw.securityScore === 'number'
? raw.securityScore
: typeof raw.score === 'number'
? raw.score
: undefined;

return {
appName: stringValue(
raw.label ?? raw.appName,
app?.appName ?? packageName
),
packageName,
riskLevel,
securityScore,
findingCount: findings.length,
findings,
reason:
stringValue(raw.reason ?? raw.summary) || undefined,
installSource: app?.installSource,
isSystemApp: app?.isSystemApp,
};
};

export const useSecureDroid = () => {
const isNative = Capacitor.isNativePlatform();

const [apps, setApps] = useState<AppInfo[]>([]);
const [risks, setRisks] = useState<RiskInfo[]>([]);
const [loading, setLoading] = useState(true);
const [connected, setConnected] = useState(false);
const [error, setError] = useState<string | null>(null);
const [score, setScore] = useState(0);
const [hardeningFindings, setHardeningFindings] =
  useState<HardeningFinding[]>([]);
  
const usingMock = false;

const loadData = useCallback(async () => {
setLoading(true);
setError(null);

if (!isNative) {
  setApps([]);
  setRisks([]);
  setScore(0);
  setHardeningFindings([]);
  setConnected(false);
  setLoading(false);
  return;
}

try {
  let nativeConnected = false;

  try {
    const result =
      await SecureDroidNative.checkConnection();

    nativeConnected =
      result.success === true &&
      result.data?.connected === true;
  } catch {
    nativeConnected = false;
  }

  setConnected(nativeConnected);

  if (!nativeConnected) {
    setError(
      'Native SecureDroid bridge is not connected.'
    );
    setLoading(false);
    return;
  }

  const errors: string[] = [];

  try {
    const result =
      await SecureDroidNative.getInstalledApps();

    if (
      result.success &&
      Array.isArray(result.data)
    ) {
      const normalized =
        result.data
          .map(normalizeApp)
          .filter(
            app =>
              app.packageName !== 'UNKNOWN' &&
              app.packageName.length > 0
          );

      setApps(normalized);

      const appMap = new Map(
        normalized.map(app => [
          app.packageName,
          app,
        ])
      );

      try {
        const riskResult =
          await SecureDroidNative.getAppRiskReports();

        if (
          riskResult.success &&
          Array.isArray(riskResult.data)
        ) {
          const normalizedRisks =
            riskResult.data
              .map(report =>
                normalizeRisk(
                  report,
                  appMap
                )
              )
              .filter(risk =>
                appMap.has(risk.packageName)
              );

          setRisks(normalizedRisks);
        } else {
          errors.push(
            riskResult.message ||
              'Risk analysis unavailable.'
          );
        }
      } catch {
        errors.push(
          'Risk analysis failed.'
        );
      }
    } else {
      errors.push(
        result.message ||
          'Installed applications unavailable.'
      );
    }
  } catch {
    errors.push(
      'Failed to load installed applications.'
    );
  }

  try {
    const result =
      await SecureDroidNative.getHardeningReport();

    if (
      result.success &&
      result.data
    ) {
      const value = result.data.score;

      if (
        typeof value === 'number' &&
        Number.isFinite(value)
      ) {
        setScore(
          Math.max(
            0,
            Math.min(100, value)
          )
        );
      }

      const findings =
        Array.isArray(result.data.findings)
          ? result.data.findings
              .map(finding => {
                const item =
                  finding as Record<
                    string,
                    unknown
                  >;

                const level =
                  stringValue(
                    item.level
                  );

                if (
                  level !== 'GOOD' &&
                  level !== 'WARNING' &&
                  level !== 'CRITICAL'
                ) {
                  return null;
                }

                return {
                  id: stringValue(
                    item.id,
                    'UNKNOWN'
                  ),
                  level,
                  summary: stringValue(
                    item.summary
                  ),
                } satisfies HardeningFinding;
              })
              .filter(
                (
                  item
                ): item is HardeningFinding =>
                  item !== null
              )
          : [];

      setHardeningFindings(findings);
    } else {
      errors.push(
        result.message ||
          'Device security information unavailable.'
      );
    }
  } catch {
    errors.push(
      'Device hardening check failed.'
    );
  }

  setConnected(true);

  if (errors.length > 0) {
    setError(errors.join(' '));
  }
} catch (e) {
  setConnected(false);
  setApps([]);
  setRisks([]);
  setScore(0);
  setHardeningFindings([]);

  setError(
    e instanceof Error
      ? e.message
      : 'SecureDroid failed to load.'
  );
} finally {
  setLoading(false);
}

}, [isNative]);

useEffect(() => {
void loadData();
}, [loadData]);

return {
apps,
risks,
loading,
connected,
error,
score,
hardeningFindings,
usingMock,
reload: loadData,
};
};
