import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Components ---

// 1. Search Box
const SearchBox = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} style={{
            background: 'rgba(235, 235, 235, 0.45)',
            borderRadius: '9999px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '0'
        }}>
            <Search size={20} className="text-gray" />
            <input
                type="text"
                placeholder="Ara"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
            />
        </form>
    );
};

// 2. Stock Market Widget
const StockItem = ({ symbol, name, price, changePercent }) => {
    const isUp = changePercent >= 0;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
        }}>
            <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{symbol}</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>
                    {price}
                </div>
                <div style={{
                    fontSize: '13px',
                    color: isUp ? '#00BA7C' : '#F91880',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                }}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(changePercent).toFixed(2)}%
                </div>
            </div>
        </div>
    );
};

const MarketWidget = () => {
    const [marketData, setMarketData] = useState([
        { symbol: 'BTC/USDT', name: 'Bitcoin', price: '...', change: 0 },
        { symbol: 'ETH/USDT', name: 'Ethereum', price: '...', change: 0 },
        { symbol: 'BIST 100', name: 'Borsa İstanbul', price: '8920.50', change: 1.2 },
        { symbol: 'USD/TRY', name: 'Dolar', price: '34.15', change: 0.15 },
    ]);

    // Live Crypto Data from Binance (Free, Public, Realtime)
    useEffect(() => {
        const fetchCrypto = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]');
                const data = await res.json();

                setMarketData(prev => prev.map(item => {
                    const match = data.find(d => d.symbol === item.symbol.replace('/', ''));
                    if (match) {
                        return {
                            ...item,
                            price: parseFloat(match.lastPrice).toFixed(2),
                            change: parseFloat(match.priceChangePercent)
                        };
                    }
                    return item;
                }));
            } catch (e) {
                console.error("Crypto API Error", e);
            }
        };

        const interval = setInterval(fetchCrypto, 5000);
        fetchCrypto();
        return () => clearInterval(interval);
    }, []);

    // Simulated BIST/USD data
    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prev => prev.map(item => {
                if (item.symbol === 'BIST 100' || item.symbol === 'USD/TRY') {
                    const currentPrice = parseFloat(item.price);
                    const flutter = currentPrice * (Math.random() * 0.001 - 0.0005);
                    const newPrice = currentPrice + flutter;
                    return {
                        ...item,
                        price: newPrice.toFixed(2)
                    };
                }
                return item;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="widget-box">
            <h3 className="widget-title">Piyasalar</h3>
            <div className="flex-col">
                {marketData.map((d, i) => (
                    <StockItem
                        key={i}
                        symbol={d.symbol}
                        name={d.name}
                        price={d.price}
                        changePercent={d.change}
                    />
                ))}
            </div>
            <div style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
                * Kripto verileri canlı, diğerleri simüledir.
            </div>
        </div>
    );
};

// 3. Moon Phase Widget
const MoonWidget = () => {
    const [phase, setPhase] = useState('');
    const [emoji, setEmoji] = useState('🌕');

    useEffect(() => {
        const getMoonPhase = (date) => {
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();

            if (month < 3) {
                year--;
                month += 12;
            }

            const c = 365.25 * year;
            const e = 30.6 * month;
            const jd = c + e + day - 694039.09;
            const b = jd / 29.5305882;
            const diff = Math.round((b - Math.floor(b)) * 8);

            if (diff === 0 || diff === 8) return { name: 'Yeni Ay', icon: '🌑' };
            if (diff === 1) return { name: 'Hilal', icon: '🌒' };
            if (diff === 2) return { name: 'İlk Dördün', icon: '🌓' };
            if (diff === 3) return { name: 'Şişkin Ay', icon: '🌔' };
            if (diff === 4) return { name: 'Dolunay', icon: '🌕' };
            if (diff === 5) return { name: 'Şişkin Ay', icon: '🌖' };
            if (diff === 6) return { name: 'Son Dördün', icon: '🌗' };
            if (diff === 7) return { name: 'Hilal', icon: '🌘' };
            return { name: 'Dolunay', icon: '🌕' };
        };

        const today = new Date();
        const p = getMoonPhase(today);
        setPhase(p.name);
        setEmoji(p.icon);
    }, []);

    return (
        <div className="widget-box">
            <h3 className="widget-title">Ay Durumu</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
                <div style={{ fontSize: '48px' }}>{emoji}</div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{phase}</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>İstanbul, Türkiye</div>
                </div>
            </div>
        </div>
    );
};

// --- Main Sidebar Component ---
const RightSidebar = () => {
    return (
        <div style={{
            width: '350px',
            marginLeft: '30px',
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '10px',
            height: 'fit-content'
        }}>
            <SearchBox />
            <MarketWidget />
            <MoonWidget />

            <style>{`
                .widget-box {
                    background: rgba(235, 235, 235, 0.45);
                    border-radius: 16px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                }
                .widget-title {
                    font-size: 20px;
                    font-weight: 800;
                    margin-bottom: 12px;
                }
            `}</style>
        </div>
    );
};

export default RightSidebar;
