import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaticPage = ({ title, content }) => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Header Alanı */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '24px',
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '8px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'transparent'
                    }}
                    className="hover-bg-light"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>{title}</h2>
            </div>

            {/* İçerik Alanı */}
            <div style={{ lineHeight: '1.6', color: 'var(--text-color)' }}>
                {content}
            </div>

            <style>{`
                .hover-bg-light:hover {
                    background-color: rgba(15, 20, 25, 0.1);
                }
                h3 { 
                    margin-top: 24px; 
                    margin-bottom: 8px; 
                    font-size: 18px; 
                    font-weight: 600; /* Semibold Dokunuşu */
                    color: #1d9bf0; 
                }
                p { 
                    margin-bottom: 16px; 
                    color: var(--gray-600); 
                    font-size: 15px;
                }
                ul { 
                    margin-bottom: 16px; 
                    padding-left: 20px; 
                    color: var(--gray-600); 
                }
                li { 
                    margin-bottom: 8px; 
                    font-size: 15px;
                }
                strong {
                    font-weight: 600;
                    color: var(--text-color);
                }
            `}</style>
        </div>
    );
};

export const TermsPage = () => (
    <StaticPage
        title="Terms and Conditions"
        content={
            <>
                <p>Welcome to CO56 platform. These Terms and Conditions are a comprehensive legal agreement that regulates your use of our platform and the services we provide.</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing or using our services, you agree to accept and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>

                <h3>2. User Responsibility</h3>
                <p>You are responsible for all content you share on our platform. It is strictly prohibited to harass other users, share illegal content, or use our platform infrastructure for malicious purposes.</p>

                <h3>3. Content Rights</h3>
                <p>You own the content you share on our platform; however, by uploading it to us, you grant us a worldwide, perpetual, irrevocable, royalty-free license to publish, host, and distribute the content.</p>
            </>
        }
    />
);

export const PrivacyPage = () => (
    <StaticPage
        title="Privacy Policy"
        content={
            <>
                <p>Privacy is our top priority. This policy details what data we collect, how we process it, and how we protect your security.</p>

                <h3>1. Collected Information</h3>
                <p>When you create an account, we collect your email address, username, and profile information, as well as your interactions on the platform (shares, likes) which are securely stored in our systems.</p>

                <h3>2. Data Usage</h3>
                <p>We use your data to provide you with a personalized experience, optimize platform security, and quickly resolve technical issues.</p>

                <h3>3. Third Parties</h3>
                <p>Your personal data is not shared with advertisers or other third-party organizations without your explicit consent or unless required by law.</p>
            </>
        }
    />
);

export const CookiesPage = () => (
    <StaticPage
        title="Cookie Policy"
        content={
            <>
                <p>CO56 uses cookies and similar tracking technologies to enhance user experience and analyze website traffic.</p>

                <h3>What are Cookies?</h3>
                <p>Cookies are small text files placed in your browser when you visit our website to help us remember you and improve your experience.</p>

                <h3>Why Do We Use Cookies?</h3>
                <ul>
                    <li>To identify you and eliminate the need for login on every visit.</li>
                    <li>To remember your language and theme preferences.</li>
                    <li>To analyze website traffic and improve platform performance.</li>
                </ul>
            </>
        }
    />
);

export const AccessibilityPage = () => (
    <StaticPage
        title="Accessibility"
        content={
            <>
                <p>We strive to make CO56 accessible to everyone without any limitations, ensuring a comfortable experience. Our priority is to remove barriers in the digital world.</p>
                <p>We continuously work to make our platform WCAG (Web Content Accessibility Guidelines) compliant worldwide. We make regular improvements in features such as screen reader support, keyboard navigation, and high contrast.</p>
            </>
        }
    />
);

export const AdsInfoPage = () => (
    <StaticPage
        title="Ads Information"
        content={
            <>
                <p>Our platform can display advertisements in certain areas to ensure it remains free of charge.</p>
                <p>Ads can be customized based on your interests; however, no personal information (name, email, etc.) is shared with advertisers during this process. Our ad model aims to provide a sustainable service without compromising privacy.</p>
            </>
        }
    />
);