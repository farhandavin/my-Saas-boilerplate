'use client';

import { useEffect } from 'react';
import { useTeam } from '@/context/TeamContext';

// Helper to calculate hex to RGB for Tailwind opacity utility compatibility e.g. bg-primary/20
// If you use strict hex variables, tailwind opacity modifiers won't work unless defined as `rgb(var(--primary) / <alpha-value>)`
// For simplicity in this implementation, we will just set the HEX value to the variable.
// If you want opacity support, you need to convert hex to r g b.

function hexToRgb(hex: string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
}

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
    const { currentTeam } = useTeam();

    useEffect(() => {
        if (!currentTeam?.branding) return;

        const { primaryColor, accentColor } = currentTeam.branding;
        const root = document.documentElement;

        if (primaryColor) {
            // We set it as simple HEX AND as RGB values if your tailwind config expects that.
            // Using a common pattern: --primary: #hex
            root.style.setProperty('--primary', primaryColor);
             // Also setting the Tailwind-compatible RGB-list version if your config uses it (e.g. "rgb(var(--primary) / <alpha-value>)")
             // Assuming your existing config might not be set up for this yet, but let's add it for "Enterprise OS" completeness.
             const rgb = hexToRgb(primaryColor);
             if (rgb) root.style.setProperty('--primary-rgb', rgb);
        }

        if (accentColor) {
            root.style.setProperty('--accent', accentColor);
        }
        
    }, [currentTeam]);

    return <>{children}</>;
}
