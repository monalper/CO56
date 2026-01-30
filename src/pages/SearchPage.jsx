import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';
import { Search } from 'lucide-react';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchInput, setSearchInput] = useState(query);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles (id, display_name, avatar_url),
                    post_images (id, image_url)
                `)
                .ilike('content', `%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput });
        }
    };

    return (
        <div className="container" style={{ padding: '0' }}>
            {/* Search Header - Mobile Friendly */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray-200)',
                position: 'sticky',
                top: 0,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                zIndex: 10
            }}>
                <form onSubmit={onSubmit} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(235, 235, 235, 0.5)',
                    borderRadius: '9999px',
                    padding: '10px 16px'
                }}>
                    <Search size={20} style={{ color: 'var(--gray-500)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Paylaşımlarda ara..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '16px'
                        }}
                    />
                </form>
            </div>

            {/* Results */}
            <div style={{ padding: '0' }}>
                {query && (
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>
                        <span className="text-gray text-sm">"{query}" için sonuçlar</span>
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
                        Aranıyor...
                    </div>
                ) : query && posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : query ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Sonuç bulunamadı</div>
                        <div style={{ color: 'var(--gray-500)' }}>"{query}" için bir şey bulamadık.</div>
                    </div>
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
                        Aramak istediğiniz kelimeyi yazın
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
