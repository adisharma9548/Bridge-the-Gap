import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error in Setu UI:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('setu_terms_accepted');
      localStorage.removeItem('setu_auth_token');
      localStorage.removeItem('setu_auth_user');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 text-text-primary font-sans">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl shadow-subtle p-6 sm:p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-semantic-error-soft text-semantic-error flex items-center justify-center mx-auto border border-semantic-error/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                An unexpected interface issue occurred. You can reload the page or return to the welcome screen.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-surface-raised border border-border rounded-xl p-3 text-xs font-mono text-text-muted overflow-auto max-h-36">
                <summary className="font-bold text-text-secondary cursor-pointer hover:text-text-primary">
                  Technical Details
                </summary>
                <p className="mt-2 text-semantic-error font-semibold whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer border-b-2 border-aubergine-hover"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary border border-border text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-aubergine" />
                <span>Welcome Screen</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
