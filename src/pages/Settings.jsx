import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/cropUtils';

const Settings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);

    // Form States
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [location, setLocation] = useState('');

    // Image States
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [coverUrl, setCoverUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    // Crop States
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const [cropType, setCropType] = useState('avatar'); // 'avatar' | 'cover'

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/admin/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setDisplayName(data.display_name || '');
                setUsername(data.username || '');
                setBio(data.bio || '');
                setWebsite(data.website || '');
                setLocation(data.location || '');
                setAvatarUrl(data.avatar_url);
                setCoverUrl(data.cover_url);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e, type) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setTempImageSrc(reader.result);
                setCropType(type);
                setIsCropModalOpen(true);
                setZoom(1);
                setCrop({ x: 0, y: 0 });
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(
                tempImageSrc,
                croppedAreaPixels
            );

            const file = new File([croppedImageBlob], "cropped.jpg", { type: "image/jpeg" });
            const previewUrl = URL.createObjectURL(croppedImageBlob);

            if (cropType === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(previewUrl);
            } else {
                setCoverFile(file);
                setCoverPreview(previewUrl);
            }

            setIsCropModalOpen(false);
            setTempImageSrc(null);
        } catch (e) {
            console.error(e);
            alert('Görüntü kırpılırken bir hata oluştu.');
        }
    }, [croppedAreaPixels, tempImageSrc, cropType]);

    const uploadImage = async (file, bucket) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let newAvatarUrl = avatarUrl;
            let newCoverUrl = coverUrl;

            // Avatars bucket usage
            if (avatarFile) {
                newAvatarUrl = await uploadImage(avatarFile, 'avatars');
            }
            if (coverFile) {
                newCoverUrl = await uploadImage(coverFile, 'covers');
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    username: username,
                    bio: bio,
                    website: website,
                    location: location,
                    avatar_url: newAvatarUrl,
                    cover_url: newCoverUrl,
                    updated_at: new Date(),
                })
                .eq('id', user.id);

            if (error) throw error;

            alert('Profil güncellendi!');
            navigate('/profile');

        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>Yükleniyor...</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', minHeight: '100vh', paddingBottom: '2rem' }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', position: 'sticky', top: 0,
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                zIndex: 10, borderBottom: '1px solid #eff3f4'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/profile')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} className="hover-bg">
                        <X size={20} />
                    </button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Profili Düzenle</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: '#0f1419', color: '#fff', padding: '0.5rem 1.25rem',
                        borderRadius: '9999px', border: 'none', fontWeight: '700',
                        fontSize: '15px', cursor: 'pointer', opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Kaydediliyor' : 'Kaydet'}
                </button>
            </div>

            {/* Visuals */}
            <div style={{ position: 'relative', height: '200px', marginBottom: '4rem', background: '#cfd9de' }}>
                {/* Cover */}
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    {(coverPreview || coverUrl) && (
                        <img
                            src={coverPreview || coverUrl}
                            alt="Cover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                        />
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                        <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.6)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} className="icon-btn">
                            <Camera size={24} color="#fff" />
                            <input type="file" onChange={(e) => handleImageChange(e, 'cover')} style={{ display: 'none' }} accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Avatar */}
                <div style={{ position: 'absolute', bottom: '-45px', left: '1rem', width: '112px', height: '112px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', backgroundColor: '#fff' }}>
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img
                            src={avatarPreview || avatarUrl || `https://ui-avatars.com/api/?name=${displayName}`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                        />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                            <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="icon-btn">
                                <Camera size={20} color="#fff" />
                                <input type="file" onChange={(e) => handleImageChange(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inputs */}
            <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div className="form-group">
                    <label>İsim</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={20}
                    />
                </div>

                <div className="form-group">
                    <label>Kullanıcı Adı</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Only allow English letters, numbers, and underscores.
                            if (/^[a-zA-Z0-9_]*$/.test(val)) {
                                setUsername(val);
                            }
                        }}
                        maxLength={15}
                    />
                </div>

                <div className="form-group">
                    <label>Biyografi</label>
                    <div className="relative">
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={150}
                            style={{ minHeight: '80px', resize: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', padding: '0.25rem 0' }}>
                            <button
                                type="button"
                                onClick={() => setBio(prev => prev + ' :co56: ')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                                className="hover-bg"
                                title=":co56:"
                            >
                                <img src="/sticker/co56.svg" alt=":co56:" style={{ height: '24px' }} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setBio(prev => prev + ' :onering: ')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                                className="hover-bg"
                                title=":onering:"
                            >
                                <img src="/sticker/onering.svg" alt=":onering:" style={{ height: '24px' }} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Konum</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        maxLength={30}
                    />
                </div>

                <div className="form-group">
                    <label>İnternet Sitesi</label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        maxLength={100}
                    />
                </div>

            </div>

            {/* CROP MODAL */}
            {isCropModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999, background: 'black', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <button onClick={() => setIsCropModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                        <span style={{ fontWeight: 'bold' }}>Medyayı Düzenle</span>
                        <button onClick={showCroppedImage} style={{ background: 'white', color: 'black', border: 'none', padding: '0.4rem 1.2rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Uygula</button>
                    </div>

                    <div style={{ position: 'relative', flex: 1, background: '#333' }}>
                        <Cropper
                            image={tempImageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={cropType === 'avatar' ? 1 : 3}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                            style={{
                                containerStyle: { background: '#000' },
                                cropAreaStyle: { border: '2px solid #1d9bf0' }
                            }}
                        />
                    </div>

                    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => {
                                setZoom(e.target.value)
                            }}
                            className="zoom-range"
                            style={{ width: '80%' }}
                        />
                    </div>
                </div>
            )}

            <style>{`
                .form-group {
                    border: 1px solid #cfd9de;
                    border-radius: 4px;
                    padding: 0.5rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                    transition: border-color 0.2s;
                }
                .form-group:focus-within {
                    border-color: #1d9bf0;
                    box-shadow: 0 0 0 1px #1d9bf0;
                }
                .form-group label {
                    font-size: 0.8rem;
                    color: #536471;
                    margin-bottom: 2px;
                }
                .form-group input, .form-group textarea {
                    border: none;
                    outline: none;
                    font-size: 1rem;
                    color: #0f1419;
                    width: 100%;
                    font-family: inherit;
                    padding: 0;
                    margin: 0;
                }
                .hover-bg:hover {
                    background-color: rgba(15,20,25,0.1) !important;
                }
                .icon-btn:hover {
                    background-color: rgba(0,0,0,0.5) !important;
                }
                /* Custom Range Slider */
                .zoom-range {
                    -webkit-appearance: none;
                    height: 4px;
                    background: #555;
                    border-radius: 2px;
                    outline: none;
                }
                .zoom-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #1d9bf0;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Settings;
