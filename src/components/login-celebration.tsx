"use client";

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export const LoginCelebration = () => {
    const [showConfetti, setShowConfetti] = useState(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        // Check if we should show the celebration
        const shouldShow = localStorage.getItem('showLoginCelebration');
        if (shouldShow === 'true') {
            setShowConfetti(true);
            // Remove the flag immediately
            localStorage.removeItem('showLoginCelebration');

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, []);

    // Handle keyboard events for 'dj' dismissal
    useEffect(() => {
        let typedKeys = '';
        const keyHandler = (e: KeyboardEvent) => {
            typedKeys += e.key.toLowerCase();
            if (typedKeys.includes('dj')) {
                setShowConfetti(false);
            }
            // Reset after 1 second of no typing
            setTimeout(() => {
                typedKeys = '';
            }, 1000);
        };

        if (showConfetti) {
            window.addEventListener('keydown', keyHandler);
            return () => window.removeEventListener('keydown', keyHandler);
        }
    }, [showConfetti]);

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
                numberOfPieces={200}
                gravity={0.2}
                initialVelocityY={10}
                colors={['#ffc700', '#ff0000', '#2e3191', '#41cac0', '#ff69b4']}
            />
        </div>
    );
};