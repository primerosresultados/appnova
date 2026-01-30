'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, AlertCircle } from 'lucide-react'

const initialState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-white/20 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl relative z-10 transition-all hover:shadow-primary/5">
                <CardHeader className="space-y-1 text-center pb-8 border-b border-border/10">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0">
                            <ShieldCheck className="text-white h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 dark:from-indigo-100 dark:to-purple-200">
                        Nova Partners
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                        Acceso exclusivo para administradores
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" name="email" type="email" placeholder="admin@novapartners.cl" required className="bg-background/50 focus:bg-background transition-colors h-11" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                            </div>
                            <Input id="password" name="password" type="password" required className="bg-background/50 focus:bg-background transition-colors h-11" />
                        </div>

                        {state?.error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{state.error}</span>
                            </div>
                        )}

                        <Button disabled={isPending} type="submit" className="w-full h-11 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all hover:scale-[1.02]">
                            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground border-t border-border/10 pt-6">
                    <p className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Sistema Operativo
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
