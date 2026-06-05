import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught react render error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    localStorage.removeItem('negociord_local_user'); // Clear potential corrupt session
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-xs text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            
            <h1 className="text-xl font-bold text-gray-950 mb-2">Algo salió mal</h1>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              La aplicación experimentó un error inesperado al renderizar. Por favor, intenta recargar la página o volver al inicio.
            </p>

            {this.state.error && (
              <pre className="p-3.5 bg-gray-50 text-left text-[10px] font-mono text-gray-600 rounded-xl mb-6 overflow-auto max-h-32 leading-relaxed border border-gray-150">
                {this.state.error.toString()}
              </pre>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-[#0F766E] hover:bg-opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <RefreshCw size={14} />
                Recargar página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-750 border border-gray-250 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home size={14} />
                Ir al inicio de la web
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
