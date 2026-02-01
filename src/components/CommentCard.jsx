import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CommentCard = ({ comment, onDelete }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUserId(session?.user?.id || null);
        };
        getSession();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const goToPost = (e) => {
        const postAuthorUsername = comment.posts?.profiles?.username || 'user';
        const postId = comment.post_id;
        navigate(`/@${postAuthorUsername}/status/${postId}`);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setShowMenu(false);

        if (onDelete) {
            onDelete(comment.id);
        } else {
            // Fallback if no handler provided (e.g. direct component usage)
            if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
            try {
                const { error } = await supabase.from('comments').delete().eq('id', comment.id);
                if (error) throw error;
                // Since this is a card, we might need to refresh parent or hide self.
                // Ideally parent passes onDelete to handle state update.
                window.location.reload();
            } catch (err) {
                alert('Silme hatası: ' + err.message);
            }
        }
    };

    const isOwner = currentUserId === comment.user_id;

    return (
        <div
            onClick={goToPost}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: '16px',
                borderBottom: '1px solid var(--gray-200)',
                cursor: 'pointer',
                backgroundColor: isHovered ? 'rgba(0,0,0,0.02)' : 'transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                gap: '12px',
                position: 'relative'
            }}
        >
            {/* Sol Taraf: Avatar */}
            <div style={{ flexShrink: 0 }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundImage: `url(${comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.display_name || 'User'}&background=random`})`,
                    backgroundSize: 'cover',
                }} />
            </div>

            {/* Sağ Taraf: İçerik */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', color: '#0f1419' }}>
                            {comment.profiles?.display_name || 'User'}
                        </span>
                        <span style={{ color: '#536471', fontSize: '15px' }}>
                            @{comment.profiles?.username}
                        </span>
                        <span style={{ color: '#536471', fontSize: '15px' }}>·</span>
                        <span style={{ color: '#536471', fontSize: '15px' }}>
                            {formatDate(comment.created_at)}
                        </span>
                    </div>

                    {/* Menu Button (Only for owner) */}
                    {isOwner && (
                        <div style={{ position: 'relative' }} ref={menuRef} onClick={e => e.stopPropagation()}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                style={{
                                    color: 'var(--gray-400)',
                                    padding: '4px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                                className="hover-bg-light"
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {showMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--gray-200)',
                                    zIndex: 10,
                                    minWidth: '150px',
                                    overflow: 'hidden',
                                    marginTop: '4px'
                                }}>
                                    <button
                                        onClick={handleDelete}
                                        className="dropdown-item"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            width: '100%',
                                            fontSize: '14px',
                                            color: '#F4212E',
                                            textAlign: 'left',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        <span style={{ fontWeight: '600' }}>Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Yanıtlanan Kişi Bilgisi (Reply to) */}
                <div style={{ fontSize: '15px', color: '#536471', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>Replying to </span>
                    <span style={{ color: '#1d9bf0', cursor: 'pointer', fontSize: '13px' }} onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/@${comment.posts?.profiles?.username}`);
                    }}>
                        @{comment.posts?.profiles?.username || 'unknown'}
                    </span>
                </div>

                {/* Yorum İçeriği */}
                <div style={{ fontSize: '15px', color: '#0f1419', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {comment.content}
                </div>
            </div>

            <style>{`
                .dropdown-item:hover { background-color: rgba(0, 0, 0, 0.03) !important; }
                .hover-bg-light:hover { background-color: rgba(15, 20, 25, 0.1); }
            `}</style>
        </div>
    );
};

export default CommentCard;
