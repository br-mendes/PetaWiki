import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 m-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600 text-center mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="w-full bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium">Detalhes do Erro</summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}