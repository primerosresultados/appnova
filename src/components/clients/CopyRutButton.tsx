"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CopyRutButtonProps {
    rut: string;
}

export function CopyRutButton({ rut }: CopyRutButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(rut);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-primary transition-colors group"
            title="Copiar RUT"
        >
            <span className="truncate max-w-[120px]">{rut}</span>
            {copied ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </button>
    );
}
