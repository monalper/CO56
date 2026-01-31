import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import Header from './Header';
import { Home, Search, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Layout = () => {
    const location = useLocation();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('avatar_url, display_name, username')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            }
        };

        fetchProfile();

        // Optional: Listen for profile changes if needed, 
        // but for now simple fetch on mount is fine.
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
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
                    <Home
                        size={26}
                        strokeWidth={isActive('/') ? 2.5 : 2}
                        fill={isActive('/') ? 'currentColor' : 'none'}
                    />
                </Link>
                <Link to="/search" className={`bottom-nav-item ${isActive('/search') ? 'active' : ''}`}>
                    <Search
                        size={26}
                        strokeWidth={isActive('/search') ? 2.5 : 2}
                        fill={isActive('/search') ? 'currentColor' : 'none'}
                    />
                </Link>
                <Link to="/create" className={`bottom-nav-item ${isActive('/create') ? 'active' : ''}`}>
                    <PlusCircle
                        size={26}
                        strokeWidth={isActive('/create') ? 2.5 : 2}
                        fill={isActive('/create') ? 'currentColor' : 'none'}
                    />
                </Link>
                <Link to={profile?.username ? `/@${profile.username}` : "/profile"} className={`bottom-nav-item ${location.pathname.startsWith('/@') || isActive('/profile') ? 'active' : ''}`}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: (location.pathname.startsWith('/@') || isActive('/profile')) ? '2px solid #0f1419' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#eee'
                    }}>
                        <img
                            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name || 'User'}&background=random`}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </Link>
            </nav>
        </div>
    );
};

export default Layout;
