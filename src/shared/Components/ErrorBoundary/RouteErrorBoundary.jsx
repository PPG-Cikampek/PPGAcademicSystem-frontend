import React from "react";

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
        window.location.reload();
    };

    handleClearAndLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col justify-center items-center bg-gray-50 h-screen">
                    <div className="bg-white shadow-md p-8 rounded-lg max-w-md text-center">
                        <div className="mb-4 text-red-500 text-6xl">⚠️</div>
                        <h2 className="mb-4 font-bold text-red-500 text-2xl">
                            Terjadi Kesalahan
                        </h2>
                        <p className="mb-6 text-gray-600">
                            Sistem mengalami kesalahan yang tidak terduga. Mohon
                            coba lagi atau hubungi tim ICT jika masalah
                            berlanjut. Sertakan screenshot dan kronologis
                            kejadian jika perlu.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full button-primary"
                            >
                                Refresh Halaman
                            </button>
                            <button
                                onClick={this.handleClearAndLogout}
                                className="btn-neutral-outline w-full"
                            >
                                Bersihkan cache & Login Kembali
                            </button>
                        </div>
                        <details className="mt-4 text-left">
                            <summary className="text-gray-500 text-sm cursor-pointer">
                                Error Details
                            </summary>
                            <pre className="bg-red-50 mt-2 p-2 rounded overflow-auto text-red-600 text-xs">
                                {this.state.error?.stack.toString()}
                            </pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default RouteErrorBoundary;
