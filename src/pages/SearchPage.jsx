import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';
import { Search, X } from 'lucide-react';
import EndOfFeed from '../components/EndOfFeed';

const AccountCard = ({ profile }) => {
    return (
        <Link
            to={`/@${profile.username}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 0.2s'
            }}
            className="hover-bg-light"
        >
            <div style={{
                width: '48px',
                height: '48px',
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
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <span style={{ fontWeight: '700', fontSize: '15px' }}>{profile.display_name}</span>
                <span style={{ color: '#536471', fontSize: '15px' }}>@{profile.username}</span>
            </div>
        </Link>
    );
};

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const userFilter = searchParams.get('user') || '';
    const [searchInput, setSearchInput] = useState(query);
    const [posts, setPosts] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'accounts'
    const [filterProfile, setFilterProfile] = useState(null);

    useEffect(() => {
        document.title = query ? `${query} - Explore | CO56` : "Explore | CO56";
        if (query) {
            handleSearch();
        } else {
            setPosts([]);
            setProfiles([]);
        }

        if (userFilter) {
            fetchFilterProfile(userFilter);
        } else {
            setFilterProfile(null);
        }
    }, [query, userFilter]);

    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    const fetchFilterProfile = async (id) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', id)
                .single();
            if (data) setFilterProfile(data);
        } catch (err) {
            console.error("Error fetching filter profile:", err);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            // Search Posts
            let postsQuery = supabase
                .from('posts')
                .select(`
                    *,
                    profiles (id, display_name, avatar_url, username),
                    post_images (id, image_url)
                `)
                .ilike('content', `%${query}%`);

            if (userFilter) {
                postsQuery = postsQuery.eq('user_id', userFilter);
            }

            const postsPromise = postsQuery.order('created_at', { ascending: false });

            // Search Accounts - only if no user filter
            let profilesPromise;
            if (userFilter) {
                profilesPromise = Promise.resolve({ data: [] });
            } else {
                profilesPromise = supabase
                    .from('profiles')
                    .select('*')
                    .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
                    .limit(20);
            }

            const [postsRes, profilesRes] = await Promise.all([postsPromise, profilesPromise]);

            if (postsRes.error) throw postsRes.error;
            if (profilesRes.error && !userFilter) throw profilesRes.error;

            setPosts(postsRes.data || []);
            setProfiles(profilesRes.data || []);

            // Auto-switch to accounts tab if no posts but profiles found
            if (postsRes.data?.length === 0 && profilesRes.data?.length > 0 && !userFilter) {
                setActiveTab('accounts');
            } else {
                setActiveTab('posts');
            }

        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            const params = { q: searchInput };
            if (userFilter) params.user = userFilter;
            setSearchParams(params);
        }
    };

    const clearUserFilter = () => {
        const params = { q: query };
        setSearchParams(params);
    };

    return (
        <div className="container" style={{ padding: '0', minHeight: '100vh', background: '#fff' }}>
            {/* Header Title */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #eff3f4',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Explore</h2>
            </div>

            {/* Search Header */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray-200)',
                background: '#fff',
                zIndex: 10
            }}>
                <form onSubmit={onSubmit} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(235, 235, 235, 0.5)',
                    borderRadius: '9999px',
                    padding: '6px 16px',
                    marginBottom: '12px',
                    minHeight: '45px'
                }}>
                    <Search size={20} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />

                    {userFilter && filterProfile && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#0f1419',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            gap: '8px',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}>
                            <img
                                src={filterProfile.avatar_url || `https://ui-avatars.com/api/?name=${filterProfile.display_name}&background=f3f4f6&color=6b7280`}
                                alt=""
                                style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                            />
                            <span style={{ fontWeight: '600', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {filterProfile.display_name}
                            </span>
                            <button
                                type="button"
                                onClick={clearUserFilter}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder={userFilter ? "Search in profile" : "Search..."}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '16px',
                            padding: '8px 0'
                        }}
                    />
                </form>

                {/* Tabs */}
                {query && (
                    <div style={{ display: 'flex', marginTop: '4px' }}>
                        {[
                            { id: 'posts', label: 'Posts' },
                            { id: 'accounts', label: 'People' }
                        ].map((tab) => {
                            if (userFilter && tab.id === 'accounts') return null;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 0',
                                        border: 'none',
                                        background: 'none',
                                        fontSize: '15px',
                                        fontWeight: activeTab === tab.id ? '700' : '500',
                                        color: activeTab === tab.id ? '#0f1419' : '#536471',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '40px',
                                            height: '4px',
                                            backgroundColor: '#1d9bf0',
                                            borderRadius: '4px'
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Results */}
            <div style={{ padding: '0' }}>
                {loading ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
                        Searching...
                    </div>
                ) : query ? (
                    <div>
                        {activeTab === 'posts' ? (
                            posts.length > 0 ? (
                                <>
                                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                                    <EndOfFeed />
                                </>
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No results found</div>
                                    <div style={{ color: 'var(--gray-500)' }}>
                                        {userFilter
                                            ? `We couldn't find "${query}" in this profile.`
                                            : `We couldn't find any posts containing "${query}".`
                                        }
                                    </div>
                                </div>
                            )
                        ) : (
                            profiles.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {profiles.map(profile => <AccountCard key={profile.id} profile={profile} />)}
                                </div>
                            ) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No accounts found</div>
                                    <div style={{ color: 'var(--gray-500)' }}>We couldn't find any accounts matching "${query}".</div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
                        Type a keyword or username to search
                    </div>
                )}
            </div>

            <style>{`
                .hover-bg-light:hover {
                    background-color: rgba(15, 20, 25, 0.05);
                }
            `}</style>
        </div>
    );
};

export default SearchPage;