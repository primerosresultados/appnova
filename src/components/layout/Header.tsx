"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Users, FolderKanban, ListTodo, User, Loader2, Menu, X, LogOut as KeyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationCarousel } from "./NotificationCarousel";
import { globalSearch, SearchResult } from "@/app/actions/search-actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { ClientProjectSelector } from "@/components/clients/ClientProjectSelector";
import { getUserSession } from "@/app/actions/auth-actions";

export interface HeaderProps {
    onMenuClick?: () => void;
    isClient?: boolean;
}

export function Header({ onMenuClick, isClient = false }: HeaderProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
            setIsOpen(searchResults.length > 0 || query.length >= 2);
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

    const SearchResults = () => (
        <>
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="max-h-[60vh] overflow-y-auto">
                        {results.map((result) => (
                            <Link
                                key={`${result.type}-${result.id}`}
                                href={result.href}
                                onClick={() => {
                                    setIsOpen(false);
                                    setQuery("");
                                    setMobileSearchOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 active:bg-accent transition-colors border-b border-border/50 last:border-b-0">
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
                                        "text-[10px] px-2 py-0.5 rounded-full font-medium hidden sm:inline",
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
                    <div className="px-4 py-2 bg-muted/30 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground text-center">
                            {results.length} resultado{results.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}

            {query.length >= 2 && !isSearching && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 p-6 text-center">
                    <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
                </div>
            )}
        </>
    );

    return (
        <>
            <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b border-border bg-background/50 px-4 md:px-6 backdrop-blur-xl transition-all gap-3">
                {/* Mobile Menu Button - Hide for Clients */}
                {!isClient && (
                    <button
                        className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                {/* Desktop Search & Notifications - Customize/Hide for Clients */}
                <div className={`flex-1 hidden md:flex items-center gap-4 ${isClient ? 'justify-start' : ''}`}>
                    {!isClient ? (
                        <>
                            <div className="relative flex-1 max-w-xl" ref={searchRef}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
                                )}
                                <Input
                                    placeholder="Buscar clientes, proyectos, tareas..."
                                    className="pl-9 pr-9 bg-accent/30 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 w-full"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => results.length > 0 && setIsOpen(true)}
                                />
                                <SearchResults />
                            </div>
                            <NotificationCarousel />
                        </>
                    ) : (
                        <ClientProjectSelector />
                    )}
                </div>

                {/* Mobile: Logo/Title */}
                <div className="flex-1 md:hidden">
                    <span className="font-bold text-lg">Nova</span>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Button - Hide for Clients */}
                    {!isClient && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-muted-foreground hover:text-foreground"
                            onClick={() => setMobileSearchOpen(true)}
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </Button>
                    <ModeToggle />
                    {isClient && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={async () => {
                                const { logout } = await import('@/app/login/actions');
                                await logout();
                            }}
                            title="Cerrar Sesión"
                        >
                            <KeyIcon className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </header>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && !isClient && (
                <div className="fixed inset-0 z-50 bg-background md:hidden">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 p-4 border-b border-border">
                            <button
                                onClick={() => {
                                    setMobileSearchOpen(false);
                                    setQuery("");
                                    setResults([]);
                                }}
                                className="p-2 -ml-2 hover:bg-accent rounded-md"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="relative flex-1" ref={searchRef}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                                )}
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-9 pr-9 bg-accent/30 border-transparent w-full"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {results.length > 0 ? (
                                <div className="space-y-2">
                                    {results.map((result) => (
                                        <Link
                                            key={`${result.type}-${result.id}`}
                                            href={result.href}
                                            onClick={() => {
                                                setMobileSearchOpen(false);
                                                setQuery("");
                                            }}
                                        >
                                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 active:bg-accent transition-colors border border-border/50">
                                                <div className="shrink-0 h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-border/50">
                                                    {getIcon(result.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{result.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {getTypeLabel(result.type)} • {result.subtitle || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : query.length >= 2 && !isSearching ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No se encontraron resultados</p>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Escribe para buscar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
