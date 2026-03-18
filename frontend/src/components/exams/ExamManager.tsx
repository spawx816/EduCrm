import { useState } from 'react';
import { useModuleExams, useCohortExamAssignments, useAssignExam, useAssignmentResults, useUpdateAssignmentSchedule, useDeleteExam } from '../../hooks/useExams';
import { useAuth } from '../../hooks/useAuth';
import { ClipboardList, Plus, Calendar, Clock, CheckCircle2, Eye, X, User, Edit3, Settings, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExamBuilder } from './ExamBuilder';
import { ConfirmModal } from '../shared/ConfirmModal';

interface ExamManagerProps {
    cohortId: string;
    moduleId: string;
    programId: string;
}

export function ExamManager({ cohortId, moduleId }: ExamManagerProps) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'director';

    const { data: exams, isLoading: loadingExams } = useModuleExams(moduleId);
    const { data: assignments, isLoading: loadingAssign } = useCohortExamAssignments(cohortId);

    const [editingExamId, setEditingExamId] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [assigningExam, setAssigningExam] = useState<any>(null);
    const [schedulingAssignment, setSchedulingAssignment] = useState<any>(null);
    const [assignDates, setAssignDates] = useState({ start: '', end: '' });
    const [viewResultsId, setViewResultsId] = useState<string | null>(null);
    const [examToDelete, setExamToDelete] = useState<any>(null);

    const assignMutation = useAssignExam();
    const scheduleMutation = useUpdateAssignmentSchedule();
    const deleteMutation = useDeleteExam();

    const handleDeleteExam = async () => {
        if (!examToDelete) return;
        try {
            await deleteMutation.mutateAsync({ id: examToDelete.id });
            toast.success('Examen eliminado correctamente');
            setExamToDelete(null);
        } catch (error) {
            toast.error('Error al eliminar el examen');
        }
    };

    const handleAssign = async () => {
        try {
            await assignMutation.mutateAsync({
                exam_id: assigningExam.id,
                cohort_id: cohortId,
                module_id: moduleId,
                // Assigning without dates if admin just wants to link it, 
                // or with default dates if provided in UI (though user says Teacher sets them)
                start_date: assignDates.start || undefined,
                end_date: assignDates.end || undefined
            });
            toast.success('Examen vinculado correctamente');
            setAssigningExam(null);
        } catch (error) {
            toast.error('Error al asignar examen');
        }
    };

    const handleSchedule = async () => {
        if (!assignDates.start || !assignDates.end) {
            toast.error('Debes seleccionar las fechas de inicio y fin');
            return;
        }

        try {
            await scheduleMutation.mutateAsync({
                id: schedulingAssignment.id,
                cohort_id: cohortId,
                start_date: assignDates.start,
                end_date: assignDates.end
            });
            toast.success('Programación actualizada');
            setSchedulingAssignment(null);
        } catch (error) {
            toast.error('Error al programar examen');
        }
    };

    if (isCreatingNew || editingExamId) {
        return (
            <ExamBuilder
                moduleId={moduleId}
                examId={editingExamId || undefined}
                onBack={() => {
                    setIsCreatingNew(false);
                    setEditingExamId(null);
                }}
            />
        );
    }

    if (loadingExams || loadingAssign) return <div className="p-10 text-center animate-pulse text-indigo-500 font-black uppercase tracking-widest text-[10px]">Cargando Banco de Exámenes...</div>;

    const assignedIds = new Set(assignments?.map((a: any) => a.exam_id));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center">
                        <ClipboardList className="w-6 h-6 mr-3 text-indigo-500" />
                        Gestión de Evaluaciones
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Exámenes vinculados al módulo actual</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreatingNew(true)}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Crear Examen</span>
                    </button>
                )}
            </div>

            <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
                {/* Available Exams Bank - Only for Admin to link, or for Teacher to see available? User says Admin assigns to module. */}
                {isAdmin && (
                    <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] overflow-hidden">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">Banco de Exámenes (Admin)</h3>
                        </div>
                        <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                            {Array.isArray(exams) && exams.map((exam: any) => {
                                const isAssigned = assignedIds.has(exam.id);
                                return (
                                    <div key={exam.id} className="p-5 flex items-center justify-between group hover:bg-slate-800/20 transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isAssigned ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{exam.title}</p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{exam.time_limit_minutes} min • {exam.passing_score}% aprob.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setEditingExamId(exam.id)}
                                                className="p-2 bg-slate-950 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-slate-800 transition-all"
                                                title="Editar contenido"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => setExamToDelete(exam)}
                                                className="p-2 bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 transition-all ml-1"
                                                title="Eliminar examen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            {!isAssigned && (
                                                <button
                                                    onClick={() => setAssigningExam(exam)}
                                                    className="p-2 bg-slate-950 text-slate-500 hover:text-white hover:bg-indigo-600 rounded-lg border border-slate-800 transition-all"
                                                    title="Asignar a este módulo"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isAssigned && (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Assignments in this Cohort */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] overflow-hidden">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">Exámenes Asignados</h3>
                    </div>
                    <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                        {Array.isArray(assignments) && assignments.map((assign: any) => (
                            <div key={assign.id} className="p-6 space-y-4 hover:bg-indigo-500/5 transition-all">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-black text-white">{assign.exam_title}</p>
                                    <div className={`px-2 py-0.5 ${(assign.start_date && assign.end_date) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} text-[8px] font-black uppercase tracking-widest rounded-full border ${(assign.start_date && assign.end_date) ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                                        {(assign.start_date && assign.end_date) ? 'Programado' : 'Pendiente Fecha'}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-[10px] font-bold text-slate-500">
                                            <Calendar className="w-3 h-3 mr-2 text-indigo-500" />
                                            {assign.start_date ? `${new Date(assign.start_date).toLocaleDateString()} - ${new Date(assign.end_date).toLocaleDateString()}` : 'No programado'}
                                        </div>
                                        <div className="flex items-center text-[10px] font-bold text-slate-500">
                                            <Clock className="w-3 h-3 mr-2 text-indigo-500" />
                                            {assign.time_limit_minutes} min
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setSchedulingAssignment(assign);
                                                const now = new Date();
                                                const tomorrow = new Date();
                                                tomorrow.setDate(now.getDate() + 1);

                                                const formatDate = (date: Date, setEndOfDay = false) => {
                                                    const d = new Date(date);
                                                    if (setEndOfDay) d.setHours(23, 59, 0, 0);
                                                    const tzOffset = d.getTimezoneOffset() * 60000;
                                                    return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
                                                };

                                                setAssignDates({
                                                    start: assign.start_date ? formatDate(new Date(assign.start_date)) : formatDate(now),
                                                    end: assign.end_date ? formatDate(new Date(assign.end_date)) : formatDate(tomorrow, true)
                                                });
                                            }}
                                            className="p-2.5 bg-slate-950 border border-slate-800 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                                            title="Programar fecha/hora"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewResultsId(assign.id)}
                                            className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                                            title="Ver Calificaciones"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!assignments || assignments.length === 0) && (
                            <div className="p-12 text-center opacity-30">
                                <ClipboardList className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No hay exámenes asignados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={!!examToDelete}
                title="Eliminar Examen"
                message={`¿Estás seguro de que deseas eliminar el examen "${examToDelete?.title}"? Esta acción eliminará irremediablemente el examen, sus preguntas y los resultados asociados.`}
                onConfirm={handleDeleteExam}
                onCancel={() => setExamToDelete(null)}
                isLoading={deleteMutation.isPending}
            />

            {viewResultsId && (
                <AssignmentResultsView
                    assignmentId={viewResultsId}
                    onClose={() => setViewResultsId(null)}
                />
            )}

            {assigningExam && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-8 border-b border-slate-800">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Vincular Examen</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{assigningExam.title}</p>
                        </div>
                        <div className="p-8">
                            <p className="text-xs text-slate-400 leading-relaxed mb-6">¿Estás seguro de vincular este examen a este grupo? El docente podrá programar la fecha y hora posteriormente.</p>
                            <div className="flex space-x-3">
                                <button onClick={() => setAssigningExam(null)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                                <button
                                    onClick={handleAssign}
                                    disabled={assignMutation.isPending}
                                    className="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    {assignMutation.isPending ? 'Vinculando...' : 'Confirmar Vínculo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {schedulingAssignment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-8 border-b border-slate-800">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Programar Examen</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{schedulingAssignment.exam_title}</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Fecha/Hora de Inicio</label>
                                    <input
                                        type="datetime-local"
                                        value={assignDates.start}
                                        onChange={(e) => setAssignDates(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Fecha/Hora de Cierre</label>
                                    <input
                                        type="datetime-local"
                                        value={assignDates.end}
                                        onChange={(e) => setAssignDates(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => setSchedulingAssignment(null)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                                <button
                                    onClick={handleSchedule}
                                    disabled={scheduleMutation.isPending}
                                    className="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                >
                                    {scheduleMutation.isPending ? 'Programando...' : 'Confirmar Programación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AssignmentResultsView({ assignmentId, onClose }: { assignmentId: string; onClose: () => void }) {
    const { data: results, isLoading } = useAssignmentResults(assignmentId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80] flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Tablero de Calificaciones</h3>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Resumen de desempeño por estudiante</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 rounded-2xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="py-20 text-center animate-pulse text-indigo-500 font-black uppercase tracking-widest text-[10px]">Consultando registros...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 px-6 py-3 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                <div className="col-span-1">Mat.</div>
                                <div className="col-span-5">Estudiante</div>
                                <div className="col-span-3">Puntaje</div>
                                <div className="col-span-3 text-right">Estado</div>
                            </div>

                            <div className="space-y-3">
                                {Array.isArray(results) && results.map((res: any) => (
                                    <div key={res.id} className="grid grid-cols-12 items-center bg-slate-900/30 border border-slate-800/50 hover:border-indigo-500/30 p-6 rounded-2xl transition-all group">
                                        <div className="col-span-1 text-[10px] font-mono text-slate-500">#{res.matricula}</div>
                                        <div className="col-span-5 flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{res.first_name} {res.last_name}</p>
                                                <p className="text-[9px] text-slate-500 font-medium">{res.email}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="flex items-center space-x-2">
                                                <p className={`text-lg font-black ${res.score >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {Number(res.score).toFixed(1)}
                                                </p>
                                                <span className="text-[10px] text-slate-500 font-bold">/ 100</span>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${res.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                {res.status === 'COMPLETED' ? 'Completado' : 'En Curso'}
                                            </span>
                                            <p className="text-[8px] text-slate-500 mt-2 font-bold uppercase">
                                                {res.completed_at ? new Date(res.completed_at).toLocaleString() : 'Pendiente'}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {(!results || results.length === 0) && (
                                    <div className="py-20 text-center opacity-30 border border-dashed border-slate-800 rounded-3xl">
                                        <User className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Nadie ha tomado este examen aún</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                        Cerrar Tablero
                    </button>
                </div>
            </div>
        </div>
    );
}
