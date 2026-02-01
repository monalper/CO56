import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, X, MapPin } from 'lucide-react';

const CreatePost = ({ onPostCreated, profile, editPost = null }) => {
    const [content, setContent] = useState(editPost?.content || '');
    const [location, setLocation] = useState(editPost?.location || '');
    const [showLocation, setShowLocation] = useState(!!editPost?.location);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (editPost) {
            setContent(editPost.content || '');
            setLocation(editPost.location || '');
            setShowLocation(!!editPost.location);
        }
    }, [editPost]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let postId = editPost?.id;

            if (editPost) {
                // Update existing post
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({
                        content: content,
                        location: (showLocation && location) ? location : null
                    })
                    .eq('id', editPost.id);

                if (updateError) throw updateError;
            } else {
                // 1. Create Post record
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        content: content,
                        location: (showLocation && location) ? location : null
                    })
                    .select()
                    .single();

                if (postError) throw postError;
                postId = postData.id;
            }

            // 2. Upload Images
            if (files.length > 0) {
                const imagePromises = files.map(async (file) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${postId}/${Math.random()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('post-images')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(filePath);

                    return {
                        post_id: postId,
                        image_url: publicUrl
                    };
                });

                const imagesToInsert = await Promise.all(imagePromises);

                const { error: imagesError } = await supabase
                    .from('post_images')
                    .insert(imagesToInsert);

                if (imagesError) throw imagesError;
            }

            // Reset form
            setContent('');
            setLocation('');
            setShowLocation(false);
            setFiles([]);
            if (onPostCreated) onPostCreated();

        } catch (error) {
            console.error('Error saving post:', error);
            alert('Error saving post: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card" style={{
            marginBottom: '0',
            borderRadius: 0,
            borderBottom: '1px solid var(--gray-200)',
            padding: '16px'
        }}>
            <div className="flex gap-4">
                <div style={{ flexShrink: 0 }}>
                    <div className="avatar" style={{
                        backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none',
                        backgroundSize: 'cover'
                    }} />
                </div>
                <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="input-field"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                minHeight: '80px',
                                resize: 'none',
                                background: 'transparent',
                                padding: '8px 0',
                                borderBottom: 'none',
                                fontSize: '20px'
                            }}
                        />

                        {/* Location Input (Toggleable) */}
                        {showLocation && (
                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Add location..."
                                    className="input-field"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    style={{
                                        fontSize: '14px',
                                        padding: '6px 32px 6px 12px',
                                        background: 'rgba(0,0,0,0.03)',
                                        borderRadius: '99px',
                                        borderBottom: 'none',
                                        width: '100%'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setShowLocation(false); setLocation(''); }}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Image Previews */}
                        {files.length > 0 && (
                            <div className="flex gap-2" style={{ overflowX: 'auto', padding: '0.5rem 0' }}>
                                {files.map((file, i) => (
                                    <div key={i} style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            style={{
                                                position: 'absolute', top: 5, right: 5,
                                                background: 'rgba(0,0,0,0.6)', color: 'white',
                                                borderRadius: '50%', padding: '4px',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between" style={{ marginTop: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '12px' }}>
                            <div className="flex gap-1">
                                <label style={{
                                    cursor: 'pointer',
                                    color: 'var(--blue)',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'background-color 0.2s'
                                }} className="hover-bg" title="Görsel Ekle">
                                    <ImageIcon size={19} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowLocation(!showLocation)}
                                    style={{
                                        color: 'var(--blue)',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        background: showLocation ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
                                        transition: 'background-color 0.2s'
                                    }}
                                    className="hover-bg"
                                    title="Add Location"
                                >
                                    <MapPin size={19} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={uploading || (!content.trim() && files.length === 0)}
                                style={{
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    opacity: (uploading || (!content.trim() && files.length === 0)) ? 0.5 : 1
                                }}
                            >
                                {uploading ? (editPost ? 'Updating...' : 'Sharing...') : (editPost ? 'Update' : 'Share')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
                .hover-bg:hover {
                    background-color: rgba(29, 155, 240, 0.1);
                }
            `}</style>
        </div>
    );
};

export default CreatePost;
