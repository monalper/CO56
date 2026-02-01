import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';
import EndOfFeed from '../components/EndOfFeed';

const BookmarksPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        document.title = "Bookmarks | CO56";
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
            fetchBookmarks(session.user.id);
        } else {
            setLoading(false);
        }
    };

    const fetchBookmarks = async (userId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookmarks')
                .select(`
                    post_id,
                    posts:post_id (
                        *,
                        profiles (id, display_name, avatar_url, username),
                        post_images (id, image_url)
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map the result to get the post objects directly
            const bookmarkedPosts = data
                .map(item => item.posts)
                .filter(post => post !== null); // Filter out any nulls if post was deleted

            setPosts(bookmarkedPosts);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '0' }}>
            {/* Header Title */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #eff3f4',
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Bookmarks</h2>
                <p style={{ color: '#536471', fontSize: '13px', margin: '4px 0 0 0' }}>@{session?.user?.user_metadata?.username || 'user'}</p>
            </div>


            {/* Feed */}
            <div className="feed" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {loading ? (
                    <p className="text-gray" style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</p>
                ) : !session ? (
                    <p className="text-gray" style={{ textAlign: 'center', marginTop: '20px' }}>Please login to view bookmarks.</p>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px' }}>Save posts for later</h2>
                        <p style={{ color: '#536471', fontSize: '15px' }}>Bookmark posts to easily find them again in the future.</p>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                        <EndOfFeed />
                    </>
                )}
            </div>
        </div>
    );
};

export default BookmarksPage;
