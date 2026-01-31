import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, LogIn, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = () => {
    const location = useLocation();
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        // Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile for sidebar:', error);
                return;
            }
            if (data) {
                setProfile(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

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
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#0f1419' }}>
                    <img src="/logo.svg" alt="CO56" style={{ height: '26px', width: '26px' }} />
                </Link>
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', flex: 1 }}>
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home size={26} fill={isActive('/') ? 'currentColor' : 'none'} />
                    <span>Anasayfa</span>
                </Link>
            </nav>

            {/* Bottom Profile / User Section (Twitter Style) */}
            {session ? (
                <Link to={profile?.username ? `/@${profile.username}` : "/profile"} className="user-pill" style={{
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
                    <div className="avatar" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#ccc',
                        backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>
                        {!profile?.avatar_url && (
                            <img
                                src={`https://ui-avatars.com/api/?name=${profile?.display_name || 'User'}&background=random`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                            />
                        )}
                    </div>
                    <div className="flex-col" style={{ flex: 1, overflow: 'hidden' }}>
                        <span className="font-bold text-sm truncate" style={{ display: 'block' }}>
                            {profile?.display_name || 'Kullanıcı'}
                        </span>
                        <span className="text-gray text-sm truncate" style={{ display: 'block' }}>
                            @{profile?.username || 'username'}
                        </span>
                    </div>
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
