import React from "react";
import LoadingCircle from "../UIElements/LoadingCircle";

class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error(
            "Route Error Boundary caught an error:",
            error,
            errorInfo
        );
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        // Refresh the page to reset the app state
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            An error occurred while loading the application.
                            This might be due to a routing issue or corrupted
                            session data.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Reload Application
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = "/";
                                }}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                                Clear Data & Restart
                            </button>
                        </div>
                        {process.env.NODE_ENV === "development" && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error Details (Dev Only)
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                    {this.state.error?.toString()}
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

export default RouteErrorBoundary;
