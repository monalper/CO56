import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // 1. Validate inputs
            if (!email || !password || !username || !displayName) {
                throw new Error('Lütfen tüm alanları doldurun.');
            }
            if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.');
            if (username.length > 15) throw new Error('Kullanıcı adı en fazla 15 karakter olabilir.');
            if (displayName.length > 20) throw new Error('Görünen isim en fazla 20 karakter olabilir.');
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                throw new Error('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.');
            }

            // 2. Check username availability
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .maybeSingle();

            if (checkError) throw checkError;
            if (existingUser) throw new Error('Bu kullanıcı adı zaten alınmış.');

            // 3. Sign Up with Metadata
            const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                        display_name: displayName,
                    }
                }
            });

            if (signUpError) throw signUpError;

            if (user && !session) {
                setSuccessMessage('Kayıt başarılı! Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın. Doğruladıktan sonra giriş yapabilirsiniz.');
            } else if (session) {
                // E-posta onayı kapalıysa veya otomatik onaylandıysa direkt profil oluşturmaya git
                navigate('/onboarding');
            }

        } catch (err) {
            console.error("Kayıt hatası:", err); // Hata detayını konsola yazdır
            setError(err.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: '#fff', flexDirection: 'column'
        }}>
            <div style={{ width: '100%', maxWidth: '350px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <img src="/logo.svg" alt="Logo" style={{ height: '40px' }} />
                </div>

                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f1419' }}>
                    Hesap oluştur
                </h1>

                {error && (
                    <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '16px', borderRadius: '4px', border: '1px solid #cfd9de',
                            fontSize: '16px', outline: 'none'
                        }}
                    />

                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={15}
                        style={{
                            padding: '16px', borderRadius: '4px', border: '1px solid #cfd9de',
                            fontSize: '16px', outline: 'none'
                        }}
                    />

                    <input
                        type="text"
                        placeholder="Görünen İsim"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={20}
                        style={{
                            padding: '16px', borderRadius: '4px', border: '1px solid #cfd9de',
                            fontSize: '16px', outline: 'none'
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '16px', borderRadius: '4px', border: '1px solid #cfd9de',
                            fontSize: '16px', outline: 'none'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '14px',
                            background: '#0f1419',
                            color: 'white',
                            border: 'none',
                            borderRadius: '9999px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Kaydolunuyor...' : 'Kaydol'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '14px', color: '#536471' }}>
                    Zaten bir hesabın var mı? <Link to="/login" style={{ color: '#1d9bf0', textDecoration: 'none' }}>Giriş yap</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
