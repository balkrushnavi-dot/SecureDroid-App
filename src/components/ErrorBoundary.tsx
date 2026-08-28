import React, { Component, ErrorInfo, ReactNode } from 'react';
import { XCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('SecureDroid Error Boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="max-w-md space-y-4">
                        <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto">
                            <XCircle className="w-8 h-8 text-rose-400" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Something went wrong</h1>
                        <p className="text-sm text-slate-400">
                            The app encountered an error. Please try reloading.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-left">
                                <p className="text-xs font-mono text-rose-400 break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <p className="text-xs font-mono text-slate-400 mt-1 break-all">
                                        {this.state.errorInfo.componentStack?.split('\n').slice(0, 3).join('\n')}
                                    </p>
                                )}
                            </div>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
