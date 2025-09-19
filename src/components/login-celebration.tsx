"use client";

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useSearchParams } from 'next/navigation';

export const LoginCelebration = () => {
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check URL parameter for celebration
        const shouldCelebrate = searchParams.get('celebrate') === 'true';
        console.log('Should celebrate:', shouldCelebrate);
        
        if (shouldCelebrate) {
            console.log('Starting celebration');
            setShowConfetti(true);
            
            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                console.log('Ending celebration');
                setShowConfetti(false);
            }, 5000);

            return () => {
                clearTimeout(timer);
                setShowConfetti(false);
            };
        }
    }, [searchParams]);

    if (!showConfetti) return null;

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 9999,
            pointerEvents: 'none' // Allow clicking through the confetti
        }}>
            <Confetti
                width={width}
                height={height}
                recycle={true}
                numberOfPieces={300}
                gravity={0.3}
                initialVelocityY={15}
                friction={0.99}
                colors={['#ffc700', '#ff0000', '#2e3191', '#41cac0', '#ff69b4', '#9c27b0']}
                confettiSource={{x: width/2, y: 0, w: 0, h: 0}}
            />
        </div>
    );
};