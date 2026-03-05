import { useState } from 'react';
import { useCohorts, useDeleteCohort } from '../../hooks/useAcademic.ts';
import { Layers, Calendar, Edit2, Trash2, Plus, ArrowLeft, CheckSquare, Trophy, UserPlus, Tag, ClipboardList } from 'lucide-react';
import { CohortModal } from './CohortModal.tsx';
import { AttendanceManager } from './AttendanceManager.tsx';
import { GradesManager } from './GradesManager.tsx';
import { CohortModuleManager } from './CohortModuleManager.tsx';
import { ModulePricingManager } from './ModulePricingManager.tsx';
import { AdminExamWorkspace } from './AdminExamWorkspace.tsx';
import { toast } from 'react-hot-toast';
import type { Cohort, AcademicProgram } from '../../types';

interface CohortListProps {
    program: AcademicProgram;
    onBack: () => void;
}

export function CohortList({ program, onBack }: CohortListProps) {
    const { data: cohorts, isLoading } = useCohorts(program.id);
    const deleteCohort = useDeleteCohort();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
    const [viewMode, setViewMode] = useState<{ mode: 'list' | 'attendance' | 'grades' | 'instructors' | 'pricing' | 'exams', cohort?: Cohort }>({ mode: 'list' });

    const handleEdit = (cohort: Cohort) => {
        setSelectedCohort(cohort);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCohort(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este grupo?')) {
            try {
                await deleteCohort.mutateAsync(id);
                toast.success('Grupo eliminado');
            } catch (err) {
                toast.error('Error al eliminar grupo');
            }
        }
    };

    if (viewMode.mode === 'attendance' && viewMode.cohort) {
        return (
            <AttendanceManager
                cohortId={viewMode.cohort.id}
                programId={program.id}
                onBack={() => setViewMode({ mode: 'list' })}
            />
        );
    }

    if (viewMode.mode === 'grades' && viewMode.cohort) {
        return (
            <GradesManager
                cohortId={viewMode.cohort.id}
                programId={program.id}
                onBack={() => setViewMode({ mode: 'list' })}
            />
        );
    }

    if (viewMode.mode === 'instructors' && viewMode.cohort) {
        return (
            <CohortModuleManager
                cohortId={viewMode.cohort.id}
                programId={program.id}
                onBack={() => setViewMode({ mode: 'list' })}
            />
        );
    }

    if (viewMode.mode === 'exams' && viewMode.cohort) {
        return (
            <AdminExamWorkspace
                cohortId={viewMode.cohort.id}
                programId={program.id}
                onBack={() => setViewMode({ mode: 'list' })}
            />
        );
    }

    if (viewMode.mode === 'pricing') {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        onClick={() => setViewMode({ mode: 'list' })}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Precios y Complementos</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{program.name}</p>
                    </div>
                </div>
                <ModulePricingManager programId={program.id} />
            </div>
        );
    }

    if (isLoading) return <div className="p-12 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando grupos...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{program.name}</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Administración de Grupos</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setViewMode({ mode: 'pricing' })}
                        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center"
                    >
                        <Tag className="w-4 h-4 mr-2" />
                        Gestionar Precios
                    </button>
                    <button
                        onClick={handleCreate}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center shadow-lg shadow-emerald-600/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Abrir Nueva Cohorte
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.isArray(cohorts) && cohorts.map((cohort) => (
                    <div key={cohort.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-500 border border-emerald-900/30 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg tracking-tight">{cohort.name}</h4>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${cohort.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {cohort.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(cohort)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cohort.id)}
                                    className="p-2 bg-rose-600/10 hover:bg-rose-600/20 rounded-lg text-rose-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-800">
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center">
                                    <Calendar className="w-3 h-3 mr-1.5" /> Inicio
                                </span>
                                <p className="text-slate-300 text-xs font-medium">
                                    {new Date(cohort.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center">
                                    <Calendar className="w-3 h-3 mr-1.5" /> Estudiantes
                                </span>
                                <p className="text-slate-300 text-xs font-medium">
                                    Sincronizado
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/50">
                            <button
                                onClick={() => setViewMode({ mode: 'attendance', cohort })}
                                className="flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-xl transition-all border border-slate-700/50 group/btn"
                            >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Asistencia</span>
                            </button>
                            <button
                                onClick={() => setViewMode({ mode: 'grades', cohort })}
                                className="flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-amber-600/20 hover:text-amber-500 rounded-xl transition-all border border-slate-700/50"
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Calificaciones</span>
                            </button>
                            <button
                                onClick={() => setViewMode({ mode: 'exams', cohort })}
                                className="flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-xl transition-all border border-slate-700/50"
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Exámenes</span>
                            </button>
                            <button
                                onClick={() => setViewMode({ mode: 'instructors', cohort })}
                                className="flex items-center justify-center space-x-2 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl transition-all border border-indigo-500/20 hover:border-indigo-500/40"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Docentes Modular</span>
                            </button>
                        </div>
                    </div>
                ))}

                {cohorts?.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[2.5rem]">
                        <Layers className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-20" />
                        <p className="text-slate-500 text-sm">No hay grupos creados para este programa.</p>
                    </div>
                )}
            </div>

            <CohortModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cohort={selectedCohort}
                defaultProgramId={program.id}
            />
        </div>
    );
}
