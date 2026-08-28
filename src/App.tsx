import React from 'react';
import { useSecureDroid } from './hooks/useSecureDroid';

export default function App() {
    const { loading, connected, error, apps, risks, score, usingMock } = useSecureDroid();

    if (loading) {
        return <div style={{ color: 'white', padding: 20 }}>Loading...</div>;
    }

    return (
        <div style={{ color: 'white', padding: 20 }}>
            <h1>SecureDroid Test</h1>
            <p>Connected: {String(connected)}</p>
            <p>Using Mock: {String(usingMock)}</p>
            <p>Apps: {apps.length}</p>
            <p>Risks: {risks.length}</p>
            <p>Score: {score}</p>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}
