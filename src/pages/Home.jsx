import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select(`
          *,
          profiles (id, display_name, avatar_url),
          post_images (id, image_url)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>


            {/* Feed */}
            <div className="feed" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {loading ? (
                    <p className="text-gray" style={{ textAlign: 'center' }}>Yükleniyor...</p>
                ) : posts.length === 0 ? (
                    <p className="text-gray" style={{ textAlign: 'center' }}>Henüz paylaşım yok.</p>
                ) : (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
