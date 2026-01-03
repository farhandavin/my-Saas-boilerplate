'use client';
import { usePrivacy } from "@/providers/PrivacyProvider";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PrivacyToggle() {
    const { isBlurred, togglePrivacy } = usePrivacy();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={togglePrivacy} 
                        className="text-text-sub hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isBlurred ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isBlurred ? "Show Sensitive Data" : "Hide Sensitive Data (Demo Mode)"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
