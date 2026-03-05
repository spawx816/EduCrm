import { useState } from 'react';
import { useCohortExamAssignments, useStudentAttempts, useStartAttempt } from '../../hooks/useExams';
import { ClipboardList, Clock, Play, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExamSession } from './ExamSession.tsx';

interface StudentExamsProps {
    studentId: string;
    cohortId: string;
}

export function StudentExams({ studentId, cohortId }: StudentExamsProps) {
    const { data: assignments, isLoading: loadingAssignments } = useCohortExamAssignments(cohortId);
    const { data: attempts, isLoading: loadingAttempts } = useStudentAttempts(studentId);
    const startAttemptMutation = useStartAttempt();

    const [activeAttempt, setActiveAttempt] = useState<any>(null);

    const handleStartExam = async (assignmentId: string) => {
        try {
            const attempt = await startAttemptMutation.mutateAsync({ studentId, assignmentId });
            setActiveAttempt(attempt);
        } catch (error) {
            toast.error('No se pudo iniciar el examen. Quizás ya lo realizaste o el tiempo expiró.');
        }
    };

    if (activeAttempt) {
        return <ExamSession attemptId={activeAttempt.id} onComplete={() => setActiveAttempt(null)} />;
    }

    if (loadingAssignments || loadingAttempts) return <div className="p-10 text-center animate-pulse text-blue-500 font-black uppercase tracking-widest text-[10px]">Cargando Banco de Evaluaciones...</div>;

    const attemptedAssignmentIds = new Set(attempts?.map((a: any) => a.assignment_id));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center">
                        <Trophy className="w-6 h-6 mr-3 text-blue-500" />
                        Mis Evaluaciones
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Pruebas asignadas a tu programa académico</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(assignments) && assignments.map((assign: any) => {
                    const isCompleted = attemptedAssignmentIds.has(assign.id);
                    const attempt = attempts?.find((a: any) => a.assignment_id === assign.id);
                    const endDate = new Date(assign.end_date);
                    const now = new Date();
                    const isExpired = endDate < now;
                    const isClosingToday = endDate.toDateString() === now.toDateString() && !isExpired;

                    return (
                        <div key={assign.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">{assign.module_name}</p>
                                    <h3 className="text-xl font-black text-white">{assign.exam_title}</h3>
                                </div>
                                {isCompleted ? (
                                    <div className="flex flex-col items-end">
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        <p className="text-lg font-black text-emerald-500 mt-1">{Number(attempt.score).toFixed(1)} pts</p>
                                    </div>
                                ) : (
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${isExpired ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        isClosingToday ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                        {isExpired ? 'Expirado' : isClosingToday ? 'Cierra Hoy' : 'Disponible'}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-6 mb-8">
                                <div className="flex items-center text-slate-500">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{assign.time_limit_minutes} Minutos</span>
                                </div>
                                <div className="flex items-center text-slate-500">
                                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Único Intento</span>
                                </div>
                            </div>

                            {!isCompleted && !isExpired && (
                                <button
                                    onClick={() => handleStartExam(assign.id)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/20 group-hover:scale-[1.02]"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>Comenzar Evaluación</span>
                                </button>
                            )}

                            {isExpired && !isCompleted && (
                                <div className="w-full py-4 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-center border border-slate-700">
                                    Tiempo Agotado
                                </div>
                            )}

                            {isCompleted && (
                                <div className="w-full py-4 bg-emerald-500/5 text-emerald-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-center border border-emerald-500/20">
                                    Evaluación Completada
                                </div>
                            )}
                        </div>
                    );
                })}
                {assignments?.length === 0 && (
                    <div className="col-span-2 p-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
                        <ClipboardList className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No tienes exámenes pendientes</h3>
                        <p className="text-slate-600 text-sm mt-2">¡Sigue así! Tu progreso académico está al día.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
