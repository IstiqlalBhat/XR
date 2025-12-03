/**
 * Configuration and Constants
 * Central configuration for the particle system
 */

export const CONFIG = {
    particle: {
        count: 18000,
        size: 0.07,
        morphSpeed: 0.04,
        velocityDamping: 0.92
    },
    smoothing: {
        scale: { 
            factor: 0.12, 
            deadZone: 0.02 
        },
        rotation: { 
            factor: 0.08, 
            deadZone: 0.01 
        },
        emaAlpha: { 
            scale: 0.4, 
            rotation: 0.3, 
            pinch: 0.5 
        }
    },
    hand: {
        gracePeriod: 500,
        detectionConfidence: 0.7,
        trackingConfidence: 0.6,
        maxHands: 2
    },
    autoRotate: {
        speed: 0.003,
        oscillation: { 
            amplitude: 0.08, 
            frequency: 0.3 
        }
    }
};

