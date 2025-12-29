import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Player from '../player/Player';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-900 text-white font-sans antialiased">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`flex-1 flex flex-col h-full relative w-full transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-b from-gray-900 to-black flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                    {/* Spacer for fixed player */}
                    <Footer />
                    <div className="h-40"></div>
                </main>
                <Player />
            </div>
        </div>
    );
};

export default Layout;
