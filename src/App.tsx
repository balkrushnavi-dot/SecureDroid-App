import React, { useEffect, useState } from 'react';
import { useSecureDroid } from './hooks/useSecureDroid';

type Screen =
| 'home'
| 'apps'
| 'threats'
| 'network'
| 'device'
| 'privacy'
| 'log'
| 'report'
| 'ai'
| 'family'
| 'settings';

const navigation: {
id: Screen;
label: string;
}[] = [
{ id: 'home', label: 'HOME' },
{ id: 'apps', label: 'APPS' },
{ id: 'threats', label: 'THREATS' },
{ id: 'network', label: 'NETWORK' },
{ id: 'device', label: 'DEVICE' },
{ id: 'privacy', label: 'PRIVACY' },
{ id: 'log', label: 'LOG' },
{ id: 'report', label: 'REPORT' },
{ id: 'ai', label: 'AI' },
{ id: 'family', label: 'FAMILY' },
{ id: 'settings', label: 'SETTINGS' },
];

function Card({
children,
}: {
children: React.ReactNode;
}) {
return (
<div
style={{
background: '#0f172a',
border: '1px solid #1e293b',
borderRadius: '18px',
padding: '20px',
}}
>
{children}
</div>
);
}

function HomeScreen({
apps,
risks,
score,
connected,
loading,
error,
reload,
}: {
apps: ReturnType<typeof useSecureDroid>['apps'];
risks: ReturnType<typeof useSecureDroid>['risks'];
score: number;
connected: boolean;
loading: boolean;
error: string | null;
reload: () => Promise<void>;
}) {
const highRisk = risks.filter(
risk =>
risk.riskLevel === 'HIGH' ||
risk.riskLevel === 'CRITICAL'
).length;

const mediumRisk = risks.filter(
risk => risk.riskLevel === 'MEDIUM'
).length;

const userApps = apps.filter(
app => !app.isSystemApp
).length;

const systemApps = Math.max(
0,
apps.length - userApps
);

return (
<div
style={{
padding: '24px',
maxWidth: '760px',
margin: '0 auto',
boxSizing: 'border-box',
}}
>
<div style={{ marginBottom: '20px' }}>
<h1
style={{
margin: 0,
fontSize: '30px',
fontWeight: 800,
color: '#f8fafc',
}}
>
SecureDroid
</h1>

    <p
      style={{
        margin: '6px 0 0',
        color: '#94a3b8',
      }}
    >
      Security for your phone
    </p>
  </div>

  <div
    style={{
      padding: '12px 14px',
      marginBottom: '16px',
      borderRadius: '12px',
      border: connected
        ? '1px solid rgba(16,185,129,.35)'
        : '1px solid rgba(245,158,11,.35)',
      background: connected
        ? 'rgba(16,185,129,.06)'
        : 'rgba(245,158,11,.06)',
      color: connected
        ? '#34d399'
        : '#fbbf24',
      fontSize: '13px',
    }}
  >
    {loading
      ? 'Loading security data...'
      : connected
        ? 'Native security bridge connected'
        : 'Native security bridge not connected'}
  </div>

  {error && (
    <div
      style={{
        padding: '14px',
        marginBottom: '16px',
        borderRadius: '12px',
        background: 'rgba(245,158,11,.06)',
        border: '1px solid rgba(245,158,11,.25)',
        color: '#fbbf24',
        fontSize: '13px',
        lineHeight: 1.5,
      }}
    >
      {error}
    </div>
  )}

  <Card>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <div
        style={{
          width: '92px',
          height: '92px',
          borderRadius: '50%',
          border: '7px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '25px',
            fontWeight: 800,
            color: '#f8fafc',
          }}
        >
          {score}
        </span>
      </div>

      <div>
        <div
          style={{
            color: '#f8fafc',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          Security Score
        </div>

        <div
          style={{
            color: '#64748b',
            fontSize: '13px',
            marginTop: '5px',
          }}
        >
          Native device security assessment
        </div>
      </div>
    </div>
  </Card>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns:
        'repeat(2, minmax(0, 1fr))',
      gap: '10px',
      marginTop: '12px',
    }}
  >
    <Card>
      <div
        style={{
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        INSTALLED APPS
      </div>
      <div
        style={{
          color: '#f8fafc',
          fontSize: '25px',
          fontWeight: 700,
          marginTop: '5px',
        }}
      >
        {apps.length}
      </div>
    </Card>

    <Card>
      <div
        style={{
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        RISKS
      </div>
      <div
        style={{
          color:
            risks.length > 0
              ? '#fbbf24'
              : '#34d399',
          fontSize: '25px',
          fontWeight: 700,
          marginTop: '5px',
        }}
      >
        {risks.length}
      </div>
    </Card>

    <Card>
      <div
        style={{
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        USER APPS
      </div>
      <div
        style={{
          color: '#f8fafc',
          fontSize: '25px',
          fontWeight: 700,
          marginTop: '5px',
        }}
      >
        {userApps}
      </div>
    </Card>

    <Card>
      <div
        style={{
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        SYSTEM APPS
      </div>
      <div
        style={{
          color: '#f8fafc',
          fontSize: '25px',
          fontWeight: 700,
          marginTop: '5px',
        }}
      >
        {systemApps}
      </div>
    </Card>
  </div>

  <div
    style={{
      marginTop: '12px',
      display: 'grid',
      gridTemplateColumns:
        'repeat(2, minmax(0, 1fr))',
      gap: '10px',
    }}
  >
    <Card>
      <div
        style={{
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        HIGH / CRITICAL
      </div>
      <div
        style={{
          color: '#fb7185',
          fontSize: '24px',
          fontWeight: 700,
          marginTop: '5px',
        }}
      >
        {highRisk}
      </div>
    </Card>

    <Card>
      <div
        style={{
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        MEDIUM
      </div>
      <div
        style={{
          color: '#fbbf24',
          fontSize: '24px',
          fontWeight: 700,
          marginTop: '5px',
        }}
      >
        {mediumRisk}
      </div>
    </Card>
  </div>

  <button
    type="button"
    onClick={() => {
      void reload();
    }}
    disabled={loading}
    style={{
      width: '100%',
      marginTop: '16px',
      padding: '14px',
      border: 0,
      borderRadius: '12px',
      background: loading
        ? '#1e293b'
        : '#0284c7',
      color: '#fff',
      fontWeight: 700,
      cursor: loading
        ? 'default'
        : 'pointer',
    }}
  >
    {loading
      ? 'Loading...'
      : 'Refresh Security Data'}
  </button>
</div>

);
}

function Placeholder({
title,
}: {
title: string;
}) {
return (
<div
style={{
minHeight: '100%',
padding: '24px',
maxWidth: '760px',
margin: '0 auto',
boxSizing: 'border-box',
}}
>
<Card>
<h1
style={{
margin: 0,
color: '#f8fafc',
fontSize: '26px',
}}
>
{title}
</h1>

    <p
      style={{
        color: '#94a3b8',
        lineHeight: 1.6,
        marginTop: '10px',
      }}
    >
      This screen is temporarily isolated while the
      SecureDroid native integration is being tested.
    </p>
  </Card>
</div>

);
}

export default function App() {
const secureDroid = useSecureDroid();

const [screen, setScreen] =
useState<Screen>('home');

const [runtimeError, setRuntimeError] =
useState<string | null>(null);

useEffect(() => {
const handleError = (
event: ErrorEvent
) => {
setRuntimeError(
event.error instanceof Error
? event.error.message
: event.message
);
};

const handleRejection = (
  event: PromiseRejectionEvent
) => {
  const reason = event.reason;

  setRuntimeError(
    reason instanceof Error
      ? reason.message
      : String(reason)
  );
};

window.addEventListener(
  'error',
  handleError
);

window.addEventListener(
  'unhandledrejection',
  handleRejection
);

return () => {
  window.removeEventListener(
    'error',
    handleError
  );

  window.removeEventListener(
    'unhandledrejection',
    handleRejection
  );
};

}, []);

const renderContent = () => {
if (screen === 'home') {
return (
<HomeScreen
apps={secureDroid.apps}
risks={secureDroid.risks}
score={secureDroid.score}
connected={secureDroid.connected}
loading={secureDroid.loading}
error={secureDroid.error}
reload={secureDroid.reload}
/>
);
}

const titles: Record<
  Exclude<Screen, 'home'>,
  string
> = {
  apps: 'App Security',
  threats: 'Threat Model',
  network: 'Network Protection',
  device: 'Device Security',
  privacy: 'Privacy Radar',
  log: 'Security Audit Log',
  report: 'Security Report',
  ai: 'AI Assistant',
  family: 'Family Protection',
  settings: 'Settings',
};

return (
  <Placeholder
    title={titles[screen]}
  />
);

};

return (
<div
style={{
minHeight: '100vh',
background: '#020617',
color: '#f8fafc',
fontFamily:
'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}}
>
<header
style={{
height: '64px',
display: 'flex',
alignItems: 'center',
padding: '0 20px',
boxSizing: 'border-box',
borderBottom:
'1px solid #1e293b',
background: '#020617',
position: 'sticky',
top: 0,
zIndex: 10,
}}
>
<div
style={{
fontSize: '18px',
fontWeight: 800,
}}
>
SecureDroid
</div>
</header>

  {runtimeError && (
    <div
      style={{
        margin: '12px',
        padding: '14px',
        borderRadius: '12px',
        background: '#3f1115',
        border:
          '1px solid rgba(248,113,113,.4)',
        color: '#fca5a5',
        fontSize: '13px',
        lineHeight: 1.5,
      }}
    >
      Runtime error: {runtimeError}
    </div>
  )}

  <main
    style={{
      minHeight:
        'calc(100vh - 132px)',
      paddingBottom: '70px',
      boxSizing: 'border-box',
    }}
  >
    {renderContent()}
  </main>

  <nav
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      height: '68px',
      display: 'flex',
      overflowX: 'auto',
      background: '#020617',
      borderTop:
        '1px solid #1e293b',
      zIndex: 20,
    }}
  >
    {navigation.map(item => {
      const active =
        screen === item.id;

      return (
        <button
          key={item.id}
          type="button"
          onClick={() =>
            setScreen(item.id)
          }
          style={{
            flex: '1 0 72px',
            border: 0,
            background: 'transparent',
            color: active
              ? '#38bdf8'
              : '#64748b',
            fontSize: '10px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {item.label}
        </button>
      );
    })}
  </nav>
</div>

);
}
