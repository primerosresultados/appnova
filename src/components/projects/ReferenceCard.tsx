"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface ReferenceCardProps {
    link: {
        id: string;
        name: string;
        url: string | null;
        content: string | null;
    };
    onDelete: (id: string) => void;
}

export function ReferenceCard({ link, onDelete }: ReferenceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    let embedSrc = null;
    let embedType = null;
    try {
        const urlObj = new URL(link.url || "");
        if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
            let vId = urlObj.searchParams.get("v");
            if (urlObj.hostname.includes("youtu.be")) vId = urlObj.pathname.slice(1);
            if (urlObj.pathname.includes("/shorts/")) vId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0];
            if (vId) { embedSrc = `https://www.youtube.com/embed/${vId}`; embedType = "video"; }
        } else if (urlObj.hostname.includes("instagram.com")) {
            const cleanPath = urlObj.pathname.replace(/\/$/, "");
            embedSrc = `https://www.instagram.com${cleanPath}/embed`;
            embedType = "instagram";
        } else if (urlObj.hostname.includes("pinterest")) {
            const parts = urlObj.pathname.split("/").filter(Boolean);
            const pinIdx = parts.indexOf("pin");
            if (pinIdx !== -1 && parts[pinIdx + 1]) {
                embedSrc = `https://assets.pinterest.com/ext/embed.html?id=${parts[pinIdx + 1]}`;
                embedType = "pinterest";
            }
        }
    } catch (e) { }

    return (
        <div className="group relative rounded-lg border bg-card hover:shadow-sm transition-all overflow-hidden flex flex-col">
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-20 h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-border"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(link.id);
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            {embedSrc ? (
                <div className="flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between gap-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                            <span className="text-primary/70">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </span>
                            <div className="font-medium text-sm truncate" title={link.name}>{link.name}</div>
                        </div>
                        <a href={link.url || '#'} target="_blank" className="text-muted-foreground hover:text-primary p-1" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                        <div className={`w-full bg-muted/20 relative animate-in slide-in-from-top-2 duration-200 ${embedType === 'video' ? 'aspect-video' : 'h-[500px]'}`}>
                            <iframe
                                src={embedSrc}
                                className="w-full h-full absolute inset-0"
                                frameBorder="0"
                                allowFullScreen
                                scrolling="no"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <a
                    href={link.url || '#'}
                    target="_blank"
                    className="flex items-center p-3 hover:bg-accent/50 transition-colors"
                >
                    {link.content ? (
                        <div className="h-12 w-12 shrink-0 rounded overflow-hidden bg-muted mr-3 border border-border/50">
                            <img src={link.content} alt={link.name} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div className="h-10 w-10 shrink-0 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 mr-3">
                            <ExternalLink className="h-5 w-5" />
                        </div>
                    )}
                    <div className="flex-1 truncate">
                        <div className="font-medium text-sm truncate">{link.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                    </div>
                </a>
            )}
        </div>
    );
}
