import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    CirclePlus,
    Bell,
    FileText,
    Bookmark,
    X
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const [isUpdateVisible, setIsUpdateVisible] = useState(true);

    const isActive = (path) => location.pathname === path;

    return (
        <div
            className="sidebar-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 56px)',
                width: '275px',
                padding: '12px',
                position: 'sticky',
                top: '56px',
                alignItems: 'flex-start'
            }}
        >
            {/* Navigation */}
            <nav
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    width: '100%',
                    flex: 1
                }}
            >
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <Home size={26} fill={isActive('/') ? 'currentColor' : 'none'} />
                    <span>Home</span>
                </Link>

                <Link
                    to="/create"
                    className={`nav-item ${isActive('/create') ? 'active' : ''}`}
                >
                    <CirclePlus
                        size={26}
                        fill={isActive('/create') ? 'currentColor' : 'none'}
                    />
                    <span>Create</span>
                </Link>

                <Link
                    to="/notifications"
                    className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
                >
                    <Bell
                        size={26}
                        fill={isActive('/notifications') ? 'currentColor' : 'none'}
                    />
                    <span>Notification</span>
                </Link>

                <Link
                    to="/articles"
                    className={`nav-item ${isActive('/articles') ? 'active' : ''}`}
                >
                    <FileText
                        size={26}
                        fill={isActive('/articles') ? 'currentColor' : 'none'}
                    />
                    <span>Articles</span>
                </Link>

                <Link
                    to="/bookmarks"
                    className={`nav-item ${isActive('/bookmarks') ? 'active' : ''}`}
                >
                    <Bookmark
                        size={26}
                        fill={isActive('/bookmarks') ? 'currentColor' : 'none'}
                    />
                    <span>Bookmarks</span>
                </Link>
            </nav>

            {/* Güncelleme Kutusu */}
            {isUpdateVisible && (
                <div
                    style={{
                        backgroundColor: '#1d9bf0',
                        color: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        width: '100%',
                        position: 'relative',
                        marginTop: 'auto',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        minHeight: '120px'
                    }}
                >
                    {/* Kapatma Butonu */}
                    <button
                        onClick={() => setIsUpdateVisible(false)}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            opacity: 0.8,
                            zIndex: 2
                        }}
                    >
                        <X size={18} />
                    </button>

                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
                        New Update
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: '1.4', width: '70%', position: 'relative', zIndex: 1 }}>
                        Co56 is currently still in the development phase.
                    </p>

                    {/* Donate Metni */}
                    <a
                        href="#donate"
                        style={{
                            color: 'white',
                            fontSize: '13px',
                            textDecoration: 'underline',
                            fontWeight: '500',
                            position: 'relative',
                            zIndex: 1,
                            cursor: 'pointer'
                        }}
                    >
                        Donate
                    </a>

                    {/* SVG Görseli */}
                    <img
                        src="/humanity.svg"
                        alt="humanity"
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '80px',
                            height: 'auto',
                            opacity: '0.9',
                            pointerEvents: 'none'
                        }}
                    />
                </div>
            )}

            <style>{`
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 9999px;
                    text-decoration: none;
                    color: inherit;
                    font-size: 20px;
                    transition: background-color 0.2s;
                    width: fit-content;
                }
                .nav-item:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                .nav-item.active {
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;