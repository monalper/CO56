import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CirclePlus, MessageCircle } from 'lucide-react'; // Tam istediğin ikonlar
import { supabase } from '../lib/supabase';

const Header = () => {
    const location = useLocation();
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    const isProfileActive = profile?.username && location.pathname === `/@${profile.username}`;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) fetchProfile(session.user.id);
        });

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
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (data) setProfile(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMessageClick = (e) => {
        e.preventDefault();
        alert("Direkt mesaj özelliği yakında!");
    };

    return (
        <header className="desktop-header">
            <div className="header-inner">
                <div className="header-left">
                    <Link to="/" className="header-logo">
                        <img src="/logo.svg" alt="CO56" />
                    </Link>
                </div>

                <div className="header-center"></div>

                <div className="header-right">
                    {session ? (
                        <div className="nav-group">
                            {/* Mesaj İkonu */}
                            <button
                                onClick={handleMessageClick}
                                className="nav-icon-link"
                                title="Mesajlar"
                            >
                                <MessageCircle size={24} strokeWidth={1.75} color="#0f1419" />
                            </button>

                            {/* Oluştur İkonu (Circle Plus) */}
                            <Link
                                to="/create"
                                className="nav-icon-link"
                                title="Oluştur"
                            >
                                <CirclePlus size={26} strokeWidth={1.75} color="#0f1419" />
                            </Link>

                            {/* Profil */}
                            <Link
                                to={profile?.username ? `/@${profile.username}` : "/profile"}
                                className={`nav-profile-link ${isProfileActive ? 'active' : ''}`}
                            >
                                <div className="nav-avatar-wrapper">
                                    <div className="nav-avatar" style={{
                                        backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none',
                                    }}>
                                        {!profile?.avatar_url && (
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${profile?.display_name || 'User'}&background=random`}
                                                alt="Avatar"
                                            />
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <Link to="/admin/login" className="login-btn">
                            Giriş Yap
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
                .desktop-header {
                    width: 100%;
                    background: #fff;
                    border-bottom: 1px solid #eff3f4;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    display: none;
                }

                @media (min-width: 681px) {
                    .desktop-header { display: block; }
                }

                .header-inner {
                    max-width: 1365px;
                    margin: 0 auto;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                }

                .header-logo img { height: 26px; width: 26px; }

                /* Sağ Grup ve Eşit Boşluklar */
                .nav-group {
                    display: flex;
                    align-items: center;
                    gap: 8px; /* İkonlar arası eşit boşluk */
                }

                /* İkon Butonları Sabit Alan (Circle) */
                .nav-icon-link, .nav-profile-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px; /* Tıklama alanı genişletildi */
                    height: 44px;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                    cursor: pointer;
                    text-decoration: none;
                    border: none;
                    background: transparent;
                    padding: 0;
                }

                .nav-icon-link:hover, .nav-profile-link:hover, .nav-profile-link.active {
                    background-color: rgba(15, 20, 25, 0.1);
                }

                /* Avatar Boyutu ve Hizalama */
                .nav-avatar-wrapper {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .nav-avatar {
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    background-color: #cfd9de;
                }

                .nav-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .login-btn {
                    padding: 8px 16px;
                    border-radius: 9999px;
                    text-decoration: none;
                    color: #0f1419;
                    font-weight: 700;
                    font-size: 15px;
                }

                .login-btn:hover {
                    background-color: rgba(15, 20, 25, 0.1);
                }
            `}</style>
        </header>
    );
};

export default Header;