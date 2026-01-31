import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
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
                    Giriş Yap
                </h1>

                {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '16px', borderRadius: '4px', border: '1px solid #cfd9de',
                            fontSize: '16px', outline: 'none'
                        }}
                        required
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
                        required
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
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '14px', color: '#536471' }}>
                    Hesabın yok mu? <a href="/register" style={{ color: '#1d9bf0', textDecoration: 'none' }}>Kaydol</a>
                </div>
            </div>
        </div>
    );
};
export default Login;
