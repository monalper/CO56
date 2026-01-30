import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Image as ImageIcon, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

const Dashboard = () => {
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [myPosts, setMyPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Edit Mode State
    const [editingPostId, setEditingPostId] = useState(null);

    // Profile update states
    const [displayName, setDisplayName] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [updatingProfile, setUpdatingProfile] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        setProfile(profileData);
        if (profileData) {
            setDisplayName(profileData.display_name);
        }

        // Fetch Posts
        const { data: postsData } = await supabase
            .from('posts')
            .select(`
          *,
          profiles (id, display_name, avatar_url),
          post_images (id, image_url)
        `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        setMyPosts(postsData || []);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            let newAvatarUrl = profile?.avatar_url;

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(fileName);

                newAvatarUrl = publicUrl;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    avatar_url: newAvatarUrl,
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setIsEditingProfile(false);
            setAvatarFile(null);
            fetchData();
            alert('Profil güncellendi!');

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Hata: ' + error.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // --- Post Functions ---
    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const onEditPost = (post) => {
        setEditingPostId(post.id);
        setContent(post.content || '');
        setLocation(post.location || '');
        setFiles([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onDeletePost = async (postId) => {
        if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;

        try {
            // 1. Delete images from storage (Optional but good practice)
            // Getting image paths first
            const postToDelete = myPosts.find(p => p.id === postId);
            if (postToDelete && postToDelete.post_images.length > 0) {
                // Extract paths from URLs if needed, but RLS on storage usually doesn't auto-delete files when row is deleted.
                // For now, let's just delete the DB record, Supabase doesn't auto-delete storage files on cascade easily without triggers.
                // We'll skip storage cleanup for this MVP step to avoid complex parsing.
            }

            // 2. Delete from DB (Cascade will delete post_images rows)
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            setMyPosts(myPosts.filter(p => p.id !== postId));

        } catch (error) {
            console.error("Delete error:", error);
            alert("Silme hatası: " + error.message);
        }
    };

    const cancelEdit = () => {
        setEditingPostId(null);
        setContent('');
        setLocation('');
        setFiles([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0 && !editingPostId) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let postId = editingPostId;

            if (editingPostId) {
                // --- UPDATE EXISTING POST ---
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ content: content, location: location || null })
                    .eq('id', editingPostId);

                if (updateError) throw updateError;

                // Image handling for edit is tricky. 
                // If files added during edit, append them.
                if (files.length > 0) {
                    // Upload logic same as create
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
                    const { error: imagesError } = await supabase.from('post_images').insert(imagesToInsert);
                    if (imagesError) throw imagesError;
                }

                alert('Gönderi güncellendi.');
                setEditingPostId(null);

            } else {
                // --- CREATE NEW POST ---
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        content: content,
                        location: location || null
                    })
                    .select()
                    .single();

                if (postError) throw postError;

                postId = postData.id;

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
            }

            // Reset form
            setContent('');
            setLocation('');
            setFiles([]);
            fetchData(); // Refresh list

        } catch (error) {
            console.error('Error saving post:', error);
            alert('İşlem hatası: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header className="flex items-center justify-end" style={{ marginBottom: '2rem' }}>
                <div className="flex gap-2">
                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} title="Profili Düzenle">
                        <User size={20} />
                    </button>
                    <button onClick={handleLogout} title="Çıkış Yap">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Profile Edit Section */}
            {isEditingProfile && (
                <div className="card" style={{ marginBottom: '2rem', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                    <h3 className="font-bold" style={{ marginBottom: '1rem' }}>Profili Düzenle</h3>
                    <form onSubmit={handleProfileUpdate} className="flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: '#eee',
                                    backgroundImage: `url(${avatarPreview || profile?.avatar_url || ''})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    flexShrink: 0
                                }}
                            />
                            <label className="btn-primary" style={{ fontSize: '0.9rem', cursor: 'pointer', background: 'var(--gray-200)', color: 'var(--text-color)' }}>
                                Fotoğraf Seç
                                <input type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <input
                            type="text"
                            placeholder="Görünen Ad"
                            className="input-field"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditingProfile(false)} style={{ color: 'var(--gray-600)' }}>İptal</button>
                            <button type="submit" className="btn-primary" disabled={updatingProfile}>
                                {updatingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Create/Edit Post Form */}
            <div className="card" style={{ marginBottom: '2rem', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <form onSubmit={handleSubmit}>
                    {editingPostId && (
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                            <span className="text-sm font-bold text-blue-500" style={{ color: 'var(--blue)' }}>Gönderi Düzenleniyor</span>
                            <button type="button" onClick={cancelEdit} className="text-sm text-gray" style={{ color: 'red' }}>İptal</button>
                        </div>
                    )}
                    <textarea
                        className="input-field"
                        placeholder="Neler oluyor?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ minHeight: '100px', resize: 'vertical', background: 'transparent', padding: '0' }}
                    />

                    {/* Location Input */}
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Konum (opsiyonel)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        style={{ marginTop: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 0' }}
                    />

                    {/* Image Previews */}
                    {files.length > 0 && (
                        <div className="flex gap-2" style={{ overflowX: 'auto', padding: '0.5rem 0' }}>
                            {files.map((file, i) => (
                                <div key={i} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        style={{
                                            position: 'absolute', top: -5, right: -5,
                                            background: 'black', color: 'white',
                                            borderRadius: '50%', padding: '2px'
                                        }}>
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between" style={{ marginTop: '1rem', paddingTop: '1rem' }}>
                        <label style={{ cursor: 'pointer', color: 'var(--blue)' }}>
                            <ImageIcon size={20} />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={uploading || (!content && files.length === 0)}
                        >
                            {uploading ? (editingPostId ? 'Güncelleniyor...' : 'Paylaşılıyor...') : (editingPostId ? 'Güncelle' : 'Paylaş')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Your Posts */}
            <div>
                <h3 className="font-bold" style={{ marginBottom: '1rem' }}>Paylaşımlarım</h3>
                <div className="flex-col gap-0">
                    {myPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={onDeletePost}
                            onEdit={onEditPost}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
