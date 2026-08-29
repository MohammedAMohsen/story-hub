import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[9999] bg-surface flex items-center justify-center p-6 overflow-auto">
          <div className="max-w-2xl w-full bg-surface-container-lowest border border-error/30 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-error text-[28px]">bug_report</span>
              <h1 className="font-headline-md text-headline-md text-on-surface">A real application error occurred</h1>
            </div>
            <p className="text-body-md text-on-surface-variant mb-4">
              Take a screenshot of this content and send it — it has all the details needed to pinpoint the cause of the problem.
            </p>
            <div className="bg-surface-container rounded-xl p-4 mb-4">
              <p className="text-error font-bold text-sm mb-2">{this.state.error.name}: {this.state.error.message}</p>
              <pre className="text-xs text-on-surface-variant whitespace-pre-wrap overflow-auto max-h-64">
                {this.state.error.stack}
              </pre>
            </div>
            {this.state.errorInfo && (
              <div className="bg-surface-container rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-on-surface-variant mb-2">Where exactly it happened (Component Stack):</p>
                <pre className="text-xs text-on-surface-variant whitespace-pre-wrap overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-sm hover:opacity-90 transition-opacity"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
