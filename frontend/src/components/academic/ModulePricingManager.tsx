import { useState } from 'react';
import { useModules, useUpdateModule, useModuleAddons, useAddModuleAddon, useRemoveModuleAddon, useProgram, useUpdateProgram } from '../../hooks/useAcademic.ts';
import { useBillingItems } from '../../hooks/useBilling.ts';
import { DollarSign, Tag, Plus, Trash2, Save, ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ModulePricingManager({ programId }: { programId: string }) {
    const { data: program } = useProgram(programId);
    const { data: modules, isLoading: isLoadingModules } = useModules(programId);
    const { data: billingItems } = useBillingItems();
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    const updateModule = useUpdateModule();
    const updateProgram = useUpdateProgram();
    const { data: addons, isLoading: isLoadingAddons } = useModuleAddons(selectedModuleId || undefined);
    const addAddon = useAddModuleAddon();
    const removeAddon = useRemoveModuleAddon();

    const [prices, setPrices] = useState<Record<string, string>>({});
    const [enrollmentPrice, setEnrollmentPrice] = useState<string>('');
    const [billingDay, setBillingDay] = useState<string>('');

    if (isLoadingModules) return <div className="p-10 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Módulos...</div>;

    const handleSavePrice = async (moduleId: string) => {
        const price = prices[moduleId];
        if (!price) return;
        try {
            await updateModule.mutateAsync({ id: moduleId, price: parseFloat(price) });
            toast.success('Precio actualizado');
        } catch (err) {
            toast.error('Error al actualizar precio');
        }
    };

    const handleSaveEnrollmentPrice = async () => {
        if (!enrollmentPrice && !billingDay) return;
        try {
            await updateProgram.mutateAsync({
                id: programId,
                enrollment_price: enrollmentPrice ? parseFloat(enrollmentPrice) : undefined,
                billing_day: billingDay ? parseInt(billingDay) : undefined
            });
            toast.success('Configuración actualizada');
        } catch (err) {
            toast.error('Error al actualizar configuración');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Modules List */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Precios del Programa</h3>

                {/* Enrollment Price Card */}
                <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white tracking-tight">Costo de Inscripción</h4>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Matrícula inicial del programa</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Precio</label>
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                    <input
                                        type="number"
                                        defaultValue={program?.enrollment_price}
                                        onChange={(e) => setEnrollmentPrice(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 w-32 text-white font-black text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Día Cobro</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    defaultValue={program?.billing_day}
                                    onChange={(e) => setBillingDay(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 w-20 text-white font-black text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="5"
                                />
                            </div>
                            <button
                                onClick={handleSaveEnrollmentPrice}
                                disabled={updateProgram.isPending}
                                className="p-3 mt-5 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20"
                            >
                                <Save className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Precios de Módulos</h3>
                <div className="grid grid-cols-1 gap-4">
                    {Array.isArray(modules) && modules.map((module: any) => (
                        <div
                            key={module.id}
                            onClick={() => setSelectedModuleId(module.id)}
                            className={`p-6 bg-slate-900/50 border rounded-[2rem] transition-all cursor-pointer group ${selectedModuleId === module.id ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Módulo {module.order_index + 1}</p>
                                    <h4 className="text-lg font-black text-white tracking-tight">{module.name}</h4>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        <input
                                            type="number"
                                            defaultValue={module.price}
                                            onChange={(e) => setPrices({ ...prices, [module.id]: e.target.value })}
                                            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 w-32 text-white font-black text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSavePrice(module.id);
                                        }}
                                        disabled={updateModule.isPending}
                                        className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Addons Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 h-fit">
                <div className="flex items-center space-x-3 mb-8">
                    <ShoppingBag className="w-6 h-6 text-indigo-500" />
                    <h3 className="text-xl font-black text-white tracking-tighter">Artículos <span className="text-indigo-500 italic">Opcionales</span></h3>
                </div>

                {!selectedModuleId ? (
                    <div className="text-center py-20 opacity-30">
                        <Tag className="w-12 h-12 mx-auto mb-4 border-2 border-slate-800 p-3 rounded-2xl" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Selecciona un módulo para gestionar artículos</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="relative">
                            <Plus className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        addAddon.mutate({ moduleId: selectedModuleId, itemId: e.target.value });
                                        e.target.value = '';
                                    }
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-white text-xs font-bold outline-none appearance-none"
                            >
                                <option value="">Vincular artículo...</option>
                                {Array.isArray(billingItems) && billingItems.map((item: any) => (
                                    <option key={item.id} value={item.id}>{item.name} (${item.price})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Artículos Vinculados</p>
                            {isLoadingAddons ? (
                                <div className="p-4 animate-pulse bg-slate-800/20 rounded-2xl h-12"></div>
                            ) : (
                                addons?.map((addon: any) => (
                                    <div key={addon.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl group transition-all hover:bg-slate-950/80">
                                        <div>
                                            <p className="text-sm font-bold text-white">{addon.name}</p>
                                            <p className="text-[10px] text-emerald-500 font-black tracking-tighter">RD${addon.price}</p>
                                        </div>
                                        <button
                                            onClick={() => removeAddon.mutate({ moduleId: selectedModuleId, itemId: addon.id })}
                                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                            {addons?.length === 0 && !isLoadingAddons && (
                                <p className="text-center py-8 text-[10px] text-slate-700 font-bold uppercase italic tracking-widest">Sin artículos vinculados</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
