import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { LinkifiedText } from '../components/LinkifiedText';

const UserProfiles = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const navigate = useNavigate();
    const { username: rawUsername } = useParams();
    const username = rawUsername?.startsWith('@') ? rawUsername.substring(1) : rawUsername;

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            let profileData = null;
            let profileError = null;

            if (username && username !== 'profile') {
                // Fetch by username
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .single();
                profileData = data;
                profileError = error;
            } else if (currentUser) {
                // Own profile from /profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                profileData = data;
                profileError = error;
            } else {
                navigate('/admin/login');
                return;
            }

            if (profileError) {
                console.error("Profile fetch error:", profileError);
            }

            if (profileData) {
                setProfile(profileData);
                document.title = `${profileData.display_name} (@${profileData.username}) | CO56`;

                // Fetch Posts
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles (id, display_name, avatar_url, username),
                        post_images (id, image_url)
                    `)
                    .eq('user_id', profileData.id)
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;
                setPosts(postsData || []);
            }

            setUser(currentUser);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? ''
            : date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) + ' tarihinde katıldı';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="spinner"></div>
                <style>{`.spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #1d9bf0; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#536471' }}>
                <h3>Profil bulunamadı</h3>
                <p>Bu kullanıcı mevcut değil veya silinmiş olabilir.</p>
                <button onClick={() => navigate('/')} style={{ color: '#1d9bf0', marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Anasayfaya dön</button>
            </div>
        );
    }

    const isOwnProfile = user && profile && user.id === profile.id;

    return (
        <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
            {/* 2. Profile Info Area - Hidden on Desktop, shown on Mobile */}
            <div className="mobile-only" style={{ padding: '0 1rem 1rem 1rem', position: 'relative' }}>

                {/* Mobile Cover Image */}
                <div style={{ width: '100%', height: '140px', backgroundColor: '#cfd9de', margin: '0 -1rem', width: 'calc(100% + 2rem)' }}>
                    {profile.cover_url ? (
                        <img
                            src={profile.cover_url}
                            alt="Cover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1d9bf0, #8a2be2)' }} />
                    )}
                </div>

                {/* Avatar + Edit/Follow Button Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-10%' }}>
                    {/* Avatar */}
                    <div style={{ padding: '4px', background: '#fff', borderRadius: '50%' }}>
                        <div style={{ width: '134px', height: '134px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#eee' }}>
                            <img
                                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}&background=f3f4f6&color=6b7280`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginBottom: '1rem' }}>
                        {isOwnProfile ? (
                            <button
                                onClick={() => navigate('/settings')}
                                style={{
                                    padding: '0.5rem 1rem', border: '1px solid #cfd9de', borderRadius: '9999px',
                                    fontWeight: '700', fontSize: '15px', background: '#fff', color: '#0f1419', cursor: 'pointer'
                                }}
                                className="hover-bg-dark"
                            >
                                Profili Düzenle
                            </button>
                        ) : (
                            <button style={{
                                padding: '0.5rem 1.5rem', background: '#0f1419', color: '#fff',
                                borderRadius: '9999px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer'
                            }}>
                                Takip Et
                            </button>
                        )}
                    </div>
                </div>

                {/* Text Info */}
                <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', lineHeight: 1.2, margin: 0 }}>
                            {profile.display_name}
                        </h1>
                        <span style={{ fontSize: '15px', color: '#536471' }}>
                            @{profile.username || 'user'}
                        </span>
                    </div>

                    {profile.bio && (
                        <div style={{ marginTop: '0.75rem', fontSize: '15px', color: '#0f1419', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            <LinkifiedText text={profile.bio} />
                        </div>
                    )}

                    {/* Meta Info Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '14px', color: '#536471', marginTop: '0.75rem' }}>
                        {profile.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={18} />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <LinkIcon size={18} />
                                <a
                                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#1d9bf0', textDecoration: 'none' }}
                                >
                                    {profile.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                                </a>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={18} />
                            <span>{formatDate(profile.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eff3f4', marginTop: '0.5rem' }}>
                {['Gönderiler', 'Yanıtlar', 'Medya', 'Beğeniler'].map((tab) => {
                    const tabKey = tab === 'Gönderiler' ? 'posts' : tab.toLowerCase();
                    const isActive = activeTab === tabKey;

                    return (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tabKey)}
                            className="hover-bg"
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                padding: '1rem 0',
                                cursor: 'pointer',
                                position: 'relative',
                                color: isActive ? '#0f1419' : '#536471',
                                fontWeight: isActive ? '700' : '500',
                                fontSize: '15px'
                            }}
                        >
                            {tab}
                            {isActive && (
                                <div style={{
                                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                                    width: '56px', height: '4px', backgroundColor: '#1d9bf0', borderRadius: '4px'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 4. Feed */}
            <div style={{ minHeight: '200px' }}>
                {posts.length > 0 ? (
                    <div>
                        {activeTab === 'posts' && posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                        {activeTab !== 'posts' && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#536471' }}>
                                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Henüz içerik yok</span>
                                <span style={{ fontSize: '0.9rem' }}>Bu özellik yakında eklenecek.</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#536471' }}>
                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Henüz gönderi yok</span>
                        <span style={{ fontSize: '0.9rem' }}>Paylaşılan gönderiler burada görünecektir.</span>
                    </div>
                )}
            </div>

            <style>{`
                .hover-bg:hover { background-color: rgba(15, 20, 25, 0.1); transition: background-color 0.2s; }
                .hover-bg-dark:hover { background-color: rgba(15, 20, 25, 0.05); }
            `}</style>
        </div>
    );
};

export default UserProfiles;
