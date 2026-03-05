import { useState } from 'react';
import { usePrograms, useDeleteProgram } from '../../hooks/useAcademic.ts';
import { GraduationCap, Layers, Edit2, Trash2, Plus, Users } from 'lucide-react';
import { ProgramModal } from './ProgramModal.tsx';
import { ModuleManager } from './ModuleManager.tsx';
import { toast } from 'react-hot-toast';
import type { AcademicProgram } from '../../types';

interface ProgramListProps {
    onSelectProgram: (program: AcademicProgram) => void;
}

export function ProgramList({ onSelectProgram }: ProgramListProps) {
    const { data: programs, isLoading } = usePrograms();
    const deleteProgram = useDeleteProgram();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
    const [viewMode, setViewMode] = useState<{ mode: 'list' | 'modules', program?: AcademicProgram }>({ mode: 'list' });

    const handleEdit = (program: AcademicProgram) => {
        setSelectedProgram(program);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedProgram(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este programa?')) {
            try {
                await deleteProgram.mutateAsync(id);
                toast.success('Programa eliminado');
            } catch (err) {
                toast.error('Error al eliminar programa');
            }
        }
    };

    if (viewMode.mode === 'modules' && viewMode.program) {
        return (
            <ModuleManager
                programId={viewMode.program.id}
                onBack={() => setViewMode({ mode: 'list' })}
            />
        );
    }

    if (isLoading) return <div className="p-12 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando programas...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                    <GraduationCap className="w-3 h-3 mr-2 text-blue-500" />
                    Catálogo de Programas
                </h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-3 h-3 mr-2" />
                    Nuevo Programa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(programs) && programs.map((program) => (
                    <div key={program.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 hover:border-blue-500/30 transition-all group flex flex-col h-full relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br transition-opacity duration-500 opacity-5 ${program.is_active ? 'from-emerald-500 to-transparent' : 'from-rose-500 to-transparent'}`} />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
                                    {program.code}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${program.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {program.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-white font-bold text-xl mb-3 tracking-tight leading-tight relative z-10">{program.name}</h3>
                        <p className="text-slate-500 text-xs mb-8 line-clamp-2 leading-relaxed relative z-10">
                            {program.description || 'Sin descripción detallada disponible para este programa académico.'}
                        </p>

                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => setViewMode({ mode: 'modules', program })}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-950/50 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all group/btn"
                            >
                                <Layers className="w-3.5 h-3.5 text-slate-600 group-hover/btn:text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover/btn:text-indigo-400">Ver Módulos</span>
                            </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800 relative z-10">
                            <button
                                onClick={() => onSelectProgram(program)}
                                className="flex items-center text-[10px] font-bold text-slate-400 hover:text-blue-400 uppercase tracking-wider transition-colors"
                            >
                                <Users className="w-3.5 h-3.5 mr-2 text-slate-600" />
                                <span>Adm. Cohortes</span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleEdit(program)}
                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(program.id)}
                                    className="p-2.5 bg-rose-600/10 hover:bg-rose-600/20 rounded-xl text-rose-500 border border-rose-500/10 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {programs?.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                        <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 text-sm font-medium">No hay programas registrados en el catálogo.</p>
                    </div>
                )}
            </div>

            <ProgramModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                program={selectedProgram}
            />
        </div>
    );
}
