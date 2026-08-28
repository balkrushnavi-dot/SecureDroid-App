import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
//abc
if (!rootElement) {
    document.body.innerHTML = `
        <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#020617;
            color:white;
            font-family:system-ui,sans-serif;
            padding:24px;
            box-sizing:border-box;
        ">
            <div style="max-width:480px;text-align:center">
                <h1>SecureDroid</h1>
                <p>Application startup failed: root element was not found.</p>
            </div>
        </div>
    `;
    throw new Error('SecureDroid: #root element was not found');
}

window.addEventListener('error', (event) => {
    console.error('[SecureDroid] Global error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[SecureDroid] Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
