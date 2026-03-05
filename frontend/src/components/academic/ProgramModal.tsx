import { useState, useEffect } from 'react';
import { X, GraduationCap, FileText, Hash } from 'lucide-react';
import { useCreateProgram, useUpdateProgram } from '../../hooks/useAcademic.ts';
import { toast } from 'react-hot-toast';
import type { AcademicProgram } from '../../types';

interface ProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    program?: AcademicProgram | null;
}

export function ProgramModal({ isOpen, onClose, program }: ProgramModalProps) {
    const createProgram = useCreateProgram();
    const updateProgram = useUpdateProgram();

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (program) {
            setFormData({
                name: program.name,
                code: program.code,
                description: program.description || '',
                is_active: program.is_active
            });
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                is_active: true
            });
        }
    }, [program, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (program) {
                await updateProgram.mutateAsync({ id: program.id, ...formData });
                toast.success('Programa actualizado correctamente');
            } else {
                await createProgram.mutateAsync(formData);
                toast.success('Programa creado correctamente');
            }
            onClose();
        } catch (err) {
            toast.error('Error al guardar el programa');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-8">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {program ? 'Editar Programa' : 'Nuevo Programa'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Define los detalles del programa académico para tu oferta educativa.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Nombre del Programa</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Diplomado en Marketing Digital"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <GraduationCap className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Código / Sigla</label>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Ej: DMD-01"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <Hash className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Estado</label>
                            <select
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Descripción</label>
                        <div className="relative">
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Breve resumen del contenido del programa..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px] resize-none"
                            />
                            <FileText className="w-5 h-5 text-slate-600 absolute left-4 top-6" />
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
                            disabled={createProgram.isPending || updateProgram.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-bold shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {program ? 'Actualizar' : 'Crear Programa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
