import { useState, useEffect } from 'react';
import { useExamAttemptDetail, useSubmitAttempt } from '../../hooks/useExams';
import { Clock, CheckCircle, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExamSessionProps {
    attemptId: string;
    onComplete: () => void;
}

export function ExamSession({ attemptId, onComplete }: ExamSessionProps) {
    const { data: exam, isLoading } = useExamAttemptDetail(attemptId);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({}); // { qId: optionId } or { qId: { optionId: matchText } }
    const [timeLeft, setTimeLeft] = useState(3600);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitMutation = useSubmitAttempt();

    useEffect(() => {
        if (exam?.time_limit_minutes) {
            setTimeLeft(exam.time_limit_minutes * 60);
        }
    }, [exam]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const formattedAnswers = Object.entries(answers).flatMap(([qId, answer]) => {
            if (typeof answer === 'object') {
                // MATCHING case
                return Object.entries(answer).map(([oId, text]) => ({
                    question_id: qId,
                    option_id: oId,
                    text_answer: text as string
                }));
            }
            return [{
                question_id: qId,
                option_id: answer as string
            }];
        });

        try {
            await submitMutation.mutateAsync({ attemptId, answers: formattedAnswers });
            toast.success('Examen enviado correctamente');
            onComplete();
        } catch (error) {
            toast.error('Error al enviar el examen');
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="fixed inset-0 bg-[#020617] z-[100] flex items-center justify-center font-black text-blue-500 animate-pulse uppercase tracking-widest">Iniciando Sesión de Evaluación...</div>;

    const questions = exam?.questions || [];
    const currentQuestion = questions[currentStep];

    return (
        <div className="fixed inset-0 bg-[#020617] z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500 text-white font-sans">
            <header className="h-20 border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md flex items-center justify-between px-8">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-black text-sm tracking-tight uppercase">{exam?.title}</h2>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-blue-500" /> Tiempo Restante: <span className="text-white ml-2 font-mono text-xs">{formatTime(timeLeft)}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden md:block text-right">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Progreso</p>
                        <p className="text-xs font-black text-white">{currentStep + 1} de {questions.length} preguntas</p>
                    </div>
                    <button
                        onClick={() => { if (confirm('¿Seguro que deseas finalizar?')) handleSubmit(); }}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        <Send className="w-3 h-3" />
                        <span>Finalizar</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <div className="max-w-3xl mx-auto px-6 py-16">
                    {currentQuestion && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">Pregunta {currentStep + 1}</span>
                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{currentQuestion.text}</h1>
                            </div>

                            {currentQuestion.image_url && (
                                <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 max-h-80 flex justify-center">
                                    <img src={currentQuestion.image_url} alt="Support" className="max-w-full h-full object-contain" />
                                </div>
                            )}

                            {currentQuestion.type === 'MATCHING' ? (
                                <div className="space-y-4">
                                    {currentQuestion.options.map((opt: any) => (
                                        <div key={opt.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
                                            <p className="text-sm font-bold text-slate-300">{opt.text}</p>
                                            <select
                                                value={answers[currentQuestion.id]?.[opt.id] || ''}
                                                onChange={(e) => {
                                                    const qAnswers = answers[currentQuestion.id] || {};
                                                    setAnswers({
                                                        ...answers,
                                                        [currentQuestion.id]: { ...qAnswers, [opt.id]: e.target.value }
                                                    });
                                                }}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500"
                                            >
                                                <option value="">Selecciona una opción...</option>
                                                {[...currentQuestion.options]
                                                    .map((o: any) => o.match_text)
                                                    .map((match: string, i: number) => (
                                                        <option key={i} value={match}>{match}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.options?.map((opt: any) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setAnswers({ ...answers, [currentQuestion.id]: opt.id })}
                                            className={`p-6 rounded-3xl border text-left transition-all flex items-center group ${answers[currentQuestion.id] === opt.id
                                                ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20 translate-x-1'
                                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${answers[currentQuestion.id] === opt.id
                                                ? 'bg-white border-white scale-110'
                                                : 'border-slate-800 bg-slate-950 group-hover:border-slate-600'
                                                }`}>
                                                {answers[currentQuestion.id] === opt.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                            </div>
                                            <span className={`text-base font-bold ${answers[currentQuestion.id] === opt.id ? 'text-white' : 'text-slate-300'}`}>{opt.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="h-24 border-t border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center px-8">
                <div className="max-w-3xl w-full flex items-center justify-between">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-all disabled:opacity-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Anterior</span>
                    </button>

                    <div className="flex space-x-2">
                        {questions.map((_q: any, idx: number) => (
                            <div
                                key={idx}
                                className={`h-1.5 transition-all rounded-full ${idx === currentStep ? 'w-8 bg-blue-500' :
                                    answers[questions[idx].id] ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
                                    }`}
                            />
                        ))}
                    </div>

                    {currentStep < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="flex items-center space-x-2 text-blue-500 hover:text-white transition-all"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">Siguiente</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 text-emerald-500 hover:text-white transition-all"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">Enviar Todo</span>
                            <Send className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
