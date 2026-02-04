'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Link2, Unlink } from 'lucide-react';
import { linkProjectToAdAccount, unlinkProjectFromAdAccount, getProjectAdAccount } from '@/app/actions/meta-actions';
import { useRouter } from 'next/navigation';

interface AdAccount {
    id: string;
    name: string;
}

interface MetaAdAccountSelectorProps {
    projectId: string;
    isMetaConnected: boolean;
}

export function MetaAdAccountSelector({ projectId, isMetaConnected }: MetaAdAccountSelectorProps) {
    const router = useRouter();
    const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isMetaConnected) {
            loadAdAccounts();
            loadProjectAdAccount();
        }
    }, [isMetaConnected, projectId]);

    const loadAdAccounts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/meta/ad-accounts');
            const data = await response.json();

            if (data.success) {
                setAdAccounts(data.data || []);
            } else {
                console.error('Failed to fetch ad accounts:', data.error);
            }
        } catch (error) {
            console.error('Error fetching ad accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProjectAdAccount = async () => {
        const result = await getProjectAdAccount(projectId);
        if (result.success && result.data?.adAccountId) {
            setSelectedAccount(result.data.adAccountId);
        }
    };

    const handleAccountChange = async (accountId: string) => {
        setIsSaving(true);

        const account = adAccounts.find(acc => acc.id === accountId);
        if (!account) return;

        const result = await linkProjectToAdAccount(projectId, accountId, account.name);

        if (result.success) {
            setSelectedAccount(accountId);
            router.refresh();
        } else {
            console.error('Failed to link ad account:', result.error);
            alert('Error al vincular la cuenta publicitaria');
        }

        setIsSaving(false);
    };

    const handleUnlink = async () => {
        setIsSaving(true);

        const result = await unlinkProjectFromAdAccount(projectId);

        if (result.success) {
            setSelectedAccount(null);
            router.refresh();
        } else {
            console.error('Failed to unlink ad account:', result.error);
            alert('Error al desvincular la cuenta publicitaria');
        }

        setIsSaving(false);
    };

    if (!isMetaConnected) {
        return (
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Meta Ad Account
                    </CardTitle>
                    <CardDescription>
                        Vincula este proyecto a una cuenta publicitaria de Meta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                        Primero debes conectar Meta en la configuración.
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/settings?tab=connections')}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir a Configuración
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Meta Ad Account
                </CardTitle>
                <CardDescription>
                    Vincula este proyecto a una cuenta publicitaria de Meta
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Cargando cuentas...</div>
                ) : adAccounts.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        No se encontraron cuentas publicitarias
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Select
                            value={selectedAccount || undefined}
                            onValueChange={handleAccountChange}
                            disabled={isSaving}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una cuenta publicitaria" />
                            </SelectTrigger>
                            <SelectContent>
                                {adAccounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.name} ({account.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedAccount && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnlink}
                                disabled={isSaving}
                                className="w-full"
                            >
                                <Unlink className="h-4 w-4 mr-2" />
                                {isSaving ? 'Desvinculando...' : 'Desvincular cuenta'}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
