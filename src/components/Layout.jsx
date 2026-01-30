import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { Home, Search } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <>
            <div className="main-layout">
                <header className="sidebar-wrapper">
                    <Sidebar />
                </header>
                <main className="content-area">
                    {/* Mobile Header - Logo centered */}
                    <div className="mobile-header">
                        <Link to="/">
                            <img src="/logo.svg" alt="CO56" />
                        </Link>
                    </div>

                    <Outlet />
                </main>
                <div className="right-sidebar-wrapper">
                    <RightSidebar />
                </div>
            </div>

            {/* Bottom Navigation - Mobile Only */}
            <nav className="bottom-nav">
                <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home size={26} strokeWidth={isActive('/') ? 2.5 : 2} />
                </Link>
                <Link to="/search" className={`bottom-nav-item ${isActive('/search') ? 'active' : ''}`}>
                    <Search size={26} strokeWidth={isActive('/search') ? 2.5 : 2} />
                </Link>
            </nav>
        </>
    );
};

export default Layout;
