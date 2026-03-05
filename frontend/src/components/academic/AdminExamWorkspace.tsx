import { useState } from 'react';
import { useCohortModules } from '../../hooks/useAcademic.ts';
import { ArrowLeft, BookOpen, ChevronRight, ClipboardList } from 'lucide-react';
import { ExamManager } from '../exams/ExamManager.tsx';

interface AdminExamWorkspaceProps {
    cohortId: string;
    programId: string;
    onBack: () => void;
}

export function AdminExamWorkspace({ cohortId, programId, onBack }: AdminExamWorkspaceProps) {
    const { data: modules, isLoading } = useCohortModules(cohortId);
    const [selectedModuleId, setSelectedModuleId] = useState<string>('');

    if (isLoading) return <div className="p-20 text-center text-indigo-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Preparando Workspace de Exámenes...</div>;

    if (selectedModuleId) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <button
                    onClick={() => setSelectedModuleId('')}
                    className="flex items-center text-slate-400 hover:text-white mb-4 uppercase text-[10px] font-black tracking-widest group transition-all"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver a Selección de Módulo
                </button>
                <ExamManager
                    cohortId={cohortId}
                    moduleId={selectedModuleId}
                    programId={programId}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onBack}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Supervisión de Exámenes</h2>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">Selecciona un módulo para gestionar evaluaciones</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(modules) && modules.map((m: any) => (
                    <div
                        key={m.module_id}
                        onClick={() => setSelectedModuleId(m.module_id)}
                        className="group bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:bg-slate-900/50 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5 -rotate-12 group-hover:scale-110 group-hover:text-blue-500/10 transition-all">
                            <ClipboardList className="w-full h-full" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Módulo</p>
                                <h3 className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">{m.module_name}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modules?.length === 0 && (
                <div className="py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
                    <ClipboardList className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No hay módulos asignados a esta cohorte</p>
                </div>
            )}
        </div>
    );
}
