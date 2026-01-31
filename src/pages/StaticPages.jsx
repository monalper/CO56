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
        title="Hizmet Şartları"
        content={
            <>
                <p>CO56 platformuna hoş geldiniz. Bu hizmet şartları, platformumuzu kullanımınızı ve sunduğumuz hizmetlerle etkileşiminizi düzenleyen kapsamlı bir yasal sözleşmedir.</p>

                <h3>1. Şartların Kabulü</h3>
                <p>Hizmetlerimize erişerek veya bunları kullanarak, bu Kullanım Şartları’nın tamamını okuduğunuzu, anladığınızı ve bunlara bağlı kalmayı kabul ettiğinizi beyan edersiniz. Eğer bu şartları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın.</p>

                <h3>2. Kullanıcı Sorumluluğu</h3>
                <p>Platformumuzda paylaştığınız tüm içeriklerden siz sorumlusunuz. Topluluğumuzun güvenliğini korumak adına diğer kullanıcıları taciz etmek, yasa dışı içerik paylaşmak veya platform altyapısını kötüye kullanmak kesinlikle yasaktır.</p>

                <h3>3. İçerik Hakları</h3>
                <p>Paylaştığınız içeriklerin mülkiyeti size aittir; ancak platforma yükleyerek bize bu içerikleri yayınlama, barındırma ve dağıtma hakkı veren dünya çapında geçerli bir lisans vermiş olursunuz.</p>
            </>
        }
    />
);

export const PrivacyPage = () => (
    <StaticPage
        title="Gizlilik Politikası"
        content={
            <>
                <p>Gizliliğiniz bizim için en öncelikli konudur. Bu politikada hangi verileri topladığımızı, bu verileri nasıl işlediğimizi ve güvenliğinizi nasıl sağladığımızı detaylandırıyoruz.</p>

                <h3>1. Toplanan Bilgiler</h3>
                <p>Hesap oluştururken sağladığınız e-posta adresi, kullanıcı adı ve profil bilgilerinin yanı sıra, platform üzerindeki etkileşimleriniz (paylaşımlar, beğeniler) sistemlerimizde güvenli bir şekilde saklanır.</p>

                <h3>2. Veri Kullanımı</h3>
                <p>Verilerinizi size daha kişiselleştirilmiş bir deneyim sunmak, platform güvenliğini optimize etmek ve teknik sorunları hızlıca çözüme kavuşturmak amacıyla kullanıyoruz.</p>

                <h3>3. Üçüncü Taraflar</h3>
                <p>Kişisel verileriniz, açık rızanız olmaksızın veya yasal bir zorunluluk bulunmadığı sürece reklamverenler veya diğer üçüncü taraf kuruluşlarla paylaşılmaz.</p>
            </>
        }
    />
);

export const CookiesPage = () => (
    <StaticPage
        title="Çerez Politikası"
        content={
            <>
                <p>CO56, kullanıcı deneyimini zenginleştirmek ve site trafiğini analiz etmek için çerezleri ve benzeri takip teknolojilerini kullanır.</p>

                <h3>Çerez Nedir?</h3>
                <p>Çerezler, web sitemize girdiğinizde tarayıcınıza yerleştirilen ve sizi hatırlamamıza yardımcı olan küçük metin dosyalarıdır.</p>

                <h3>Neden Çerez Kullanıyoruz?</h3>
                <ul>
                    <li>Sizi tanımak ve her seferinde giriş yapma zorunluluğunu ortadan kaldırmak.</li>
                    <li>Dil ve tema gibi kişisel tercihlerinizi hatırlamak.</li>
                    <li>Site trafiğini analiz ederek platform performansını iyileştirmek.</li>
                </ul>
            </>
        }
    />
);

export const AccessibilityPage = () => (
    <StaticPage
        title="Erişilebilirlik"
        content={
            <>
                <p>Herkesin CO56'yı kısıtlama olmaksızın, rahatça kullanabilmesini amaçlıyoruz. Dijital dünyada engelleri kaldırmak önceliğimizdir.</p>
                <p>Platformumuzu dünya çapında kabul görmüş <strong>Web İçeriği Erişilebilirlik Standartlarına (WCAG)</strong> uyumlu hale getirmek için sürekli çalışıyoruz. Ekran okuyucu desteği, klavye ile navigasyon ve yüksek renk kontrastı konularında düzenli iyileştirmeler yapıyoruz.</p>
            </>
        }
    />
);

export const AdsInfoPage = () => (
    <StaticPage
        title="Reklam Bilgisi"
        content={
            <>
                <p>Platformumuzun tamamen ücretsiz kalmasını sağlamak amacıyla belirli alanlarda reklam gösterimleri yapılabilir.</p>
                <p>Reklamlar ilgi alanlarınıza göre özelleştirilebilir; ancak bu süreçte kimliğinizi doğrudan açık edecek hiçbir veri (isim, e-posta vb.) reklamverenlerle paylaşılmaz. Reklam modelimiz, gizlilikten ödün vermeden sürdürülebilir bir hizmet sunmayı amaçlar.</p>
            </>
        }
    />
);