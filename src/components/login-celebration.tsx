
"use client";

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

type CelebrationType = 'confetti' | 'fireworks' | 'balloons';

export const LoginCelebration = () => {
    const [celebration, setCelebration] = useState<CelebrationType | null>(null);
    const { width, height } = useWindowSize();

    useEffect(() => {
        const celebrations: CelebrationType[] = ['confetti', 'fireworks', 'balloons'];
        const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];
        setCelebration(randomCelebration);
    }, []);

    const confettiConfig = {
        confetti: {
            recycle: false,
            numberOfPieces: 200,
        },
        fireworks: {
            recycle: false,
            numberOfPieces: 150,
            gravity: 0.1,
            initialVelocityX: { min: -10, max: 10 },
            initialVelocityY: { min: -20, max: -10 },
            colors: ['#ffc700', '#ff0000', '#2e3191', '#41cac0'],
        },
        balloons: {
            recycle: false,
            numberOfPieces: 30,
            gravity: -0.05,
            initialVelocityY: { min: -5, max: -2 },
            shape: 'circle' as const,
        }
    };
    
    if (!celebration) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
            <Confetti
                width={width}
                height={height}
                {...confettiConfig[celebration]}
                onConfettiComplete={(confetti) => confetti?.reset()}
            />
        </div>
    );
};
