import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import { formatDate } from '../lib/utils';

const PostDetailPage = () => {
    const { username, postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [rootComments, setRootComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getSession();
        fetchPost();
        fetchComments();
        window.scrollTo(0, 0);
    }, [postId]);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles (id, display_name, username, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true }); // We'll sort via tree maybe, but asc is good for threads

            if (error) throw error;

            // Build Tree
            const commentMap = {};
            const roots = [];

            // Initialize map with replies array
            data.forEach(comment => {
                commentMap[comment.id] = { ...comment, replies: [] };
            });

            // Link parents and children
            data.forEach(comment => {
                if (comment.parent_id && commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
                } else {
                    roots.push(commentMap[comment.id]);
                }
            });

            // Optional: Sort replies descending (newest on top) or ascending (oldest on top)
            // Twitter style is usually replies by relevance or time. Let's stick to simple time asc/desc
            const sortComments = (list) => {
                list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first at root
                list.forEach(c => {
                    if (c.replies.length > 0) {
                        c.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Oldest first in threads/replies implies chronological conv? 
                        // Actually let's keeps it consistent: Newest first everywhere for now
                        sortComments(c.replies);
                    }
                });
            };

            sortComments(roots);

            setComments(data); // Raw data if needed
            setRootComments(roots);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

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
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const { error } = await supabase.from('posts').delete().eq('id', deletedId);
            if (error) throw error;
            navigate(-1);
        } catch (err) {
            alert('Silme hatası: ' + err.message);
        }
    };

    const handleEdit = (post) => {
        alert('Düzenleme işlevi şu anda Dashboard sayfasından yapılabilir.');
        navigate('/admin/dash');
    };

    const handleCreateComment = async (parentId = null, contentStr = null) => {
        const contentToSubmit = contentStr || newComment;
        if (!contentToSubmit.trim()) return;
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            const { error } = await supabase.from('comments').insert({
                content: contentToSubmit,
                post_id: postId,
                user_id: currentUser.id,
                parent_id: parentId
            });

            if (error) throw error;

            if (!parentId) setNewComment('');
            fetchComments(); // Refresh list
        } catch (err) {
            alert('Yorum eklenirken hata: ' + err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            fetchComments();
        } catch (err) {
            alert('Silme hatası: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ height: '100vh', color: 'var(--gray-500)' }}>
                <div className="flex-col items-center gap-2">
                    <p>Loading...</p>
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
                    Go Back
                </button>
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <h2 className="font-bold">Post not found.</h2>
                    <p className="text-gray">This post may have been removed or the URL may be incorrect.</p>
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
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Post</h2>
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

                {/* Reply Section */}
                <div style={{ padding: '16px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--gray-200)' }}>
                    <div className="avatar" style={{
                        width: '40px',
                        height: '40px',
                        flexShrink: 0,
                        backgroundImage: currentUser?.user_metadata?.avatar_url ? `url(${currentUser.user_metadata.avatar_url})` : 'url(https://ui-avatars.com/api/?name=User&background=random)',
                        backgroundSize: 'cover',
                        borderRadius: '50%'
                    }} />
                    <div className="flex-col" style={{ flex: 1 }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Post your reply"
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                fontSize: '18px',
                                minHeight: '60px',
                                background: 'transparent',
                                fontFamily: 'inherit'
                            }}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleCreateComment()}
                                style={{
                                    backgroundColor: '#1d9bf0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '9999px',
                                    padding: '8px 20px',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    opacity: newComment.trim() ? 1 : 0.5
                                }}
                                disabled={!newComment.trim()}
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div style={{ padding: '0 16px' }}>
                    {rootComments.length > 0 ? (
                        <div style={{ paddingBottom: '40px' }}>
                            {rootComments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onReply={handleCreateComment}
                                    onDelete={handleDeleteComment}
                                    currentUserId={currentUser?.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
                            <p className="text-gray">No replies yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* Additional detail page styles can go here */
            `}</style>
        </div>
    );
};

export default PostDetailPage;
