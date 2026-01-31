"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Users, FolderKanban, ListTodo, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationCarousel } from "./NotificationCarousel";
import { globalSearch, SearchResult } from "@/app/actions/search-actions";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const searchResults = await globalSearch(query);
            setResults(searchResults);
            setIsOpen(searchResults.length > 0);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'CLIENT': return <Users className="h-4 w-4 text-emerald-500" />;
            case 'PROJECT': return <FolderKanban className="h-4 w-4 text-blue-500" />;
            case 'TASK': return <ListTodo className="h-4 w-4 text-amber-500" />;
            case 'USER': return <User className="h-4 w-4 text-purple-500" />;
        }
    };

    const getTypeLabel = (type: SearchResult['type']) => {
        switch (type) {
            case 'CLIENT': return 'Cliente';
            case 'PROJECT': return 'Proyecto';
            case 'TASK': return 'Tarea';
            case 'USER': return 'Usuario';
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-6">
                <div className="relative w-80 hidden md:block" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
                    )}
                    <Input
                        placeholder="Buscar clientes, proyectos, tareas..."
                        className="pl-9 pr-9 bg-accent/30 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setIsOpen(true)}
                    />

                    {/* Search Results Dropdown */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="max-h-[400px] overflow-y-auto">
                                {results.map((result) => (
                                    <Link
                                        key={`${result.type}-${result.id}`}
                                        href={result.href}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setQuery("");
                                        }}
                                    >
                                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-b-0">
                                            <div className="shrink-0 h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/50">
                                                {getIcon(result.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{result.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {result.subtitle || getTypeLabel(result.type)}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                                result.type === 'CLIENT' && "bg-emerald-500/10 text-emerald-500",
                                                result.type === 'PROJECT' && "bg-blue-500/10 text-blue-500",
                                                result.type === 'TASK' && "bg-amber-500/10 text-amber-500",
                                                result.type === 'USER' && "bg-purple-500/10 text-purple-500",
                                            )}>
                                                {getTypeLabel(result.type)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {results.length > 0 && (
                                <div className="px-4 py-2 bg-muted/30 border-t border-border/50">
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results state */}
                    {query.length >= 2 && !isSearching && results.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 p-6 text-center">
                            <p className="text-sm text-muted-foreground">No se encontraron resultados para "{query}"</p>
                        </div>
                    )}
                </div>
                <NotificationCarousel />
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </Button>
            </div>
        </header>
    );
}
