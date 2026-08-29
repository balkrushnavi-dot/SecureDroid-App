import React, { useState } from 'react';

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

const screens: { id: Screen; label: string }[] = [
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

function ScreenPage({
title,
description,
}: {
title: string;
description: string;
}) {
return (
<div
style={{
minHeight: '100%',
padding: '24px',
boxSizing: 'border-box',
}}
>
<div
style={{
maxWidth: '760px',
margin: '0 auto',
}}
>
<h1
style={{
margin: '0 0 8px',
fontSize: '28px',
fontWeight: 700,
color: '#f8fafc',
}}
>
{title}
</h1>

    <p
      style={{
        margin: 0,
        color: '#94a3b8',
        fontSize: '15px',
        lineHeight: 1.6,
      }}
    >
      {description}
    </p>
  </div>
</div>

);
}

function HomePage() {
return (
<div
style={{
padding: '24px',
boxSizing: 'border-box',
maxWidth: '760px',
margin: '0 auto',
}}
>
<div
style={{
marginBottom: '24px',
}}
>
<div
style={{
fontSize: '30px',
fontWeight: 800,
color: '#f8fafc',
}}
>
SecureDroid
</div>

    <div
      style={{
        marginTop: '6px',
        color: '#94a3b8',
        fontSize: '15px',
      }}
    >
      Security for your phone
    </div>
  </div>

  <div
    style={{
      padding: '24px',
      borderRadius: '20px',
      background: '#0f172a',
      border: '1px solid #1e293b',
      marginBottom: '16px',
    }}
  >
    <div
      style={{
        fontSize: '14px',
        color: '#34d399',
        fontWeight: 600,
        marginBottom: '8px',
      }}
    >
      APPLICATION RUNNING
    </div>

    <div
      style={{
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: 1.6,
      }}
    >
      SecureDroid UI is running successfully.
    </div>
  </div>

  <div
    style={{
      padding: '20px',
      borderRadius: '20px',
      background: '#0f172a',
      border: '1px solid #1e293b',
    }}
  >
    <div
      style={{
        color: '#f8fafc',
        fontSize: '17px',
        fontWeight: 700,
        marginBottom: '8px',
      }}
    >
      Native security services
    </div>

    <div
      style={{
        color: '#64748b',
        fontSize: '14px',
        lineHeight: 1.6,
      }}
    >
      Native Android security integration is currently isolated while
      startup stability is being verified.
    </div>
  </div>
</div>

);
}

function App() {
const [currentScreen, setCurrentScreen] =
useState<Screen>('home');

const renderScreen = () => {
switch (currentScreen) {
case 'home':
return <HomePage />;

  case 'apps':
    return (
      <ScreenPage
        title="App Security"
        description="Application security analysis will be connected after the stable UI is verified."
      />
    );

  case 'threats':
    return (
      <ScreenPage
        title="Threat Model"
        description="Threat analysis will be connected after the stable UI is verified."
      />
    );

  case 'network':
    return (
      <ScreenPage
        title="Network Protection"
        description="Network security controls will be connected after the stable UI is verified."
      />
    );

  case 'device':
    return (
      <ScreenPage
        title="Device Security"
        description="Device security checks will be connected after the stable UI is verified."
      />
    );

  case 'privacy':
    return (
      <ScreenPage
        title="Privacy Radar"
        description="Privacy analysis will be connected after the stable UI is verified."
      />
    );

  case 'log':
    return (
      <ScreenPage
        title="Security Audit Log"
        description="Security events will be connected after the stable UI is verified."
      />
    );

  case 'report':
    return (
      <ScreenPage
        title="Security Report"
        description="Security reporting will be connected after the stable UI is verified."
      />
    );

  case 'ai':
    return (
      <ScreenPage
        title="AI Assistant"
        description="The AI assistant will be connected after the stable UI is verified."
      />
    );

  case 'family':
    return (
      <ScreenPage
        title="Family Protection"
        description="Family protection will be connected after the stable UI is verified."
      />
    );

  case 'settings':
    return (
      <ScreenPage
        title="Settings"
        description="SecureDroid settings."
      />
    );

  default:
    return <HomePage />;
}

};

return (
<div
style={{
minHeight: '100vh',
background: '#020617',
color: '#f8fafc',
display: 'flex',
flexDirection: 'column',
fontFamily:
'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}}
>
<header
style={{
height: '64px',
flexShrink: 0,
display: 'flex',
alignItems: 'center',
padding: '0 20px',
borderBottom: '1px solid #1e293b',
background: '#020617',
boxSizing: 'border-box',
}}
>
<div
style={{
fontSize: '18px',
fontWeight: 700,
}}
>
SecureDroid
</div>
</header>

  <main
    style={{
      flex: 1,
      overflowY: 'auto',
      paddingBottom: '84px',
    }}
  >
    {renderScreen()}
  </main>

  <nav
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      background: 'rgba(2, 6, 23, 0.98)',
      borderTop: '1px solid #1e293b',
      zIndex: 100,
    }}
  >
    {screens.map(screen => {
      const active =
        currentScreen === screen.id;

      return (
        <button
          key={screen.id}
          type="button"
          onClick={() =>
            setCurrentScreen(screen.id)
          }
          style={{
            flex: '1 0 78px',
            height: '100%',
            border: 0,
            background: 'transparent',
            color: active
              ? '#38bdf8'
              : '#64748b',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {screen.label}
        </button>
      );
    })}
  </nav>
</div>

);
}

export default App;
