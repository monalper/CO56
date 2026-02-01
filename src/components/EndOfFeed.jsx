import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const EndOfFeed = () => {
    return (
        <div style={{
            padding: '48px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--white)',
            borderBottom: '1px solid var(--gray-200)'
        }}>
            <div style={{
                color: 'var(--blue)',
                marginBottom: '8px'
            }}>
                <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                color: 'var(--text-color)'
            }}>
                Her şeyi gördün
            </h3>
            <p style={{
                color: 'var(--gray-500)',
                fontSize: '15px',
                maxWidth: '300px',
                margin: '0 auto',
                lineHeight: '1.4'
            }}>
                Şu anlık tüm yeni gönderileri yakaladın. Daha fazlası için biraz sonra tekrar gel!
            </p>
        </div>
    );
};

export default EndOfFeed;
