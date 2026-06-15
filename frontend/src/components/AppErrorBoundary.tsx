import React from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Style Studio crashed:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#090b12] text-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-lg border border-[#2a3148] bg-[#111625] p-6 shadow-2xl">
          <div className="mb-4 inline-flex rounded bg-red-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
            App Error
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            App Style Studio hit an unexpected screen error. Your saved themes are stored locally, so you can reload the app and keep working.
          </p>
          <div className="mt-4 rounded border border-[#252b3f] bg-[#090b12] p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Technical detail</p>
            <p className="mt-2 break-words font-mono text-xs text-gray-300">{this.state.error.message}</p>
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-95"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
