import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, LogIn, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = () => {
    const location = useLocation();
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar-container" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '275px',
            padding: '4px 12px 12px 12px',
            position: 'sticky',
            top: 0,
            alignItems: 'flex-start'
        }}>
            {/* Logo */}
            <div style={{ padding: '12px', marginBottom: '4px' }}>
                <Link to="/" style={{ display: 'flex' }}>
                    <img src="/logo.svg" alt="CO56" style={{ height: '30px', width: 'auto' }} />
                </Link>
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', flex: 1 }}>
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home size={26} strokeWidth={isActive('/') ? 3 : 2} />
                    <span>Anasayfa</span>
                </Link>

                {/* Panel Link removed as requested for sidebar, but Login/Dash logic remains for routing access. 
                    If admin wants to access dashboard, they might need a direct link or hidden way if completely removed from UI.
                    User asked: "Panel linki olmamalı."
                    I will remove the visible link. If they are logged in, maybe show "Profil" which goes to dash?
                    Or just remove it completely from visual sidebar.
                */}

                {/* If session exists, maybe a Profile link creates a way to get to dash? 
                    Twitter has "Profile".
                    User said: "Bu site ... paylaşım yapacak olan tek kişi ben olacağım."
                    So access to dash is crucial. Maybe clicking User/Profile goes to Dash.
                */}
            </nav>

            {/* Bottom Profile / User Section (Twitter Style) */}
            {session ? (
                <Link to="/admin/dash" className="user-pill" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '9999px',
                    width: '100%',
                    textDecoration: 'none',
                    color: 'inherit',
                    marginBottom: '12px',
                    transition: 'background-color 0.2s'
                }}>
                    <div className="avatar" style={{ width: '40px', height: '40px', background: '#ccc' }}></div>
                    <div className="flex-col" style={{ flex: 1 }}>
                        <span className="font-bold text-sm">Alper Ercan</span>
                        <span className="text-gray text-sm">@alperercan</span>
                    </div>
                    <MoreHorizontal size={18} />
                </Link>
            ) : (
                <Link to="/admin/login" className="user-pill" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '9999px',
                    marginBottom: '12px',
                    width: '100%'
                }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} />
                    </div>
                    <span className="font-bold">Giriş Yap</span>
                </Link>
            )}

            <style>{`
                .user-pill:hover {
                    background-color: rgba(15, 20, 25, 0.1);
                }
            `}</style>
        </div>
    );
};

export default Sidebar;
