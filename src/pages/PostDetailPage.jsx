import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import { formatDate } from '../lib/utils';

const PostDetailPage = () => {
    const { username, postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
        window.scrollTo(0, 0);
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles (id, display_name, avatar_url, username),
                    post_images (id, image_url)
                `)
                .eq('id', postId)
                .single();

            if (error) throw error;
            setPost(data);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deletedId) => {
        if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase.from('posts').delete().eq('id', deletedId);
            if (error) throw error;
            navigate(-1);
        } catch (err) {
            alert('Silme hatası: ' + err.message);
        }
    };

    const handleEdit = (post) => {
        // Since we don't have a dedicated edit page, 
        // we might want to navigate to dashboard and trigger edit there, 
        // but for now let's just show an alert or placeholder.
        alert('Düzenleme özelliği şimdilik Dashboard sayfasından yapılabilir.');
        navigate('/admin/dash');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ height: '100vh', color: 'var(--gray-500)' }}>
                <div className="flex-col items-center gap-2">
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container" style={{ padding: '20px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                    style={{ marginBottom: '20px', color: 'var(--blue)' }}
                >
                    <ChevronLeft size={20} />
                    Geri Dön
                </button>
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <h2 className="font-bold">Gönderi bulunamadı.</h2>
                    <p className="text-gray">Bu paylaşım kaldırılmış veya URL hatalı olabilir.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '0' }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray-200)'
            }}>
                <button onClick={() => navigate(-1)} className="hover-gray" style={{ borderRadius: '50%', padding: '8px' }}>
                    <ChevronLeft size={20} />
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Paylaşım</h2>
            </div>

            {/* Post Content */}
            <div className="post-detail-container">
                {/* We use PostCard but maybe we want a "premium" detail view? 
                    For now, let's use PostCard as requested but we could also build a custom one.
                    The user said "PostDetailPage bileşenini oluştur", so I'll make it look good.
                */}
                <div style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <PostCard post={post} isDetailView={true} onEdit={handleEdit} onDelete={handleDelete} />
                </div>

                {/* Reply Section Placeholder */}
                <div style={{ padding: '16px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="avatar" style={{
                        width: '40px',
                        height: '40px',
                        flexShrink: 0
                    }} />
                    <div className="flex-col" style={{ flex: 1 }}>
                        <textarea
                            placeholder="Yanıtını paylaş..."
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                fontSize: '18px',
                                minHeight: '60px',
                                background: 'transparent'
                            }}
                        />
                        <div className="flex justify-end">
                            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '15px' }}>Yanıtla</button>
                        </div>
                    </div>
                </div>

                {/* Replies Placeholder */}
                <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
                    <p className="text-gray">Henüz yanıt yok.</p>
                </div>
            </div>

            <style>{`
                /* Additional detail page styles can go here */
            `}</style>
        </div>
    );
};

export default PostDetailPage;
