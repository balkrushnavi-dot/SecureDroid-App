import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function showFatalError(message: string, error?: unknown) {
    console.error('[SecureDroid] Fatal startup error:', error);

    const root = document.getElementById('root');

    if (root) {
        root.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#020617;
                color:#fff;
                font-family:system-ui,sans-serif;
                padding:24px;
                box-sizing:border-box;
            ">
                <div style="max-width:520px;text-align:center">
                    <div style="
                        width:56px;
                        height:56px;
                        margin:0 auto 20px;
                        border-radius:50%;
                        background:#7f1d1d;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:28px;
                    ">!</div>

                    <h1 style="margin:0 0 12px;font-size:24px">
                        SecureDroid failed to start
                    </h1>

                    <p style="
                        color:#94a3b8;
                        font-size:14px;
                        line-height:1.6;
                        margin-bottom:20px;
                    ">
                        ${message}
                    </p>

                    <button
                        onclick="location.reload()"
                        style="
                            border:0;
                            border-radius:12px;
                            padding:12px 20px;
                            background:#0ea5e9;
                            color:white;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        `;
    }
}

window.addEventListener('error', (event) => {
    console.error(
        '[SecureDroid] Global error:',
        event.error || event.message
    );
});

window.addEventListener('unhandledrejection', (event) => {
    console.error(
        '[SecureDroid] Unhandled promise rejection:',
        event.reason
    );
});

const rootElement = document.getElementById('root');

if (!rootElement) {
    showFatalError('The #root element was not found.');
    throw new Error('SecureDroid: #root element was not found');
}

try {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
} catch (error) {
    showFatalError(
        error instanceof Error
            ? error.message
            : 'An unknown application startup error occurred.',
        error
    );
}
