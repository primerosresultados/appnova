'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, MessageSquare } from 'lucide-react';
import { createComment, deleteComment } from '@/app/actions/comment-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        avatar?: string | null;
    };
}

interface CommentSectionProps {
    reportId: string;
    comments: Comment[];
    currentUser?: {
        id: string;
        name: string;
        avatar?: string | null;
    };
}

export function CommentSection({ reportId, comments, currentUser }: CommentSectionProps) {
    const router = useRouter();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser || !newComment.trim()) {
            return;
        }

        setIsSubmitting(true);
        const result = await createComment(reportId, newComment.trim(), currentUser.id);
        setIsSubmitting(false);

        if (result.success) {
            setNewComment('');
            toast.success('Comentario agregado');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al comentar');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!currentUser || !confirm('¿Eliminar este comentario?')) {
            return;
        }

        const result = await deleteComment(commentId, currentUser.id);

        if (result.success) {
            toast.success('Comentario eliminado');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al eliminar');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-semibold">Comentarios ({comments.length})</h3>
            </div>

            {/* Comment List */}
            <div className="space-y-3">
                {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No hay comentarios aún. ¡Sé el primero en comentar!
                    </p>
                )}

                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.avatar || undefined} />
                            <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(comment.createdAt), "dd MMM 'a las' HH:mm", { locale: es })}
                                    </span>
                                </div>
                                {currentUser && currentUser.id === comment.user.id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment Form */}
            {currentUser && (
                <form onSubmit={handleSubmit} className="space-y-2">
                    <Textarea
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Comentar'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
