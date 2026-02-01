import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { LinkifiedText } from './LinkifiedText';
import { Trash2, Edit, X, ChevronLeft, ChevronRight, MoreHorizontal, Flag, UserX, MessageCircle, Heart, HeartCrack, Bookmark } from 'lucide-react';

const PostCard = ({ post, onDelete, onEdit, isDetailView = false }) => {
    const navigate = useNavigate();
    const { id: postId, content, profiles, post_images, created_at, location, user_id } = post;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const textRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUserId(session?.user?.id || null);
        };
        getSession();
    }, []);

    const isOurPost = currentUserId === user_id;

    const internalEdit = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onEdit) {
            onEdit(post);
        } else {
            navigate(`/edit/${postId}`);
        }
    };

    const internalDelete = async (e) => {
        e.stopPropagation();
        setShowMenu(false);

        if (onDelete) {
            onDelete(postId);
        } else {
            if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
            try {
                const { error } = await supabase.from('posts').delete().eq('id', postId);
                if (error) throw error;
                if (isDetailView) navigate(-1);
                else window.location.reload();
            } catch (err) {
                alert('Silme hatası: ' + err.message);
            }
        }
    };

    const handleReport = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        alert('This post has been reported.');
    };

    const handleBlock = (e) => {
        e.stopPropagation();
        setShowMenu(false);
        alert('This user has been blocked.');
    };

    const [aspectRatio, setAspectRatio] = useState('3/4');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const goToDetail = (e) => {
        if (isDetailView) return;
        const username = profiles?.username || 'user';
        navigate(`/@${username}/status/${postId}`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dateFormatted = formatDate(created_at);

    useEffect(() => {
        if (post_images && post_images.length > 0) {
            const img = new Image();
            img.src = post_images[0].image_url;
            img.onload = () => {
                setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
            };
        }
    }, [post_images]);

    useEffect(() => {
        if (textRef.current) {
            const element = textRef.current;
            if (element.scrollHeight > element.clientHeight) {
                setIsOverflowing(true);
            }
        }
    }, [content]);

    const openLightbox = (e, index) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (post_images && currentImageIndex < post_images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage(e);
            if (e.key === 'ArrowLeft') prevImage(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex]);

    return (
        <>
            <div
                className="card"
                onClick={goToDetail}
                style={{
                    background: 'transparent',
                    padding: '1rem',
                    marginBottom: '0',
                    borderBottom: isDetailView ? 'none' : '1px solid var(--gray-200)',
                    borderRadius: 0,
                    position: 'relative',
                    cursor: isDetailView ? 'default' : 'pointer'
                }}
            >
                <div className="flex gap-4 items-center" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ flexShrink: 0, cursor: 'pointer' }} onClick={(e) => {
                        e.stopPropagation();
                        if (profiles?.username) navigate(`/@${profiles.username}`);
                    }}>
                        <div className="avatar" style={{
                            backgroundImage: profiles?.avatar_url ? `url(${profiles.avatar_url})` : `url(https://ui-avatars.com/api/?name=${profiles?.display_name || 'User'}&background=random)`,
                            backgroundSize: 'cover'
                        }} />
                    </div>

                    <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{ cursor: 'pointer', width: 'fit-content' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (profiles?.username) navigate(`/@${profiles.username}`);
                            }}
                        >
                            <span style={{ fontWeight: '600', lineHeight: '1.2', display: 'block' }}>{profiles?.display_name || 'User'}</span>
                            <span className="text-gray" style={{ fontSize: '0.85rem', lineHeight: '1.2', marginTop: '2px', display: 'block' }}>
                                {dateFormatted}{location && `, ${location}`}
                            </span>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }} ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            style={{
                                color: 'var(--gray-400)',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s',
                            }}
                            className="hover-gray"
                        >
                            <MoreHorizontal size={18} />
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
                                zIndex: 100,
                                minWidth: '190px',
                                overflow: 'hidden',
                                marginTop: '4px'
                            }}>
                                {isOurPost ? (
                                    <>
                                        <button onClick={internalEdit} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', fontSize: '15px', textAlign: 'left' }}>
                                            <Edit size={18} color="var(--blue)" />
                                            <span>Edit</span>
                                        </button>
                                        <button onClick={internalDelete} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', fontSize: '15px', color: '#F4212E', textAlign: 'left' }}>
                                            <Trash2 size={18} />
                                            <span style={{ fontWeight: '600' }}>Delete</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleReport} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', fontSize: '15px', textAlign: 'left' }}>
                                            <Flag size={18} color="var(--gray-500)" />
                                            <span>Report</span>
                                        </button>
                                        <button onClick={handleBlock} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', fontSize: '15px', color: '#F4212E', textAlign: 'left' }}>
                                            <UserX size={18} />
                                            <span style={{ fontWeight: '600' }}>Block User</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    .hover-gray:hover { background-color: rgba(15, 20, 25, 0.1); }
                    .dropdown-item:hover { background-color: rgba(0, 0, 0, 0.03); }
                `}</style>

                <div style={{ paddingLeft: '56px' }}>
                    {content && (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div
                                ref={textRef}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: isExpanded ? 'unset' : 5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                <LinkifiedText text={content} />
                            </div>
                            {isOverflowing && !isExpanded && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(true);
                                    }}
                                    style={{ color: 'var(--blue)', fontSize: '0.9rem', marginTop: '0.25rem', padding: '0' }}
                                >
                                    See more
                                </button>
                            )}
                        </div>
                    )}

                    {post_images && post_images.length > 0 && (
                        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                            <div
                                className="image-carousel"
                                style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollSnapType: 'x mandatory',
                                    gap: '10px',
                                    borderRadius: '12px',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                            >
                                <style>{`.image-carousel::-webkit-scrollbar { display: none; }`}</style>
                                {post_images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        style={{
                                            flex: '0 0 100%',
                                            scrollSnapAlign: 'start',
                                            position: 'relative',
                                            aspectRatio: aspectRatio,
                                            overflow: 'hidden',
                                            borderRadius: '12px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={(e) => openLightbox(e, index)}
                                    >
                                        <img src={img.image_url} alt="Post attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>

                            {post_images.length > 1 && (
                                <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 10, pointerEvents: 'none' }}>
                                    {post_images.map((_, i) => (
                                        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', transition: 'background-color 0.2s' }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Interaction Icons - Waypoint ve Share Kaldırıldı */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        gap: '24px',
                        marginTop: '12px',
                        color: '#71767b',
                        paddingRight: '12px'
                    }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            title="Beğen"
                            style={{ padding: '8px', marginLeft: '-8px', background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                        >
                            <Heart size={20} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            title="Beğenme"
                            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                        >
                            <HeartCrack size={20} />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/@${profiles?.username}/status/${postId}`);
                            }}
                            title="Reply"
                            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                        >
                            <MessageCircle size={18} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            title="Save"
                            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                        >
                            <Bookmark size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {lightboxOpen && post_images && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'black', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeLightbox}>
                    <button onClick={closeLightbox} style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', zIndex: 10000 }}><X size={32} /></button>
                    {post_images.length > 1 && (
                        <button onClick={prevImage} style={{ position: 'absolute', left: '20px', color: 'white', padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', opacity: currentImageIndex === 0 ? 0.3 : 1, pointerEvents: currentImageIndex === 0 ? 'none' : 'auto' }}><ChevronLeft size={32} /></button>
                    )}
                    <div style={{ maxWidth: '90%', maxHeight: '90%', pointerEvents: 'none' }}>
                        <img src={post_images[currentImageIndex].image_url} alt="Full view" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
                    </div>
                    {post_images.length > 1 && (
                        <button onClick={nextImage} style={{ position: 'absolute', right: '20px', color: 'white', padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', opacity: currentImageIndex === post_images.length - 1 ? 0.3 : 1, pointerEvents: currentImageIndex === post_images.length - 1 ? 'none' : 'auto' }}><ChevronRight size={32} /></button>
                    )}
                </div>
            )}
        </>
    );
};

export default PostCard;