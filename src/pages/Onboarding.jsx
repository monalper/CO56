import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/cropUtils';

const Onboarding = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    // Image States
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
    const [cropType, setCropType] = useState('avatar');

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
            const croppedImageBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

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

    const handleFinish = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return navigate('/');

            let newAvatarUrl = null;
            let newCoverUrl = null;

            if (avatarFile) {
                newAvatarUrl = await uploadImage(avatarFile, 'avatars');
            }
            if (coverFile) {
                newCoverUrl = await uploadImage(coverFile, 'covers');
            }

            if (newAvatarUrl || newCoverUrl) {
                const updates = { updated_at: new Date() };
                if (newAvatarUrl) updates.avatar_url = newAvatarUrl;
                if (newCoverUrl) updates.cover_url = newCoverUrl;

                await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);
            }

            navigate('/');

        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', minHeight: '100vh', padding: '2rem 1rem' }}>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Profilini Özelleştir</h1>
                <p style={{ color: '#536471' }}>Tüm dünyada tanınmak için bir fotoğraf seç.</p>
            </div>

            {/* Visuals */}
            <div style={{ position: 'relative', height: '200px', marginBottom: '4rem', background: '#cfd9de', borderRadius: '4px' }}>
                {/* Cover */}
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                    {coverPreview && (
                        <img
                            src={coverPreview}
                            alt="Cover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                        <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.6)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} className="icon-btn">
                            <Camera size={24} color="#fff" />
                            <input type="file" onChange={(e) => handleImageChange(e, 'cover')} style={{ display: 'none' }} accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Avatar */}
                <div style={{ position: 'absolute', bottom: '-45px', left: '1rem', width: '112px', height: '112px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', backgroundColor: '#fff' }}>
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Camera size={32} color="#999" />
                            </div>
                        )}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                            <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="icon-btn">
                                <Camera size={20} color="#fff" />
                                <input type="file" onChange={(e) => handleImageChange(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '3rem' }}>
                <button
                    onClick={handleFinish}
                    disabled={saving}
                    style={{
                        padding: '14px',
                        background: '#0f1419',
                        color: 'white',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
                </button>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '14px',
                        background: 'transparent',
                        color: '#0f1419',
                        border: '1px solid #cfd9de',
                        borderRadius: '9999px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    Şimdilik Geç
                </button>
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
                            style={{ containerStyle: { background: '#000' } }}
                        />
                    </div>

                    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="zoom-range" style={{ width: '80%' }} />
                    </div>
                </div>
            )}

            <style>{`
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

export default Onboarding;
