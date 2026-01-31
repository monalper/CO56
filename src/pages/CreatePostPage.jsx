import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CreatePost from '../components/CreatePost';

const CreatePostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const [profile, setProfile] = useState(null);
    const [editPost, setEditPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                navigate('/login');
                return;
            }

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setProfile(profileData);

            // Fetch Post if Editing
            if (postId) {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*, post_images(*)')
                    .eq('id', postId)
                    .single();

                if (!error && data) {
                    // Check if post belongs to current user
                    if (data.user_id !== session.user.id) {
                        alert('Bu gönderiyi düzenleme yetkiniz yok.');
                        navigate('/');
                        return;
                    }
                    setEditPost(data);
                }
            }

            setLoading(false);
        };
        fetchData();
    }, [navigate, postId]);

    const handlePostCreated = () => {
        if (postId) navigate(-1);
        else navigate('/');
    };

    if (loading) return null;

    return (
        <div className="container" style={{ padding: '0' }}>
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #eff3f4',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{postId ? 'Gönderiyi Düzenle' : 'Paylaşım Yap'}</h2>
            </div>

            <div style={{ padding: '16px' }}>
                <CreatePost onPostCreated={handlePostCreated} profile={profile} editPost={editPost} />
            </div>
        </div>
    );
};

export default CreatePostPage;
