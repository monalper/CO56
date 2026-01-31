import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar-container" style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 56px)',
            width: '275px',
            padding: '12px',
            position: 'sticky',
            top: '56px',
            alignItems: 'flex-start'
        }}>
            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', flex: 1 }}>
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home size={26} fill={isActive('/') ? 'currentColor' : 'none'} />
                    <span>Anasayfa</span>
                </Link>
            </nav>

            <style>{`
                /* styles remain if needed */
            `}</style>
        </div>
    );
};

export default Sidebar;
