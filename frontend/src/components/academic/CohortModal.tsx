import { useState, useEffect } from 'react';
import { X, Layers, Calendar, Hash } from 'lucide-react';
import { useCreateCohort, useUpdateCohort, usePrograms } from '../../hooks/useAcademic.ts';
import { toast } from 'react-hot-toast';
import type { Cohort } from '../../types';

interface CohortModalProps {
    isOpen: boolean;
    onClose: () => void;
    cohort?: Cohort | null;
    defaultProgramId?: string;
}

export function CohortModal({ isOpen, onClose, cohort, defaultProgramId }: CohortModalProps) {
    const { data: programs } = usePrograms();
    const createCohort = useCreateCohort();
    const updateCohort = useUpdateCohort();

    const [formData, setFormData] = useState({
        program_id: '',
        name: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        if (cohort) {
            setFormData({
                program_id: cohort.program_id,
                name: cohort.name,
                start_date: cohort.start_date ? new Date(cohort.start_date).toISOString().split('T')[0] : '',
                end_date: cohort.end_date ? new Date(cohort.end_date).toISOString().split('T')[0] : '',
                is_active: cohort.is_active
            });
        } else {
            setFormData({
                program_id: defaultProgramId || '',
                name: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                is_active: true
            });
        }
    }, [cohort, isOpen, defaultProgramId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                end_date: formData.end_date || undefined
            };

            if (cohort) {
                await updateCohort.mutateAsync({ id: cohort.id, ...dataToSubmit });
                toast.success('Grupo actualizado correctamente');
            } else {
                await createCohort.mutateAsync(dataToSubmit);
                toast.success('Grupo creado correctamente');
            }
            onClose();
        } catch (err) {
            toast.error('Error al guardar el grupo');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-8">
                    <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                        <Layers className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {cohort ? 'Editar Grupo' : 'Nuevo Grupo / Cohorte'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Asigna una cohorte a un programa académico y define sus fechas.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Programa Académico</label>
                        <select
                            required
                            disabled={!!defaultProgramId && !cohort}
                            value={formData.program_id}
                            onChange={e => setFormData({ ...formData, program_id: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none disabled:opacity-50"
                        >
                            <option value="">Seleccionar programa...</option>
                            {Array.isArray(programs) && programs.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Nombre del Grupo</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Cohorte 2024 - A"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                            <Hash className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Fecha de Inicio</label>
                            <div className="relative">
                                <input
                                    required
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
                                />
                                <Calendar className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Fecha Fin (Opcional)</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
                                />
                                <Calendar className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl text-xs font-bold text-slate-400 hover:bg-slate-900 transition-all uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createCohort.isPending || updateCohort.isPending}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl text-xs font-bold shadow-xl shadow-emerald-600/20 transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {cohort ? 'Actualizar' : 'Crear Grupo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
