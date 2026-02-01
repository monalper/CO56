import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Check, ChevronDown } from 'lucide-react';
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

    // UI States
    const [language, setLanguage] = useState('en'); // Statik dil seçimi

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

    // Tab State
    const [activeTab, setActiveTab] = useState('Account');

    useEffect(() => {
        document.title = "Settings | CO56";
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
            alert('An error occurred while cropping the image.');
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

            alert('Profile updated!');
            navigate(`/@${username}`);

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>Loading...</div>;
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
                    <button onClick={() => navigate(username ? `/@${username}` : '/')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} className="hover-bg">
                        <X size={20} />
                    </button>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Settings</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: '#0f1419', color: '#fff', padding: '0.5rem 1.25rem',
                        borderRadius: '9999px', border: 'none', fontWeight: '600',
                        fontSize: '15px', cursor: 'pointer', opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Tab Bar */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #eff3f4',
                background: '#fff',
                position: 'sticky',
                top: '53px',
                zIndex: 9
            }}>
                {['Account', 'Profile', 'Privacy'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '1rem 0',
                            fontSize: '15px',
                            fontWeight: activeTab === tab ? '600' : '500',
                            color: activeTab === tab ? '#0f1419' : '#536471',
                            position: 'relative',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none'
                        }}
                        className="tab-button"
                    >
                        {tab}
                        {activeTab === tab && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '56px',
                                height: '4px',
                                background: '#1d9bf0',
                                borderRadius: '9999px'
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '1.5rem 1rem' }}>
                {activeTab === 'Account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="section-title">Account Information</div>
                        <div className="form-group readonly">
                            <label>Email</label>
                            <input type="text" value={user?.email || ''} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value="********" readOnly />
                            <button style={{ color: '#1d9bf0', border: 'none', background: 'none', padding: 0, fontSize: '14px', textAlign: 'left', marginTop: '4px', fontWeight: '500', cursor: 'pointer' }}>Change Password</button>
                        </div>

                        {/* Language Selection - NEW SECTION */}
                        <div className="section-title" style={{ marginTop: '0.5rem' }}>Localization</div>
                        <div className="form-group">
                            <label>Display Language</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={{
                                        appearance: 'none',
                                        width: '100%',
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: '1rem',
                                        color: '#0f1419',
                                        padding: '4px 0',
                                        cursor: 'pointer',
                                        fontWeight: '400'
                                    }}
                                >
                                    <option value="en">English</option>
                                    <option value="tr">Türkçe</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: 0, pointerEvents: 'none', color: '#536471' }} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eff3f4', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <button style={{ border: 'none', background: 'none', color: '#f4212e', fontWeight: '600', padding: '0.5rem 0', cursor: 'pointer' }}>Deactivate Account</button>
                        </div>
                    </div>
                )}

                {activeTab === 'Profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', height: '160px', marginBottom: '3rem', background: '#cfd9de', borderRadius: '12px', overflow: 'hidden' }}>
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
                            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    <img
                                        src={avatarPreview || avatarUrl || `https://ui-avatars.com/api/?name=${displayName}`}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                        <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="icon-btn">
                                            <Camera size={18} color="#fff" />
                                            <input type="file" onChange={(e) => handleImageChange(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                maxLength={20}
                            />
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[a-zA-Z0-9_]*$/.test(val)) {
                                        setUsername(val);
                                    }
                                }}
                                maxLength={15}
                            />
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
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
                            <label>Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                maxLength={30}
                            />
                        </div>

                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                maxLength={100}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'Privacy' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="section-title">Privacy and Safety</div>

                        <div className="privacy-item">
                            <div className="privacy-info">
                                <div className="privacy-label">Private Account</div>
                                <div className="privacy-desc">Only people you approve can see your posts.</div>
                            </div>
                            <input type="checkbox" className="ios-toggle" />
                        </div>

                        <div className="privacy-item">
                            <div className="privacy-info">
                                <div className="privacy-label">Direct Messages</div>
                                <div className="privacy-desc">Allow message requests from everyone.</div>
                            </div>
                            <input type="checkbox" defaultChecked className="ios-toggle" />
                        </div>

                        <div className="privacy-item" style={{ borderBottom: 'none' }}>
                            <div className="privacy-info">
                                <div className="privacy-label">Data Sharing</div>
                                <div className="privacy-desc">Allow anonymous data collection to improve your experience.</div>
                            </div>
                            <input type="checkbox" defaultChecked className="ios-toggle" />
                        </div>
                    </div>
                )}
            </div>

            {/* CROP MODAL */}
            {isCropModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999, background: 'black', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <button onClick={() => setIsCropModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                        <span style={{ fontWeight: 'bold' }}>Edit Media</span>
                        <button onClick={showCroppedImage} style={{ background: 'white', color: 'black', border: 'none', padding: '0.4rem 1.2rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>Apply</button>
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
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f1419;
                    margin-bottom: 0.5rem;
                }
                .form-group {
                    border: 1px solid #cfd9de;
                    border-radius: 8px;
                    padding: 0.5rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    background: #fff;
                }
                .form-group:focus-within {
                    border-color: #1d9bf0;
                    box-shadow: 0 0 0 1px #1d9bf0;
                }
                .form-group.readonly {
                    background-color: #f7f9f9;
                }
                .form-group label {
                    font-size: 0.8rem;
                    color: #536471;
                    margin-bottom: 2px;
                    font-weight: 500;
                }
                .form-group input, .form-group textarea, .form-group select {
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 1rem;
                    color: #0f1419;
                    width: 100%;
                    font-family: inherit;
                    padding: 0;
                    margin: 0;
                }
                .tab-button:hover {
                    background-color: rgba(15,20,25,0.03);
                }
                .hover-bg:hover {
                    background-color: rgba(15,20,25,0.1) !important;
                }
                .icon-btn:hover {
                    background-color: rgba(0,0,0,0.5) !important;
                }
                
                .privacy-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 0;
                    border-bottom: 1px solid #eff3f4;
                }
                .privacy-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding-right: 1rem;
                }
                .privacy-label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f1419;
                }
                .privacy-desc {
                    font-size: 0.85rem;
                    color: #536471;
                    line-height: 1.3;
                }

                .ios-toggle {
                    appearance: none;
                    width: 40px;
                    height: 20px;
                    background: #cfd9de;
                    border-radius: 20px;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.2s;
                    flex-shrink: 0;
                }
                .ios-toggle:checked {
                    background: #1d9bf0;
                }
                .ios-toggle::before {
                    content: '';
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    background: #fff;
                    border-radius: 50%;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s;
                }
                .ios-toggle:checked::before {
                    transform: translateX(20px);
                }

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