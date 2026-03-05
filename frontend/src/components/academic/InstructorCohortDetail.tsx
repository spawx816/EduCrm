import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useInstructorModules } from '../../hooks/useInstructor';
import { useCohortStudents } from '../../hooks/useAcademic';
import { ArrowLeft, Users, Trophy, Calendar, BookOpen, ChevronRight, GraduationCap, ClipboardList } from 'lucide-react';
import { AttendanceManager } from './AttendanceManager';
import { GradesManager } from './GradesManager';
import { ExamManager } from '../exams/ExamManager';

interface InstructorCohortDetailProps {
    cohort: any;
    onBack: () => void;
}

type ViewMode = 'OVERVIEW' | 'ATTENDANCE' | 'GRADES' | 'EXAMS';

export function InstructorCohortDetail({ cohort, onBack }: InstructorCohortDetailProps) {
    const { user } = useAuth();
    const { data: modules, isLoading: modulesLoading } = useInstructorModules(cohort.id, user?.id);
    const { data: students, isLoading: studentsLoading } = useCohortStudents(cohort.id);

    const [selectedModuleId, setSelectedModuleId] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('OVERVIEW');

    if (modulesLoading || studentsLoading) return (
        <div className="p-20 text-center text-indigo-500 font-black animate-pulse uppercase tracking-widest">
            Preparando expedientes académicos...
        </div>
    );

    if (viewMode === 'ATTENDANCE' && selectedModuleId) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <button onClick={() => setViewMode('OVERVIEW')} className="flex items-center text-slate-400 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Resumen
                </button>
                <AttendanceManager
                    cohortId={cohort.id}
                    programId={cohort.program_id}
                    initialModuleId={selectedModuleId}
                />
            </div>
        );
    }

    if (viewMode === 'GRADES' && selectedModuleId) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <button onClick={() => setViewMode('OVERVIEW')} className="flex items-center text-slate-400 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Resumen
                </button>
                <GradesManager
                    cohortId={cohort.id}
                    programId={cohort.program_id}
                    initialModuleId={selectedModuleId}
                />
            </div>
        );
    }

    if (viewMode === 'EXAMS' && selectedModuleId) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <button onClick={() => setViewMode('OVERVIEW')} className="flex items-center text-slate-400 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Resumen
                </button>
                <ExamManager
                    cohortId={cohort.id}
                    moduleId={selectedModuleId}
                    programId={cohort.program_id}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Panel Principal</span>
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tight">{cohort.name}</h1>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{cohort.program_name}</p>
                </div>
                <div className="flex bg-slate-900 rounded-2xl border border-slate-800 p-4 space-x-6">
                    <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-slate-500" />
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Estudiantes</p>
                            <p className="text-sm font-black text-white">{students?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Picker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                            Seleccionar Módulo
                        </h3>
                        <div className="space-y-3">
                            {Array.isArray(modules) && modules.map((m: any) => (
                                <button
                                    key={m.module_id}
                                    onClick={() => setSelectedModuleId(m.module_id)}
                                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border ${selectedModuleId === m.module_id
                                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-tight opacity-70">Módulo</p>
                                        <p className="text-xs font-bold">{m.module_name}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedModuleId === m.module_id ? 'rotate-90' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedModuleId && (
                        <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2rem] animate-in zoom-in-95 duration-300">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Acciones Académicas</h4>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setViewMode('ATTENDANCE')}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center"
                                >
                                    <Calendar className="w-4 h-4 mr-2" /> Reportar Asistencia
                                </button>
                                <button
                                    onClick={() => setViewMode('GRADES')}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border border-slate-800 flex items-center justify-center"
                                >
                                    <Trophy className="w-4 h-4 mr-2 text-amber-500" /> Registrar Calificaciones
                                </button>
                                <button
                                    onClick={() => setViewMode('EXAMS')}
                                    className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border border-slate-800 flex items-center justify-center group"
                                >
                                    <ClipboardList className="w-4 h-4 mr-2 text-indigo-500 group-hover:scale-110 transition-transform" /> Gestionar Exámenes
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8">
                    {!selectedModuleId ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] text-center">
                            <GraduationCap className="w-16 h-16 text-slate-800 mb-6" />
                            <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Selecciona un Módulo</h3>
                            <p className="text-slate-600 text-sm mt-2 max-w-sm">Para gestionar asistencia o calificaciones, primero elige cuál de tus módulos asignados deseas trabajar.</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden animate-in slide-in-from-right-4 duration-500">
                            <div className="p-8 border-b border-slate-800 bg-white/[0.02]">
                                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center">
                                    <Users className="w-5 h-5 mr-3 text-indigo-500" />
                                    Lista de Estudiantes
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-800/50">
                                {Array.isArray(students) && students.map((student: any) => (
                                    <div key={student.id} className="p-6 flex items-center justify-between group hover:bg-slate-800/20 transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-800">
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{student.last_name}, {student.first_name}</p>
                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-[8px] font-mono text-slate-600">
                                            {student.matricula}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
