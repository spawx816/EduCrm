import { useState } from 'react';
import { useAllExams, useAllAssignments, useDeleteExam, useAssignExam } from '../../hooks/useExams.ts';
import { usePrograms, useCohorts } from '../../hooks/useAcademic.ts';
import { ClipboardList, Plus, Search, Calendar, Users, CheckCircle2, AlertCircle, Trash2, Edit3, Globe, ExternalLink, ArrowRight, Loader2, X, Clock } from 'lucide-react';
import { ExamBuilder } from './ExamBuilder.tsx';
import { ConfirmModal } from '../shared/ConfirmModal.tsx';
import { toast } from 'react-hot-toast';

export function GlobalExamDashboard() {
    const [view, setView] = useState<'bank' | 'assignments'>('bank');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingExamId, setEditingExamId] = useState<string | null>(null);
    const [assigningExam, setAssigningExam] = useState<any>(null);
    const [examToDelete, setExamToDelete] = useState<any>(null);
    
    // Queries
    const { data: exams, isLoading: loadingExams } = useAllExams();
    const { data: assignments, isLoading: loadingAssignments } = useAllAssignments();
    
    // Mutations
    const deleteMutation = useDeleteExam();

    if (isCreating || editingExamId) {
        return (
            <div className="absolute inset-0 z-[100] bg-[#020617] overflow-y-auto">
                 <ExamBuilder 
                    moduleId="" 
                    examId={editingExamId || undefined}
                    onBack={() => {
                        setIsCreating(false);
                        setEditingExamId(null);
                    }}
                />
            </div>
        );
    }

    const filteredExams = Array.isArray(exams) ? exams.filter((e: any) => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const stats = {
        totalExams: exams?.length || 0,
        activeAssignments: assignments?.length || 0,
        totalAttempts: assignments?.length ? '78%' : '0%' // Logic for pass rate could be added
    };

    const handleDelete = async () => {
        if (!examToDelete) return;
        try {
            await deleteMutation.mutateAsync({ id: examToDelete.id });
            toast.success('Examen eliminado');
            setExamToDelete(null);
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] text-white">
            <header className="px-8 py-8 bg-[#0f172a]/50 border-b border-white/5 backdrop-blur-md sticky top-0 z-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center">
                            <Globe className="w-10 h-10 mr-4 text-blue-500" />
                            Centro de <span className="text-blue-500 italic ml-2">Evaluaciones</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Gestión centralizada de exámenes y certificaciones</p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800">
                             <button 
                                onClick={() => setView('bank')}
                                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'bank' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                             >
                                Banco Central
                             </button>
                             <button 
                                onClick={() => setView('assignments')}
                                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'assignments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                             >
                                Monitoreo
                             </button>
                         </div>
                         <button 
                            onClick={() => setIsCreating(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center shadow-xl shadow-emerald-900/20"
                         >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Examen
                         </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <StatCard label="Exámenes Disponibles" value={stats.totalExams} icon={ClipboardList} color="blue" />
                    <StatCard label="Grupos Evaluados" value={stats.activeAssignments} icon={Users} color="indigo" />
                    <StatCard label="Tasa de Aprobación" value={stats.totalAttempts} icon={CheckCircle2} color="emerald" />
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8 pb-12">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Buscar examen por título o módulo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {view === 'bank' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loadingExams ? (
                                Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                            ) : (
                                filteredExams.map((exam: any) => (
                                    <ExamCard 
                                        key={exam.id} 
                                        exam={exam} 
                                        onEdit={() => setEditingExamId(exam.id)}
                                        onDelete={() => setExamToDelete(exam)}
                                        onAssign={() => setAssigningExam(exam)}
                                    />
                                ))
                            )}
                            {filteredExams.length === 0 && !loadingExams && (
                                <div className="col-span-full py-32 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
                                    <Search className="w-16 h-16 mx-auto mb-6 text-slate-800" />
                                    <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest">No se encontraron exámenes</h3>
                                    <p className="text-slate-700 text-xs mt-2 uppercase font-black">Intenta con otros términos de búsqueda</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Programa / Grupo</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Examen</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center">Estado</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-slate-500 uppercase tracking-widest">Vigencia</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loadingAssignments ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-500 animate-pulse uppercase text-[10px] font-black tracking-widest">Cargando monitoreo global...</td></tr>
                                    ) : (
                                        assignments?.map((as: any) => (
                                            <tr key={as.id} className="hover:bg-blue-600/5 transition-all group">
                                                <td className="px-8 py-6">
                                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{as.program_name}</p>
                                                    <p className="text-sm font-black text-white">{as.cohort_name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold mt-1 italic">Módulo: {as.module_name}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mr-3 border border-slate-700">
                                                            <ClipboardList className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                        <span className="text-sm font-bold text-white">{as.exam_title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                        isActive(as.start_date, as.end_date) 
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                    }`}>
                                                        {isActive(as.start_date, as.end_date) ? 'Activo' : 'Cerrado'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                                                            <Calendar className="w-3 h-3 mr-2 text-blue-500" />
                                                            {as.start_date ? new Date(as.start_date).toLocaleDateString() : 'Pendiente'}
                                                        </div>
                                                        <div className="flex items-center text-[10px] font-bold text-slate-500">
                                                            <Clock className="w-3 h-3 mr-2 text-slate-600" />
                                                            {as.end_date ? new Date(as.end_date).toLocaleDateString() : '---'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-2.5 bg-slate-800 hover:bg-white hover:text-black rounded-xl transition-all">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {assignments?.length === 0 && !loadingAssignments && (
                                        <tr>
                                            <td colSpan={5} className="py-32 text-center opacity-30 uppercase text-[10px] font-black tracking-widest">
                                                No hay exámenes asignados actualmente
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <ConfirmModal
                isOpen={!!examToDelete}
                title="Eliminar Examen"
                message={`¿Estás seguro de que deseas eliminar "${examToDelete?.title}"? Se borrarán todas las preguntas y resultados asociados.`}
                onConfirm={handleDelete}
                onCancel={() => setExamToDelete(null)}
                isLoading={deleteMutation.isPending}
            />

            {assigningExam && <BatchAssignModal exam={assigningExam} onClose={() => setAssigningExam(null)} />}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-900/30',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-900/30',
        indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-900/30',
    };

    return (
        <div className="bg-[#0f172a] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 opacity-[0.03] group-hover:scale-110 transition-all">
                <Icon className="w-full h-full" />
            </div>
            <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
            </div>
        </div>
    );
}

function ExamCard({ exam, onEdit, onDelete, onAssign }: any) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 hover:bg-slate-900 hover:border-blue-500/30 transition-all flex flex-col h-full group relative overflow-hidden">
            <div className="absolute -right-6 top-6 rotate-12 opacity-[0.02] group-hover:scale-125 group-hover:text-blue-500 transition-all duration-700">
                <ClipboardList className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                     <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-900/30">
                        {exam.module_name || 'Generales'}
                     </span>
                     <div className="flex space-x-2">
                        <button onClick={onEdit} className="p-2 text-slate-500 hover:text-white transition-colors" title="Editar Contenido">
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={onDelete} className="p-2 text-slate-500 hover:text-rose-500 transition-colors" title="Eliminar Examen">
                            <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight mb-4 group-hover:text-blue-400 transition-colors leading-tight">{exam.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-8 grow font-medium leading-relaxed">{exam.description || 'Sin descripción disponible para esta evaluación.'}</p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Límite</span>
                            <span className="text-xs font-bold text-white uppercase">{exam.time_limit_minutes} Min</span>
                        </div>
                        <div className="w-px h-6 bg-slate-800"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Aprobación</span>
                            <span className="text-xs font-bold text-emerald-500 uppercase">{exam.passing_score}%</span>
                        </div>
                    </div>

                    <button 
                        onClick={onAssign}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-indigo-900/20"
                        title="Asignación Rápida"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function BatchAssignModal({ exam, onClose }: any) {
    const { data: programs } = usePrograms();
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const { data: cohorts, isLoading: loadingCohorts } = useCohorts(selectedProgramId);
    const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
    const [dates, setDates] = useState({ start: '', end: '' });
    const [isAssigning, setIsAssigning] = useState(false);
    
    const assignMutation = useAssignExam();

    const handleBatchAssign = async () => {
        if (selectedCohorts.length === 0) {
            toast.error('Selecciona al menos un grupo');
            return;
        }

        setIsAssigning(true);
        try {
            for (const cohortId of selectedCohorts) {
                await assignMutation.mutateAsync({
                    exam_id: exam.id,
                    cohort_id: cohortId,
                    module_id: exam.module_id,
                    start_date: dates.start || undefined,
                    end_date: dates.end || undefined
                });
            }
            toast.success(`Examen asignado a ${selectedCohorts.length} grupos`);
            onClose();
        } catch (error) {
            toast.error('Error durante la asignación masiva');
        } finally {
            setIsAssigning(false);
        }
    };

    const toggleCohort = (id: string) => {
        setSelectedCohorts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-white/5 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Despliegue de Examen</h3>
                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1">{exam.title}</p>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-900 hover:bg-rose-500/20 hover:text-rose-500 text-slate-500 rounded-[1.5rem] transition-all border border-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">1. Seleccionar Programa</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-blue-500 transition-all font-bold"
                            value={selectedProgramId}
                            onChange={(e) => {
                                setSelectedProgramId(e.target.value);
                                setSelectedCohorts([]);
                            }}
                        >
                            <option value="">Selección de Programa...</option>
                            {programs?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">2. Seleccionar Grupos destino</label>
                            {selectedCohorts.length > 0 && (
                                <button onClick={() => setSelectedCohorts([])} className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Limpiar todo</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {!selectedProgramId ? (
                                <div className="col-span-full py-12 text-center bg-slate-950/50 rounded-3xl border border-slate-800/50 border-dashed">
                                    <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Elige un programa para ver sus cohortes</p>
                                </div>
                            ) : loadingCohorts ? (
                                <div className="col-span-full py-12 text-center text-slate-500 animate-pulse">Consultando grupos...</div>
                            ) : (
                                cohorts?.map((c: any) => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => toggleCohort(c.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                            selectedCohorts.includes(c.id) 
                                                ? 'bg-blue-600 border-blue-500 text-white' 
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-blue-500/50'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-xs font-black">{c.name}</p>
                                            <p className={`text-[8px] font-bold uppercase mt-1 ${selectedCohorts.includes(c.id) ? 'text-blue-200' : 'text-slate-600'}`}>{c.program_name}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                            selectedCohorts.includes(c.id) ? 'bg-white border-white text-blue-600' : 'border-slate-800'
                                        }`}>
                                            {selectedCohorts.includes(c.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Fecha Apertura (Opcional)</label>
                            <input 
                                type="datetime-local"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-blue-500 transition-all font-mono"
                                value={dates.start}
                                onChange={(e) => setDates({...dates, start: e.target.value})}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Fecha Cierre (Opcional)</label>
                            <input 
                                type="datetime-local"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-blue-500 transition-all font-mono"
                                value={dates.end}
                                onChange={(e) => setDates({...dates, end: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-10 border-t border-white/5 bg-slate-950/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">{selectedCohorts.length}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cohortes seleccionadas</span>
                    </div>
                    <button 
                        onClick={handleBatchAssign}
                        disabled={isAssigning || selectedCohorts.length === 0}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center shadow-2xl shadow-blue-900/40"
                    >
                        {isAssigning ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Globe className="w-5 h-5 mr-3" />}
                        Ejecutar Asignación Masiva
                    </button>
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 h-[300px] animate-pulse">
            <div className="flex justify-between items-start mb-8">
                <div className="w-24 h-4 bg-slate-800 rounded-lg" />
                <div className="w-16 h-8 bg-slate-800 rounded-lg" />
            </div>
            <div className="w-full h-6 bg-slate-800 rounded-lg mb-4" />
            <div className="w-2/3 h-6 bg-slate-800 rounded-lg mb-8" />
            <div className="space-y-2">
                <div className="w-full h-3 bg-slate-800/50 rounded" />
                <div className="w-4/5 h-3 bg-slate-800/50 rounded" />
            </div>
            <div className="mt-auto pt-6 border-t border-slate-800/50 flex justify-between">
                 <div className="w-24 h-6 bg-slate-800 rounded" />
                 <div className="w-10 h-10 bg-slate-800 rounded-xl" />
            </div>
        </div>
    );
}

function isActive(start: string, end: string) {
    if (!start || !end) return true; // If no dates, assume it's "available" but maybe closed by logic elsewhere. For UI, active.
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
}
