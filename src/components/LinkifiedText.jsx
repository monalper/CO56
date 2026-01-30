import React, { useState } from 'react';

export const LinkifiedText = ({ text }) => {
    if (!text) return null;

    // URL regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlRegex);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007AFF', textDecoration: 'none' }} // Mavi link
                            onClick={(e) => e.stopPropagation()} // Kart tıklanmasını engelle
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
};
