import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';

const CommentItem = ({ comment, onReply, currentUserId, onDelete }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        await onReply(comment.id, replyContent);
        setIsReplying(false);
        setReplyContent('');
    };

    const handleDelete = () => {
        setShowMenu(false);
        onDelete(comment.id);
    };

    return (
        <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #fefff' }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
                <Link to={`/@${comment.profiles?.username}`}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundImage: `url(${comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.display_name || 'User'}&background=random`})`,
                        backgroundSize: 'cover',
                        cursor: 'pointer'
                    }} />
                </Link>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Link to={`/@${comment.profiles?.username}`} style={{ fontWeight: '700', color: 'inherit', textDecoration: 'none' }} className="hover-underline">
                            {comment.profiles?.display_name || 'Unknown User'}
                        </Link>
                        <span style={{ color: '#536471', fontSize: '14px' }}>@{comment.profiles?.username}</span>
                        <span style={{ color: '#536471', fontSize: '14px' }}>·</span>
                        <span style={{ color: '#536471', fontSize: '14px' }}>{formatDate(comment.created_at)}</span>
                    </div>

                    {/* More Menu */}
                    {currentUserId === comment.user_id && (
                        <div style={{ position: 'relative' }} ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
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

                {/* Content */}
                <div style={{ marginTop: '4px', fontSize: '15px', whiteSpace: 'pre-wrap', color: '#0f1419', lineHeight: '1.5' }}>
                    {comment.content}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#536471', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        className="action-btn"
                    >
                        <MessageCircle size={16} />
                        <span>Reply</span>
                    </button>

                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Tweet your reply"
                            style={{
                                flex: 1,
                                border: '1px solid #cfd9de',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                outline: 'none',
                                resize: 'none',
                                minHeight: '60px',
                                fontFamily: 'inherit'
                            }}
                            autoFocus
                        />
                        <button
                            onClick={handleSubmitReply}
                            disabled={!replyContent.trim()}
                            style={{
                                backgroundColor: '#1d9bf0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '8px 16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                opacity: replyContent.trim() ? 1 : 0.5
                            }}
                        >
                            Reply
                        </button>
                    </div>
                )}

                <style>{`
                    .hover-underline:hover { text-decoration: underline; }
                    .action-btn:hover { color: #1d9bf0 !important; }
                    .delete-btn:hover { color: #f4212e !important; }
                    .dropdown-item:hover { background-color: rgba(0, 0, 0, 0.03) !important; }
                    .hover-bg-light:hover { background-color: rgba(15, 20, 25, 0.1); }
                `}</style>

                {/* Recursion for Nested Comments */}
                {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginTop: '16px', position: 'relative' }}>
                        {/* Vertical line for threading */}
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '-28px', width: '2px', backgroundColor: '#cfd9de' }}></div>

                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                currentUserId={currentUserId}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
