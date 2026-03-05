import { useState } from 'react';
import { useModules, useCreateModule, useDeleteModule } from '../../hooks/useAcademic.ts';
import { Plus, BookOpen, Layers, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModuleManagerProps {
    programId: string;
    onBack: () => void;
}

export function ModuleManager({ programId, onBack }: ModuleManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const { data: modules, isLoading } = useModules(programId);
    const createMutation = useCreateModule();
    const deleteMutation = useDeleteModule();

    const handleCreate = async () => {
        if (!name) return;
        try {
            await createMutation.mutateAsync({
                program_id: programId,
                name,
                description,
                order_index: (modules?.length || 0) + 1
            });
            setName('');
            setDescription('');
            setIsAdding(false);
            toast.success('Módulo creado correctamente');
        } catch (error) {
            toast.error('Error al crear el módulo');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este módulo?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Módulo eliminado');
            } catch (error) {
                toast.error('Error al eliminar el módulo');
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-blue-500 animate-pulse font-black uppercase tracking-widest">Cargando módulos...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Volver a Programas</span>
                </button>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center">
                    <Layers className="w-6 h-6 mr-2 text-indigo-500" />
                    Gestión de Módulos
                </h2>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="font-black text-white uppercase tracking-wider text-sm flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                            Módulos del Programa ({modules?.length || 0})
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">Define la malla curricular y sus bloques independientes.</p>
                    </div>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center shadow-lg shadow-indigo-600/20"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Agregar Módulo
                        </button>
                    )}
                </div>

                {isAdding && (
                    <div className="bg-slate-950 border border-indigo-500/30 p-8 rounded-3xl mb-8 space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nombre del Módulo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Ej: Módulo 1: Fundamentos"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Descripción Breve</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Opcional..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                            <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase hover:text-white transition-colors">Cancelar</button>
                            <button
                                onClick={handleCreate}
                                disabled={createMutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" /> Guardar Módulo
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {Array.isArray(modules) && modules.map((m: any, index: number) => (
                        <div key={m.id} className="bg-slate-950/50 border border-slate-800/50 p-6 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center space-x-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-indigo-500 border border-slate-800 group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm tracking-tight">{m.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{m.description || 'Sin descripción'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleDelete(m.id)}
                                    className="p-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-xl border border-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[8px] font-black uppercase text-slate-500 tracking-widest">ID: {m.id.split('-')[0]}</div>
                            </div>
                        </div>
                    ))}

                    {modules?.length === 0 && (
                        <div className="p-16 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-3xl">
                            <Layers className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No hay módulos configurados para este programa</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
