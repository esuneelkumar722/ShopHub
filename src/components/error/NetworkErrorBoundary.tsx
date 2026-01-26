import { Component, ReactNode } from 'react';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface NetworkErrorBoundaryProps {
  children: ReactNode;
}

interface NetworkErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

export class NetworkErrorBoundary extends Component<
  NetworkErrorBoundaryProps,
  NetworkErrorBoundaryState
> {
  constructor(props: NetworkErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isOffline: !navigator.onLine
    };
  }

  static getDerivedStateFromError(error: Error): Partial<NetworkErrorBoundaryState> {
    // Check if it's a network error
    const isNetworkError =
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'NetworkError';

    return {
      hasError: isNetworkError,
      error: isNetworkError ? error : null
    };
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
    // Auto retry when coming back online
    if (this.state.hasError) {
      this.handleRetry();
    }
  };

  handleOffline = () => {
    this.setState({ isOffline: true, hasError: true });
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError || this.state.isOffline) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              {this.state.isOffline ? (
                <div className="p-6 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <WifiOff className="w-16 h-16 text-red-600 dark:text-red-400" />
                </div>
              ) : (
                <div className="p-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <AlertTriangle className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
                </div>
              )}
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {this.state.isOffline ? 'No Internet Connection' : 'Network Error'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {this.state.isOffline
                ? 'Please check your internet connection and try again.'
                : 'Unable to connect to the server. Please check your connection and try again.'}
            </p>

            {/* Error Details (if available) */}
            {this.state.error && !this.state.isOffline && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Retry Button */}
            <button
              onClick={this.handleRetry}
              disabled={this.state.isOffline}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-5 h-5" />
              {this.state.isOffline ? 'Waiting for Connection...' : 'Try Again'}
            </button>

            {/* Connection Status */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Status:{' '}
                <span
                  className={`font-medium ${
                    this.state.isOffline
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {this.state.isOffline ? 'Offline' : 'Online'}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
