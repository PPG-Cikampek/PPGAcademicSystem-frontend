import React from "react";
import clearSiteData from "../../Utilities/clearSiteData";

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
                        <h2 className="text-2xl font-bold text-red-500 mb-4">
                            Terjadi Kesalahan
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Sistem mengalami kesalahan yang tidak terduga. Mohon
                            coba lagi atau hubungi tim ICT jika masalah
                            berlanjut. Sertakan screenshot dan kronologis
                            kejadian jika perlu.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="button-primary w-full"
                            >
                                Refresh Halaman
                            </button>
                            <button
                                onClick={() => {
                                    clearSiteData();
                                    window.location.href = "/";
                                }}
                                className="btn-neutral-outline w-full"
                            >
                                Bersihkan cache & Login Kembali
                            </button>
                        </div>
                        {/* {process.env.NODE_ENV === "development" && ( */}
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500">
                                Error Details
                            </summary>
                            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                {this.state.error?.stack.toString()}
                            </pre>
                        </details>
                        {/* )} */}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default RouteErrorBoundary;
