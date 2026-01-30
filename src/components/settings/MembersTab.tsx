"use client";

import { useActionState, useState } from "react";
import { createUser } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
}

interface MembersTabProps {
    users: User[];
}

const initialState = {
    success: false,
    message: ""
};

export function MembersTab({ users }: MembersTabProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createUser, initialState);

    // Close dialog on success
    if (state?.success && open) {
        setOpen(false);
        router.refresh(); // Refresh to show new user
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Equipo</h3>
                    <p className="text-sm text-muted-foreground">Gestiona el acceso y los roles de tu equipo.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Invitar Miembro
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invitar Nuevo Miembro</DialogTitle>
                            <DialogDescription>Agrega a un nuevo integrante al equipo.</DialogDescription>
                        </DialogHeader>
                        <form action={formAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input name="name" required placeholder="Ej: Ana Garcia" />
                            </div>
                            <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input name="email" type="email" required placeholder="ana@novaap.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select name="role" defaultValue="MEMBER">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                        <SelectItem value="MEMBER">Miembro</SelectItem>
                                        <SelectItem value="VIEWER">Visualizador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Enviar Invitación</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-card/50 border-border/50">
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.avatar || undefined} />
                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className={user.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                                        {user.role}
                                    </Badge>
                                    <Button variant="ghost" size="sm">Editar</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
