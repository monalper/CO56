import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link, useLocation } from 'react-router-dom';
import { CirclePlus, MessageCircle, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ---------------- SearchBox ---------------- */

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const { userId: urlUserId } = useParams();
    const [searchParams] = useSearchParams();
    const queryUserId = searchParams.get('user');
    const userId = urlUserId || queryUserId;

    const [profile, setProfile] = useState(null);
    const [useProfileFilter, setUseProfileFilter] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchProfile(userId);
            setUseProfileFilter(true);
        } else {
            setProfile(null);
            setUseProfileFilter(false);
        }
    }, [userId]);

    const fetchProfile = async (id) => {
        const { data } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, username')
            .eq('id', id)
            .single();
        if (data) setProfile(data);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        let url = `/search?q=${encodeURIComponent(query)}`;
        if (useProfileFilter && userId) url += `&user=${userId}`;
        navigate(url);
    };

    return (
        <form onSubmit={handleSearch} className="header-search-form">
            <Search size={18} className="text-gray" />

            {useProfileFilter && profile && (
                <div className="search-profile-filter">
                    <img
                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}`}
                        alt=""
                        className="filter-avatar"
                    />
                    <span className="filter-name">{profile.display_name}</span>
                    <button
                        type="button"
                        onClick={() => setUseProfileFilter(false)}
                        className="filter-remove"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <input
                type="text"
                placeholder={useProfileFilter ? "Profilde ara" : "Ara"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="header-search-input"
            />
        </form>
    );
};

/* ---------------- Header ---------------- */

const Header = () => {
    const location = useLocation();
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    const isProfileActive =
        profile?.username && location.pathname === `/@${profile.username}`;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) fetchProfile(session.user.id);
        });

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                if (session?.user) fetchProfile(session.user.id);
                else setProfile(null);
            });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (data) setProfile(data);
    };

    return (
        <header className="desktop-header">
            <div className="header-inner">
                <div className="header-left">
                    <Link to="/" className="header-logo">
                        <img src="/logo.svg" alt="CO56" />
                    </Link>
                </div>

                <div className="header-center">
                    <SearchBox />
                </div>

                <div className="header-right">
                    {session ? (
                        <div className="nav-group">
                            <button className="nav-icon-link" title="Mesajlar">
                                <MessageCircle size={22} strokeWidth={1.75} />
                            </button>

                            <Link to="/create" className="nav-icon-link" title="Oluştur">
                                <CirclePlus size={25} strokeWidth={1.6} />
                            </Link>

                            <Link
                                to={`/@${profile?.username}`}
                                className={`nav-profile-link ${isProfileActive ? 'active' : ''}`}
                            >
                                <div className="nav-avatar-wrapper">
                                    <div
                                        className="nav-avatar"
                                        style={{
                                            backgroundImage: profile?.avatar_url
                                                ? `url(${profile.avatar_url})`
                                                : 'none',
                                        }}
                                    >
                                        {!profile?.avatar_url && (
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${profile?.display_name || 'User'}`}
                                                alt=""
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
                    background: #ffffff; /* DÜZ ARKA PLAN */
                    border-bottom: 1px solid #eff3f4;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    display: none;
                }
                @media (min-width: 681px) { .desktop-header { display: block; } }

                .header-inner {
                    max-width: 1365px;
                    margin: 0 auto;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                }

                .header-left, .header-right {
                    width: 250px;
                    display: flex;
                    align-items: center;
                }

                .header-center {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    max-width: 600px;
                }

                .header-logo img { width: 26px; height: 26px; }

                /* Search */
                .header-search-form {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    max-width: 350px;
                    height: 40px;
                    padding: 0 16px;
                    border-radius: 9999px;
                    background: #f1f3f4; /* OPak arka plan */
                }

                .header-search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 15px;
                }

                /* Right Nav */
                .nav-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .nav-icon-link,
                .nav-profile-link {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .nav-icon-link:hover,
                .nav-profile-link:hover,
                .nav-profile-link.active {
                    background: rgba(15,20,25,.08);
                }

                .nav-avatar-wrapper {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    overflow: hidden;
                }

                .nav-avatar {
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                }

                .nav-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .login-btn {
                    padding: 8px 16px;
                    border-radius: 9999px;
                    font-weight: 700;
                }
            `}</style>
        </header>
    );
};

export default Header;
