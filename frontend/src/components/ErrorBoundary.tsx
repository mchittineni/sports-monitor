import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-primary text-white p-4">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded p-6 max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Oops, something went wrong.</h2>
            <p className="mb-4 text-gray-300">
              The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-black bg-opacity-50 p-4 rounded overflow-auto max-h-48 mb-4">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              className="bg-accent hover:bg-blue-600 text-white py-2 px-4 rounded transition"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
