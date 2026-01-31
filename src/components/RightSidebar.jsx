import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, X } from 'lucide-react';

// --- Components ---

// 1. Search Box
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
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('display_name, avatar_url, username')
                .eq('id', id)
                .single();
            if (data) setProfile(data);
        } catch (err) {
            console.error("Error fetching profile for search box:", err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            let url = `/search?q=${encodeURIComponent(query)}`;
            if (useProfileFilter && userId) {
                url += `&user=${userId}`;
            }
            navigate(url);
        }
    };

    return (
        <form onSubmit={handleSearch} style={{
            background: 'rgba(235, 235, 235, 0.45)',
            borderRadius: '9999px',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0',
            minHeight: '45px'
        }}>
            <Search size={18} className="text-gray" style={{ flexShrink: 0 }} />

            {useProfileFilter && profile && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0f1419',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    gap: '6px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                }}>
                    <img
                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}&background=f3f4f6&color=6b7280`}
                        alt=""
                        style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                    />
                    <span style={{ fontWeight: '600', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.display_name}
                    </span>
                    <button
                        type="button"
                        onClick={() => setUseProfileFilter(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginLeft: '2px'
                        }}
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
                style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '15px',
                    padding: '8px 0'
                }}
            />
        </form>
    );
};

// 2. Who To Follow Widget
const WhoToFollow = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();

                let query = supabase.from('profiles').select('*').limit(3);
                if (currentUser) {
                    query = query.neq('id', currentUser.id);
                }

                const { data, error } = await query;
                if (error) throw error;
                setUsers(data || []);
            } catch (err) {
                console.error("Error fetching users for follow widget:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="widget-box">
                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="mini-spinner"></div>
                </div>
            </div>
        );
    }

    if (users.length === 0) return null;

    return (
        <div className="widget-box">
            <h3 className="widget-title">Kimi takip etmeli</h3>
            <div className="flex-col" style={{ gap: '16px' }}>
                {users.map((profile) => (
                    <div
                        key={profile.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                        }}
                    >
                        <Link
                            to={`/@${profile.username}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flex: 1,
                                overflow: 'hidden',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#eee',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                <img
                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}&background=f3f4f6&color=6b7280`}
                                    alt={profile.display_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span
                                    className="hover-underline"
                                    style={{
                                        fontWeight: '700',
                                        fontSize: '15px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {profile.display_name}
                                </span>
                                <span style={{ color: '#536471', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    @{profile.username}
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                navigate(`/@${profile.username}`);
                            }}
                            style={{
                                backgroundColor: '#0f1419',
                                color: 'white',
                                border: 'none',
                                padding: '6px 16px',
                                borderRadius: '9999px',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Takip et
                        </button>
                    </div>
                ))}
            </div>
            <Link
                to="/search"
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#1d9bf0',
                    fontSize: '15px',
                    padding: '12px 16px 0 16px',
                    margin: '0 -16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: 'calc(100% + 32px)',
                    textDecoration: 'none',
                    display: 'block',
                    borderRadius: '0 0 16px 16px'
                }}
                className="hover-bg-light"
            >
                Daha fazla göster
            </Link>
        </div>
    );
};

// --- Main Sidebar Component ---
const RightSidebar = () => {
    return (
        <div style={{
            width: '350px',
            marginLeft: '30px',
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '10px',
            height: 'fit-content'
        }}>
            <SearchBox />
            <WhoToFollow />

            <style>{`
                .widget-box {
                    background: transparent;
                    border-radius: 16px;
                    padding: 0 16px;
                    display: flex;
                    flex-direction: column;
                }
                .widget-title {
                    font-size: 20px;
                    font-weight: 800;
                    margin-bottom: 12px;
                }
                .mini-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ccc;
                    border-top-color: #1d9bf0;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .hover-underline:hover {
                    text-decoration: underline;
                }
                .hover-bg-light:hover {
                    background-color: rgba(15, 20, 25, 0.05);
                }
            `}</style>
        </div>
    );
};

export default RightSidebar;
