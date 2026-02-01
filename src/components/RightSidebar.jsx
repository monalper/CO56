import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { LinkifiedText } from './LinkifiedText';

// --- Components ---

// 2. Who To Follow Widget Items
const WhoToFollowItem = ({ profile, currentUser }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            checkStatus();
        }
    }, [currentUser, profile]);

    const checkStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', currentUser.id)
                .eq('following_id', profile.id)
                .maybeSingle();

            if (!error && data) {
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Check follow status error:', error);
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!currentUser) return navigate('/login');

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', profile.id);

                if (error) throw error;
                setIsFollowing(false);
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert([{ follower_id: currentUser.id, following_id: profile.id }]);

                if (error) throw error;
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Handle follow error:', error);
            if (error.code === '42P01') {
                alert('Hata: "follows" tablosu bulunamadı.');
            } else if (error.code === '23505') {
                // Already following
                setIsFollowing(true);
            }
        }
    };

    return (
        <div
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
                onClick={handleFollow}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                    backgroundColor: isFollowing ? (isHovering ? '#ef444400' : '#fff') : '#0f1419',
                    color: isFollowing ? (isHovering ? '#ef4444' : '#0f1419') : '#fff',
                    border: isFollowing ? `1px solid ${isHovering ? '#ef4444' : '#cfd9de'}` : 'none',
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '100px',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                }}
            >
                {isFollowing ? (isHovering ? 'Takibi Bırak' : 'Takip Ediliyor') : 'Takip Et'}
            </button>
        </div>
    );
};

// Who To Follow Widget
const WhoToFollow = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);

                let query = supabase.from('profiles').select('*').limit(3);
                if (user) {
                    query = query.neq('id', user.id);
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
            <h3 className="widget-title">Who to follow</h3>
            <div className="flex-col" style={{ gap: '16px' }}>
                {users.map((profile) => (
                    <WhoToFollowItem key={profile.id} profile={profile} currentUser={currentUser} />
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
                Show more
            </Link>
        </div>
    );
};

// 3. Profile Info Widget (Sticky on Profile Pages)
const ProfileInfoWidget = () => {
    const { username: rawUsername } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const [isFollowing, setIsFollowing] = useState(false);
    const [isHoveringFollow, setIsHoveringFollow] = useState(false);
    const [stats, setStats] = useState({ following: 0, followers: 0, votes: 0 });

    const username = rawUsername?.startsWith('@') ? rawUsername.substring(1) : (rawUsername === 'profile' ? null : rawUsername);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (!username && rawUsername !== 'profile') {
            setProfile(null);
            return;
        }
        fetchProfile();
    }, [username, rawUsername]);

    useEffect(() => {
        if (currentUser && profile && currentUser.id !== profile.id) {
            checkFollowStatus(currentUser.id, profile.id);
        }

        if (profile) {
            const fetchStats = async () => {
                // Followers
                const { count: followers } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', profile.id);

                // Following
                const { count: following } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', profile.id);

                // Votes
                const { data: userPosts } = await supabase
                    .from('posts')
                    .select('id')
                    .eq('user_id', profile.id);

                let voteScore = 0;
                if (userPosts && userPosts.length > 0) {
                    const postIds = userPosts.map(p => p.id);

                    const { count: likes } = await supabase
                        .from('post_votes')
                        .select('*', { count: 'exact', head: true })
                        .in('post_id', postIds)
                        .eq('vote_type', 'like');

                    const { count: dislikes } = await supabase
                        .from('post_votes')
                        .select('*', { count: 'exact', head: true })
                        .in('post_id', postIds)
                        .eq('vote_type', 'dislike');

                    voteScore = (likes || 0) - (dislikes || 0);
                }

                setStats({ following: following || 0, followers: followers || 0, votes: voteScore });
            };
            fetchStats();
        }
    }, [currentUser, profile]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            let data, error;
            if (rawUsername === 'profile') {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const result = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    data = result.data;
                    error = result.error;
                }
            } else {
                const result = await supabase.from('profiles').select('*').eq('username', username).single();
                data = result.data;
                error = result.error;
            }

            if (data) setProfile(data);
        } catch (err) {
            console.error("Error fetching profile for sidebar:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async (followerId, followingId) => {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', followerId)
                .eq('following_id', followingId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Check follow error:', error);
            }

            setIsFollowing(!!data);
        } catch (error) {
            console.error('Check follow error:', error);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) return navigate('/login');

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', profile.id);

                if (error) throw error;
                setIsFollowing(false);
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert([{ follower_id: currentUser.id, following_id: profile.id }]);

                if (error) throw error;
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Handle follow error:', error);
            if (error.code === '42P01') {
                alert('Hata: "follows" tablosu bulunamadı.');
            } else if (error.code === '23505') {
                setIsFollowing(true);
            } else {
                alert(`İşlem sırasında bir hata oluştu: ${error.message || error.code}`);
            }
        }
    };

    if (!profile) return null;

    const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? ''
            : 'Joined ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="widget-box profile-sidebar-widget" style={{ marginBottom: '16px', background: 'rgba(235, 235, 235, 0.3)', padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
            {/* Banner / Cover Image */}
            <div style={{ width: '100%', height: '100px', backgroundColor: '#cfd9de', position: 'relative' }}>
                {profile?.cover_url ? (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1d9bf0, #8a2be2)' }} />
                )}
            </div>

            <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '-32px', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0, border: '4px solid #fff', background: '#fff', position: 'relative' }}>
                        <img
                            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name}&background=f3f4f6&color=6b7280`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile?.display_name}
                    </h2>
                    <span style={{ fontSize: '16px', color: '#536471' }}>
                        @{profile?.username}
                    </span>
                </div>

                {profile?.bio && (
                    <div style={{ fontSize: '15px', color: '#0f1419', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                        <LinkifiedText text={profile.bio} />
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#536471' }}>
                    {profile?.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} />
                            <span>{profile.location}</span>
                        </div>
                    )}
                    {profile?.website && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LinkIcon size={18} />
                            <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1d9bf0', textDecoration: 'none' }}>
                                {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} />
                        <span>{formatDate(profile?.created_at)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px', color: '#0f1419' }}>
                        <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }} className="hover-underline">
                            <span style={{ fontWeight: '700' }}>{stats.following}</span>
                            <span style={{ color: '#536471' }}>Following</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }} className="hover-underline">
                            <span style={{ fontWeight: '700' }}>{stats.followers}</span>
                            <span style={{ color: '#536471' }}>Followers</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontWeight: '700' }}>{stats.votes}</span>
                            <span style={{ color: '#536471' }}>Vote Score</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                    {isOwnProfile ? (
                        <button
                            onClick={() => navigate('/settings')}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #cfd9de',
                                borderRadius: '9999px',
                                fontWeight: '700',
                                fontSize: '15px',
                                background: '#fff',
                                color: '#0f1419',
                                cursor: 'pointer'
                            }}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={handleFollow}
                            onMouseEnter={() => setIsHoveringFollow(true)}
                            onMouseLeave={() => setIsHoveringFollow(false)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: isFollowing ? (isHoveringFollow ? '#ef444400' : '#fff') : '#0f1419',
                                color: isFollowing ? (isHoveringFollow ? '#ef4444' : '#0f1419') : '#fff',
                                border: isFollowing ? `1px solid ${isHoveringFollow ? '#ef4444' : '#cfd9de'}` : 'none',
                                borderRadius: '9999px',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: 'pointer'
                            }}
                        >
                            {isFollowing ? (isHoveringFollow ? 'Takibi Bırak' : 'Takip Ediliyor') : 'Takip Et'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <nav className="sidebar-footer">
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/cookies" className="footer-link">Cookie Policy</Link>
            <Link to="/accessibility" className="footer-link">Accessibility</Link>
            <Link to="/ads-info" className="footer-link">Ads Info</Link>
            <div className="footer-more">
                <span className="footer-link">More...</span>
            </div>
            <span className="footer-copyright">© {currentYear} CO56 Corp.</span>
        </nav>
    );
};

// --- Main Sidebar Component ---
const RightSidebar = () => {
    const { username } = useParams();
    const isProfilePage = username || window.location.pathname === '/profile' || window.location.pathname.startsWith('/@');

    return (
        <div style={{
            width: '350px',
            marginLeft: '30px',
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '66px',
            height: 'fit-content'
        }}>
            {isProfilePage && <ProfileInfoWidget />}
            <WhoToFollow />
            <Footer />

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
                    font-weight: 600;
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
                .sidebar-footer {
                    display: flex;
                    flex-wrap: wrap;
                    padding: 0 16px;
                    gap: 0 12px;
                    margin-top: 4px;
                }
                .footer-link {
                    color: var(--gray-500);
                    font-size: 13px;
                    line-height: 20px;
                    text-decoration: none;
                }
                .footer-link:hover {
                    text-decoration: underline;
                }
                .footer-copyright {
                    color: var(--gray-500);
                    font-size: 13px;
                    line-height: 20px;
                    width: 100%;
                    margin-top: 2px;
                }
                .footer-more {
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default RightSidebar;