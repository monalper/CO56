import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';


const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        document.title = "Anasayfa | CO56";
        fetchPosts();
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setProfile(profileData);
        }
    };

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
        <div className="container" style={{ padding: '0' }}>
            {/* Header Title */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #eff3f4',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Akış</h2>
            </div>


            {/* Feed */}
            <div className="feed" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {loading ? (
                    <p className="text-gray" style={{ textAlign: 'center', marginTop: '20px' }}>Yükleniyor...</p>
                ) : posts.length === 0 ? (
                    <p className="text-gray" style={{ textAlign: 'center', marginTop: '20px' }}>Henüz paylaşım yok.</p>
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
