"use client";

import { useState } from "react";
import { submitQuizProspect } from "./actions";
import { Rocket, Sparkles, ArrowRight, ArrowLeft, Send, CheckCircle2, Megaphone, PenTool, BarChart3, Users, Globe, Zap } from "lucide-react";

const questions = [
    {
        id: "presencia",
        question: "¿Tu marca tiene presencia en redes sociales?",
        emoji: "📱",
        options: [
            { value: "no", label: "No, recién empiezo", icon: Rocket },
            { value: "basica", label: "Sí, pero muy básica", icon: Globe },
            { value: "activa", label: "Sí, público seguido", icon: Users },
            { value: "pro", label: "Sí, con estrategia profesional", icon: Zap },
        ],
    },
    {
        id: "objetivo",
        question: "¿Cuál es tu principal objetivo de marketing?",
        emoji: "🎯",
        options: [
            { value: "visibilidad", label: "Darme a conocer", icon: Megaphone },
            { value: "ventas", label: "Aumentar ventas", icon: BarChart3 },
            { value: "marca", label: "Construir marca sólida", icon: PenTool },
            { value: "todo", label: "¡Todo lo anterior!", icon: Sparkles },
        ],
    },
    {
        id: "contenido",
        question: "¿Qué tipo de contenido te interesa más?",
        emoji: "🎬",
        options: [
            { value: "fotos", label: "Fotos y gráficas" },
            { value: "videos", label: "Reels y videos cortos" },
            { value: "stories", label: "Historias y contenido efímero" },
            { value: "todo", label: "Un mix de todo" },
        ],
    },
    {
        id: "presupuesto",
        question: "¿Cuánto podrías invertir mensualmente en marketing?",
        emoji: "💰",
        options: [
            { value: "bajo", label: "Menos de $200.000" },
            { value: "medio", label: "$200.000 – $500.000" },
            { value: "alto", label: "$500.000 – $1.000.000" },
            { value: "premium", label: "Más de $1.000.000" },
        ],
    },
    {
        id: "urgencia",
        question: "¿Qué tan urgente es para ti empezar?",
        emoji: "⏰",
        options: [
            { value: "ya", label: "¡Lo necesito ya!" },
            { value: "pronto", label: "En las próximas semanas" },
            { value: "explorando", label: "Solo estoy explorando" },
            { value: "planificando", label: "Planificando para más adelante" },
        ],
    },
];

export function QuizClient() {
    const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = contact form, N+2 = success
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [contactData, setContactData] = useState({ name: "", email: "", phone: "", company: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const totalSteps = questions.length + 2; // intro + questions + contact
    const isIntro = step === 0;
    const isContact = step === questions.length + 1;
    const isSuccess = step === questions.length + 2;
    const currentQuestion = step >= 1 && step <= questions.length ? questions[step - 1] : null;
    const progress = Math.min(((step) / (totalSteps - 1)) * 100, 100);

    const selectAnswer = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        // Auto-advance after 400ms
        setTimeout(() => setStep(s => s + 1), 400);
    };

    const handleSubmit = async () => {
        if (!contactData.name.trim()) return;
        setIsSubmitting(true);

        // Build friendly answer map
        const friendlyAnswers: Record<string, string> = {};
        questions.forEach(q => {
            const selected = q.options.find(o => o.value === answers[q.id]);
            if (selected) {
                friendlyAnswers[q.question] = selected.label;
            }
        });

        const res = await submitQuizProspect({
            name: contactData.name,
            email: contactData.email || undefined,
            phone: contactData.phone || undefined,
            company: contactData.company || undefined,
            answers: friendlyAnswers,
        });

        setResult(res.message);
        setIsSubmitting(false);
        if (res.success) setStep(questions.length + 2);
    };

    // Compute a "recommendation" based on answers
    const recommendation = (() => {
        const obj = answers.objetivo;
        const pres = answers.presencia;
        if (pres === "no" || pres === "basica") {
            return "🚀 Tu marca necesita una estrategia digital desde cero. ¡Podemos ayudarte a construir presencia sólida!";
        }
        if (obj === "ventas") {
            return "📈 Enfoque en conversiones: anuncios optimizados + contenido persuasivo para maximizar tus ventas.";
        }
        if (obj === "marca") {
            return "🎨 Branding + contenido premium para posicionar tu marca como referente en tu industria.";
        }
        return "✨ Un plan integral de marketing digital con contenido, estrategia y resultados medibles.";
    })();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            {/* Progress bar */}
            {!isIntro && !isSuccess && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="w-full max-w-2xl relative z-10">

                {/* ── INTRO ── */}
                {isIntro && (
                    <div className="text-center space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-4">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            Quiz interactivo · 2 minutos
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                            ¿Qué necesita
                            <br />
                            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                                tu marca?
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/50 max-w-md mx-auto">
                            Responde 5 preguntas rápidas y descubre qué servicios de marketing digital harán crecer tu negocio.
                        </p>

                        <button
                            onClick={() => setStep(1)}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Empezar
                            <ArrowRight className="h-5 w-5" />
                        </button>

                        <p className="text-xs text-white/30 mt-4">Sin compromiso · 100% gratis</p>
                    </div>
                )}

                {/* ── QUESTION STEP ── */}
                {currentQuestion && (
                    <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-500" key={currentQuestion.id}>
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Atrás
                        </button>

                        <div className="text-center space-y-4">
                            <span className="text-5xl">{currentQuestion.emoji}</span>
                            <h2 className="text-2xl md:text-3xl font-bold">{currentQuestion.question}</h2>
                            <p className="text-sm text-white/40">Pregunta {step} de {questions.length}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentQuestion.options.map(opt => {
                                const isSelected = answers[currentQuestion.id] === opt.value;
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => selectAnswer(currentQuestion.id, opt.value)}
                                        className={`
                                            flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
                                            ${isSelected
                                                ? "bg-white/10 border-violet-500/50 shadow-lg shadow-violet-500/10 scale-[1.02]"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]"
                                            }
                                        `}
                                    >
                                        {Icon && <Icon className="h-5 w-5 text-violet-400 shrink-0" />}
                                        <span className="text-sm font-medium">{opt.label}</span>
                                        {isSelected && <CheckCircle2 className="h-4 w-4 text-violet-400 ml-auto shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── CONTACT FORM ── */}
                {isContact && (
                    <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Atrás
                        </button>

                        <div className="text-center space-y-4">
                            <span className="text-5xl">📋</span>
                            <h2 className="text-2xl md:text-3xl font-bold">¡Casi listo!</h2>
                            <p className="text-white/50">Déjanos tus datos y te enviaremos una propuesta personalizada.</p>
                        </div>

                        {/* Recommendation preview */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-pink-600/10 border border-violet-500/20 text-sm text-white/80">
                            <p className="font-semibold text-violet-300 mb-1">Tu resultado:</p>
                            <p>{recommendation}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1.5 block">Nombre *</label>
                                <input
                                    type="text"
                                    value={contactData.name}
                                    onChange={e => setContactData(d => ({ ...d, name: e.target.value }))}
                                    placeholder="Tu nombre o el de tu empresa"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        value={contactData.email}
                                        onChange={e => setContactData(d => ({ ...d, email: e.target.value }))}
                                        placeholder="tu@email.com"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1.5 block">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={contactData.phone}
                                        onChange={e => setContactData(d => ({ ...d, phone: e.target.value }))}
                                        placeholder="+56 9 1234 5678"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1.5 block">Empresa / Marca</label>
                                <input
                                    type="text"
                                    value={contactData.company}
                                    onChange={e => setContactData(d => ({ ...d, company: e.target.value }))}
                                    placeholder="Nombre de tu empresa"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {result && !isSuccess && (
                            <p className="text-red-400 text-sm text-center">{result}</p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !contactData.name.trim()}
                            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Enviando..." : "Enviar y ver mi resultado"}
                            <Send className="h-5 w-5" />
                        </button>

                        <p className="text-xs text-white/30 text-center">No spam · Tus datos están seguros</p>
                    </div>
                )}

                {/* ── SUCCESS ── */}
                {isSuccess && (
                    <div className="text-center space-y-8 animate-in fade-in-0 zoom-in-95 duration-700">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold">¡Listo! 🎉</h2>

                        <div className="p-6 rounded-xl bg-gradient-to-r from-violet-600/10 to-pink-600/10 border border-violet-500/20 text-white/80 max-w-lg mx-auto">
                            <p className="font-semibold text-violet-300 mb-2">Nuestra recomendación para ti:</p>
                            <p className="text-lg">{recommendation}</p>
                        </div>

                        <p className="text-white/50 max-w-md mx-auto">
                            Nuestro equipo revisará tus respuestas y te contactará
                            con una propuesta personalizada en las próximas 24 horas.
                        </p>

                        <div className="pt-4">
                            <p className="text-xs text-white/30">Powered by Nova Partners</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
