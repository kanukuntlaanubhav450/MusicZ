import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                    <h1 className="text-4xl font-bold mb-4 text-red-500">Oops!</h1>
                    <p className="text-xl mb-6">Something went wrong.</p>
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
