import { useState } from 'react';
import { useScholarships, useCreateScholarship, useDeleteScholarship } from '../../hooks/useBilling.ts';
import { Ticket, Plus, Trash2, Percent, DollarSign, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../shared/ConfirmModal.tsx';

export function ScholarshipSettings() {
    const { data: scholarships, isLoading } = useScholarships();
    const createScholarship = useCreateScholarship();
    const deleteScholarship = useDeleteScholarship();

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        value: 0,
        applies_to_enrollment: true,
        applies_to_monthly: true
    });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        action: () => { }
    });

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Beca',
            message: `¿Estás seguro de que deseas eliminar la beca "${name}"?`,
            action: async () => {
                try {
                    await deleteScholarship.mutateAsync(id);
                    toast.success('Beca eliminada correctamente');
                } catch (error) {
                    toast.error('Error al eliminar la beca. Es posible que esté siendo utilizada.');
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createScholarship.mutateAsync(formData);
            toast.success('Beca creada correctamente');
            setIsAdding(false);
            setFormData({
                name: '',
                description: '',
                type: 'PERCENTAGE',
                value: 0,
                applies_to_enrollment: true,
                applies_to_monthly: true
            });
        } catch (error) {
            toast.error('Error al crear la beca');
        }
    };

    if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Cargando becas...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Ticket className="w-5 h-5 mr-3 text-blue-400" />
                        Catálogo de Becas y Descuentos
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">Configuración Global de Beneficios</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Beca</span>
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-blue-500/20 rounded-[2rem] p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Nombre de la Beca</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="Ej: Beca Excelencia"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all h-24 resize-none"
                                    placeholder="Detalles sobre quién califica..."
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tipo de Descuento</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'PERCENTAGE' })}
                                        className={`flex items-center justify-center p-4 rounded-xl border transition-all ${formData.type === 'PERCENTAGE' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        <Percent className="w-4 h-4 mr-2" />
                                        <span className="text-xs font-bold uppercase">Porcentaje</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'FIXED' })}
                                        className={`flex items-center justify-center p-4 rounded-xl border transition-all ${formData.type === 'FIXED' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        <span className="text-xs font-bold uppercase">Monto Fijo</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Valor</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">
                                            {formData.type === 'PERCENTAGE' ? '%' : 'USD'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 pt-6">
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.applies_to_enrollment}
                                            onChange={e => setFormData({ ...formData, applies_to_enrollment: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/50"
                                        />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Inscripción</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.applies_to_monthly}
                                            onChange={e => setFormData({ ...formData, applies_to_monthly: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500/50"
                                        />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Mensualidad</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-3 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createScholarship.isPending}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2"
                        >
                            {createScholarship.isPending ? 'Creando...' : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Guardar Beca</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(scholarships) && scholarships.map((s: any) => (
                    <div key={s.id} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Ticket className="w-20 h-20 -rotate-12" />
                        </div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex space-x-2">
                                <div className={`p-2 rounded-lg ${s.type === 'PERCENTAGE' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {s.type === 'PERCENTAGE' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest ${s.applies_to_enrollment ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>
                                        Inscripción
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest ${s.applies_to_monthly ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>
                                        Mensualidad
                                    </span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${s.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500'}`}>
                                {s.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <h4 className="text-white font-bold mb-1">{s.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6 line-clamp-2">{s.description || 'Sin descripción adicional'}</p>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">Valor del beneficio</p>
                                <p className="text-2xl font-black text-white">
                                    {s.type === 'PERCENTAGE' ? `${s.value}%` : `$${parseFloat(s.value).toLocaleString()}`}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(s.id, s.name)}
                                className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={() => {
                    confirmModal.action();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                isDanger={true}
            />
        </div>
    );
}
