import React from 'react';

export const LinkifiedText = ({ text }) => {
    if (!text) return null;

    // URL and Sticker regex (Updated: added onering, removed kiddancing and trollface)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const stickerRegex = /(:co56:|:onering:)/g;

    // Sticker map for easy management
    const stickers = {
        ':co56:': { src: '/sticker/co56.svg', alt: 'co56' },
        ':onering:': { src: '/sticker/onering.svg', alt: 'one ring' }
    };

    // Split by URLs first
    const parts = text.split(urlRegex);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={`url-${index}`}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007AFF', textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }

                // Match stickers within non-URL text
                const subParts = part.split(stickerRegex);
                return subParts.map((subPart, subIndex) => {
                    if (stickers[subPart]) {
                        return (
                            <img
                                key={`sticker-${index}-${subIndex}`}
                                src={stickers[subPart].src}
                                alt={stickers[subPart].alt}
                                style={{
                                    height: '1.2em',
                                    verticalAlign: 'middle',
                                    margin: '0 2px',
                                    display: 'inline-block',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    pointerEvents: 'none',
                                    WebkitUserDrag: 'none'
                                }}
                                draggable="false"
                            />
                        );
                    }
                    return subPart;
                });
            })}
        </span>
    );
};