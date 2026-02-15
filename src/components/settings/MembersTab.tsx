"use client";

import { useActionState, useState, useEffect, useMemo } from "react";
import { createUser, deleteUser } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditUserDialog } from "@/components/settings/EditUserDialog";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
}

interface ClientOption {
    id: string;
    name: string;
    email: string | null;
}

interface MembersTabProps {
    users: User[];
    clients?: ClientOption[];
}

const initialState = {
    success: false,
    message: ""
};

export function MembersTab({ users, clients = [] }: MembersTabProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [state, formAction] = useActionState(createUser, initialState);
    const [activeSubTab, setActiveSubTab] = useState<"team" | "clients">("team");
    const [selectedRole, setSelectedRole] = useState("COLABORADOR");

    const teamMembers = useMemo(() => users.filter(u => u.role !== "CLIENTE"), [users]);
    const clientUsers = useMemo(() => users.filter(u => u.role === "CLIENTE"), [users]);
    const displayedUsers = activeSubTab === "team" ? teamMembers : clientUsers;

    // Close dialog on success
    useEffect(() => {
        if (state?.success && open) {
            setOpen(false);
            toast.success(state.message || "Usuario invitado");
            router.refresh();
        } else if (state?.success === false && state?.message) {
            toast.error(state.message);
        }
    }, [state, open, router]);

    const handleDelete = async (user: User) => {
        try {
            setIsDeleting(user.id);
            const result = await deleteUser(user.email);
            if (result.success) {
                toast.success("Usuario eliminado");
                router.refresh();
            } else {
                toast.error(result.message || "Error al eliminar");
            }
        } catch (error) {
            toast.error("Error de red al eliminar");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Equipo y Clientes</h3>
                    <p className="text-sm text-muted-foreground">Gestiona el acceso y los roles de tu equipo y clientes.</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setSelectedRole("COLABORADOR"); }}>
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
                            {/* Role selector first so we can conditionally show client selector */}
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select name="role" value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUPERADMIN">Super Admin (Control Total)</SelectItem>
                                        <SelectItem value="PROJECT_MANAGER">Project Manager (Gestiona Proyectos)</SelectItem>
                                        <SelectItem value="COLABORADOR">Colaborador (Tareas)</SelectItem>
                                        <SelectItem value="CLIENTE">Cliente (Solo Vista)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Show client selector when role is CLIENTE */}
                            {selectedRole === "CLIENTE" && clients.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Vincular a Cliente</Label>
                                    <Select name="clientId">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un cliente..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name} {c.email ? `(${c.email})` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Al vincular un cliente, podrá ver sus proyectos al iniciar sesión.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input name="name" required placeholder="Ej: Ana Garcia" />
                            </div>
                            <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input name="email" type="email" required placeholder="ana@novaap.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contraseña</Label>
                                <Input name="password" type="text" required minLength={6} placeholder="Contraseña inicial" />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Enviar Invitación</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 border-b border-border/50">
                <button
                    onClick={() => setActiveSubTab("team")}
                    className={`px-4 py-2.5 text-sm font-medium transition-all relative flex items-center gap-2 ${activeSubTab === "team"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground/80"
                        }`}
                >
                    <Users className="h-3.5 w-3.5" />
                    Equipo
                    <span className="ml-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {teamMembers.length}
                    </span>
                    {activeSubTab === "team" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                    )}
                </button>
                <button
                    onClick={() => setActiveSubTab("clients")}
                    className={`px-4 py-2.5 text-sm font-medium transition-all relative flex items-center gap-2 ${activeSubTab === "clients"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground/80"
                        }`}
                >
                    <UserCheck className="h-3.5 w-3.5" />
                    Clientes
                    <span className="ml-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {clientUsers.length}
                    </span>
                    {activeSubTab === "clients" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                    )}
                </button>
            </div>

            <Card className="bg-card border-border/50">
                <CardContent className="p-0">
                    {displayedUsers.length === 0 ? (
                        <div className="text-center py-8">
                            {activeSubTab === "clients" ? (
                                <>
                                    <UserCheck className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No hay clientes registrados.</p>
                                </>
                            ) : (
                                <>
                                    <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No hay miembros del equipo.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {displayedUsers.map((user) => (
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
                                        <Badge variant="outline" className={
                                            user.role === 'SUPERADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                user.role === 'PROJECT_MANAGER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    user.role === 'CLIENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        ''
                                        }>
                                            {user.role}
                                        </Badge>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={isDeleting === user.id}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción eliminará a <strong>{user.name}</strong> ({user.email}) de la plataforma.
                                                        También se eliminará su acceso de Supabase Auth.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(user)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Eliminar Miembro
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <div className="w-px h-4 bg-border/50 mx-1" />
                                        <EditUserDialog user={user} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
