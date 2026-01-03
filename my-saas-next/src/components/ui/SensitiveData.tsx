'use client';

import { usePrivacy } from "@/providers/PrivacyProvider";
import { cn } from "@/lib/utils";

export function SensitiveData({ children, className }: { children: React.ReactNode, className?: string }) {
    const { isBlurred } = usePrivacy();

    return (
        <span className={cn("transition-all duration-300", isBlurred ? "blur-sm select-none" : "blur-0", className)}>
            {children}
        </span>
    );
}
