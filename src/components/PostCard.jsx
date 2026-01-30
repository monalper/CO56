import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '../lib/utils';
import { LinkifiedText } from './LinkifiedText';
import { Trash2, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PostCard = ({ post, onDelete, onEdit }) => {
    const { content, profiles, post_images, created_at, location } = post;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef(null);

    // Dynamic Aspect Ratio State
    const [aspectRatio, setAspectRatio] = useState('3/4'); // Varsayılan değer

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Format Date using util
    const dateFormatted = formatDate(created_at);

    // Calculate aspect ratio based on the first image
    useEffect(() => {
        if (post_images && post_images.length > 0) {
            const img = new Image();
            img.src = post_images[0].image_url;
            img.onload = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
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

    const openLightbox = (index) => {
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
            <div className="card" style={{
                background: 'transparent',
                padding: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--gray-200)',
                borderRadius: 0,
                position: 'relative'
            }}>
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div style={{ flexShrink: 0 }}>
                        <div className="avatar" style={{
                            backgroundImage: profiles?.avatar_url ? `url(${profiles.avatar_url})` : 'none',
                            backgroundSize: 'cover'
                        }} />
                    </div>

                    {/* Content */}
                    <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>

                        {/* Header: Name and Date */}
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                            {/* Name and Date Column */}
                            <div className="flex-col">
                                <span style={{ fontWeight: '600' }}>{profiles?.display_name || 'Alper Ercan'}</span>
                                <span className="text-gray" style={{ fontSize: '0.85rem' }}>
                                    {dateFormatted}{location && `, ${location}`}
                                </span>
                            </div>

                            {/* Admin Actions */}
                            {(onEdit || onDelete) && (
                                <div className="flex items-center gap-2">
                                    {onEdit && (
                                        <button onClick={() => onEdit(post)} style={{ color: 'var(--blue)', padding: '2px' }} title="Düzenle">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button onClick={() => onDelete(post.id)} style={{ color: '#ff3b30', padding: '2px' }} title="Sil">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
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
                                        onClick={() => setIsExpanded(true)}
                                        style={{ color: 'var(--blue)', fontSize: '0.9rem', marginTop: '0.25rem', padding: '0' }}
                                    >
                                        Daha fazla
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Images - Carousel Style */}
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
                                    <style>
                                        {`
                                .image-carousel::-webkit-scrollbar {
                                    display: none;
                                }
                            `}
                                    </style>

                                    {post_images.map((img, index) => (
                                        <div
                                            key={img.id}
                                            style={{
                                                flex: '0 0 100%',
                                                scrollSnapAlign: 'start',
                                                position: 'relative',
                                                aspectRatio: aspectRatio, // Dinamik oran burada uygulanıyor
                                                overflow: 'hidden',
                                                borderRadius: '12px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => openLightbox(index)}
                                        >
                                            <img
                                                src={img.image_url}
                                                alt="Post attachment"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Dots indicator if multiple images */}
                                {post_images.length > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '15px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        zIndex: 10,
                                        pointerEvents: 'none'
                                    }}>
                                        {post_images.map((_, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                    backgroundColor: i === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LIGHTBOX */}
            {lightboxOpen && post_images && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'black', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={closeLightbox}>

                    <button
                        onClick={closeLightbox}
                        style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', zIndex: 10000 }}
                    >
                        <X size={32} />
                    </button>

                    {/* Left Button */}
                    {post_images.length > 1 && (
                        <button
                            onClick={prevImage}
                            style={{
                                position: 'absolute', left: '20px', color: 'white',
                                padding: '10px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                opacity: currentImageIndex === 0 ? 0.3 : 1,
                                pointerEvents: currentImageIndex === 0 ? 'none' : 'auto'
                            }}
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    {/* Image */}
                    <div style={{ maxWidth: '90%', maxHeight: '90%', pointerEvents: 'none' }}>
                        <img
                            src={post_images[currentImageIndex].image_url}
                            alt="Full view"
                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Right Button */}
                    {post_images.length > 1 && (
                        <button
                            onClick={nextImage}
                            style={{
                                position: 'absolute', right: '20px', color: 'white',
                                padding: '10px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                opacity: currentImageIndex === post_images.length - 1 ? 0.3 : 1,
                                pointerEvents: currentImageIndex === post_images.length - 1 ? 'none' : 'auto'
                            }}
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

export default PostCard;