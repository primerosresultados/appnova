'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plug, CheckCircle2, AlertCircle } from 'lucide-react';
import { getMetaConnectionStatus } from '@/app/actions/meta-actions';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function MetaConnectionCard() {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);
    const [connectedAt, setConnectedAt] = useState<Date | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

    // Load connection status
    useEffect(() => {
        loadConnectionStatus();
    }, []);

    const loadConnectionStatus = async () => {
        setIsLoading(true);
        const result = await getMetaConnectionStatus();

        if (result.success && result.data) {
            setIsConnected(result.data.connected);
            setConnectedAt(result.data.connectedAt ? new Date(result.data.connectedAt) : null);
            setIsExpired(result.data.isExpired || false);
        }

        setIsLoading(false);
    };

    const handleConnect = () => {
        // Redirect to Meta OAuth connect endpoint
        window.location.href = '/api/auth/meta/connect';
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);

        try {
            const response = await fetch('/api/auth/meta/disconnect', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                setIsConnected(false);
                setConnectedAt(null);
                setIsExpired(false);
                router.refresh();
            } else {
                console.error('Failed to disconnect:', data.error);
                alert('Error al desconectar Meta. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error disconnecting Meta:', error);
            alert('Error al desconectar Meta. Por favor intenta de nuevo.');
        } finally {
            setIsDisconnecting(false);
            setShowDisconnectDialog(false);
        }
    };

    return (
        <>
            <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meta (Facebook)</CardTitle>
                    <Plug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-muted-foreground">Cargando...</div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                {isConnected && !isExpired ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <div className="text-2xl font-bold">Conectado</div>
                                    </>
                                ) : isExpired ? (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        <div className="text-2xl font-bold text-yellow-600">Token Expirado</div>
                                    </>
                                ) : (
                                    <div className="text-2xl font-bold text-muted-foreground">Desconectado</div>
                                )}
                            </div>

                            {isConnected && connectedAt && !isExpired && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Conectado el {connectedAt.toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}

                            <p className="text-xs text-muted-foreground mt-1 mb-4">
                                Vincula proyectos a cuentas publicitarias
                            </p>

                            {isConnected && !isExpired ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowDisconnectDialog(true)}
                                    disabled={isDisconnecting}
                                >
                                    {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleConnect}
                                >
                                    {isExpired ? 'Reconectar' : 'Conectar con Meta'}
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desconectar Meta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto eliminará la conexión con Meta y desvinculará todas las cuentas publicitarias de tus proyectos.
                            Podrás volver a conectar en cualquier momento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnect}>
                            Desconectar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
