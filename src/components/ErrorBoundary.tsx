import React from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SecureDroid System Error Caught by Boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                SecureDroid Recovered Gracefully
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An isolated UI rendering exception was trapped by the operating system kernel boundary.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-left font-mono text-[11px] text-zinc-400 overflow-x-auto max-h-32">
                <span className="text-rose-400 font-bold block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                <span className="text-zinc-500 whitespace-pre-wrap text-[10px]">
                  {this.state.error.stack?.split('\n').slice(0, 3).join('\n')}
                </span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Session
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
