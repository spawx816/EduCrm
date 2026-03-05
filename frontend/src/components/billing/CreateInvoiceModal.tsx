import { useState, useEffect } from 'react';
import { useStudents } from '../../hooks/useStudents.ts';
import { useBillingItems, useCreateInvoice, useInvoiceSuggestions } from '../../hooks/useBilling.ts';
import { X, Plus, Trash2, Check, Sparkles, AlertTriangle, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function CreateInvoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data: items } = useBillingItems();
    const { data: students } = useStudents();
    const createInvoice = useCreateInvoice();

    const [studentId, setStudentId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ itemId: string; description: string; quantity: number; unitPrice: number; discount?: number }[]>([]);
    const [notes, setNotes] = useState('');

    const { data: suggestions } = useInvoiceSuggestions(studentId);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setStudentId('');
            setDueDate('');
            setSelectedItems([]);
            setNotes('');
        }
    }, [isOpen]);

    // Auto-fill due date when suggestions change
    useEffect(() => {
        if (suggestions?.suggestedDueDate && !dueDate) {
            setDueDate(suggestions.suggestedDueDate);
        }
    }, [suggestions]);

    const handleAddItem = (item: any) => {
        const exists = selectedItems.find(i => i.itemId === item.id);
        if (exists) {
            setSelectedItems(selectedItems.map(i =>
                i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ));
            return;
        }

        setSelectedItems([...selectedItems, {
            itemId: item.id,
            description: item.name,
            quantity: 1,
            unitPrice: parseFloat(item.price)
        }]);
    };

    const handleApplySuggestion = () => {
        if (!suggestions) return;

        const newItems = [...selectedItems];
        let addedCount = 0;

        // Add enrollment fee if suggested and not already present
        if (suggestions.enrollmentFee) {
            const enrollmentId = 'ENROLL-' + studentId;
            if (!newItems.find(i => i.itemId === enrollmentId)) {
                newItems.push({
                    itemId: enrollmentId,
                    description: suggestions.enrollmentFee.name,
                    quantity: 1,
                    unitPrice: parseFloat(suggestions.enrollmentFee.price),
                    discount: parseFloat(suggestions.enrollmentFee.discount) || 0
                });
                addedCount++;
            }
        }

        // Add module if suggested and not already present
        if (suggestions.suggestedModule) {
            const moduleId = 'MOD-' + suggestions.suggestedModule.id;
            if (!newItems.find(i => i.itemId === moduleId)) {
                newItems.push({
                    itemId: moduleId,
                    description: suggestions.suggestedModule.name,
                    quantity: 1,
                    unitPrice: parseFloat(suggestions.suggestedModule.price),
                    discount: parseFloat(suggestions.suggestedModule.discount) || 0
                });
                addedCount++;
            }
        }

        // Add addons (if any)
        if (suggestions.addons) {
            suggestions.addons.forEach((addon: any) => {
                if (!newItems.find(i => i.itemId === addon.id)) {
                    newItems.push({
                        itemId: addon.id,
                        description: addon.name,
                        quantity: 1,
                        unitPrice: parseFloat(addon.price)
                    });
                    addedCount++;
                }
            });
        }

        if (addedCount > 0) {
            setSelectedItems(newItems);
            toast.success(`${addedCount} conceptos agregados`);
        } else {
            toast.error('Todos los conceptos sugeridos ya están en la lista');
        }
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            toast.error('Agrega al menos un ítem');
            return;
        }

        try {
            await createInvoice.mutateAsync({
                studentId,
                items: selectedItems,
                dueDate,
                notes,
                scholarshipId: suggestions?.scholarship?.id,
                discountAmount: totalDiscount
            });
            toast.success('Factura creada correctamente');
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al crear factura';
            toast.error(msg);
        }
    };

    if (!isOpen) return null;

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = selectedItems.reduce((sum, item: any) => sum + (item.discount || 0), 0);
    const total = subtotal - totalDiscount;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Crear Factura</h2>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Sitema de Cobros Inteligente</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Estudiante</label>
                            <select
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                required
                            >
                                <option value="">Seleccionar Estudiante...</option>
                                {Array.isArray(students) && students.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fecha de Vencimiento</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Smart Suggestions Section */}
                    {studentId && suggestions && (
                        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2 text-indigo-400">
                                    <Sparkles className="w-4 h-4 fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sugerencias Inteligentes</span>
                                </div>
                                {(!suggestions.error || suggestions.enrollmentFee) && (
                                    <button
                                        type="button"
                                        onClick={handleApplySuggestion}
                                        className="text-[10px] font-black text-indigo-500 hover:text-white px-3 py-1 bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition-all border border-indigo-500/20"
                                    >
                                        Aplicar Todo
                                    </button>
                                )}
                            </div>

                            {suggestions.error && !suggestions.enrollmentFee && (
                                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3">
                                    <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-rose-200">Acción Requerida</p>
                                        <p className="text-[10px] text-rose-400/80 leading-relaxed mt-0.5">{suggestions.error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {suggestions.isEnrollmentPaid && (
                                    <div className="px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center space-x-2">
                                        <Check className="w-3 h-3" />
                                        <span className="font-bold">Inscripción Pagada</span>
                                    </div>
                                )}
                                {suggestions.enrollmentFee && (
                                    <div className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center space-x-2 transition-all ${selectedItems.some(i => i.itemId === 'ENROLL-' + studentId)
                                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 opacity-60'
                                        : 'bg-indigo-600/10 border-indigo-500/30 text-white'
                                        }`}>
                                        <Ticket className="w-3 h-3 text-indigo-400" />
                                        <span>{suggestions.enrollmentFee.name}: </span>
                                        <span className="font-bold text-indigo-300">RD${parseFloat(suggestions.enrollmentFee.price).toLocaleString()}</span>
                                        {suggestions.enrollmentFee.discount > 0 && (
                                            <span className="text-[10px] text-emerald-400 font-black ml-1">(-${parseFloat(suggestions.enrollmentFee.discount).toLocaleString()})</span>
                                        )}
                                    </div>
                                )}
                                {suggestions.suggestedModule && (
                                    <div className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center space-x-2 transition-all ${selectedItems.some(i => i.itemId === 'MOD-' + suggestions.suggestedModule.id)
                                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-100 opacity-60'
                                        : 'bg-slate-950 border-slate-800 text-white'
                                        }`}>
                                        <Check className="w-3 h-3 text-emerald-500" />
                                        <span>{suggestions.suggestedModule.name}: </span>
                                        <span className="font-bold text-emerald-400">RD${parseFloat(suggestions.suggestedModule.price).toLocaleString()}</span>
                                        {suggestions.suggestedModule.discount > 0 && (
                                            <span className="text-[10px] text-emerald-400 font-black ml-1">(-${parseFloat(suggestions.suggestedModule.discount).toLocaleString()})</span>
                                        )}
                                    </div>
                                )}
                                {suggestions.isModuleInvoiced && !suggestions.suggestedModule && (
                                    <div className="px-3 py-1.5 bg-rose-500/10 rounded-xl border border-rose-500/30 text-[11px] text-rose-300 flex items-center space-x-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Módulo Actual Ya Facturado</span>
                                    </div>
                                )}
                                {suggestions.addons?.map((addon: any) => (
                                    <div key={addon.id} className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center space-x-2 transition-all ${selectedItems.some(i => i.itemId === addon.id)
                                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-100 opacity-60'
                                        : 'bg-slate-950 border-slate-800 text-white'
                                        } ${addon.is_inventory && addon.stock_quantity <= 0 ? 'opacity-40 grayscale' : ''}`}>
                                        <Plus className="w-3 h-3 text-indigo-500" />
                                        <span>{addon.name}: </span>
                                        <span className="font-bold text-indigo-400">RD${parseFloat(addon.price).toLocaleString()}</span>
                                        {addon.is_inventory && (
                                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${addon.stock_quantity <= addon.min_stock ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                Stock: {addon.stock_quantity}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Catálogo de Conceptos</h3>
                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {Array.isArray(items) && items.map((item: any) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleAddItem(item)}
                                        className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group relative overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <p className="font-bold text-white text-sm">{item.name}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <p className="text-[10px] text-slate-500">{item.description || 'Sin descripción'}</p>
                                                {item.is_inventory && (
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${item.stock_quantity <= item.min_stock
                                                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                                        : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                                        }`}>
                                                        Stock: {item.stock_quantity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <p className="font-black text-blue-400 text-sm">RD${parseFloat(item.price).toLocaleString()}</p>
                                            <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-500 ml-auto mt-1" />
                                        </div>
                                        {item.is_inventory && item.stock_quantity <= 0 && (
                                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1 border border-rose-500/20 rounded-full rotate-[-5deg]">Agotado</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Detalle de Factura</h3>
                            <div className="space-y-3 bg-slate-950/30 p-4 rounded-[2rem] border border-slate-800 border-dashed min-h-[300px]">
                                {selectedItems.length === 0 ? (
                                    <div className="h-[250px] flex flex-col items-center justify-center text-center opacity-30">
                                        <Plus className="w-12 h-12 mb-4 text-slate-600" />
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No hay ítems seleccionados</p>
                                    </div>
                                ) : (
                                    selectedItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex-1">
                                                <p className="font-bold text-white text-sm">{item.description}</p>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <p className="text-[10px] text-slate-400 font-bold">CANT: {item.quantity}</p>
                                                    <p className="text-[10px] text-blue-400 font-black">PU: ${item.unitPrice.toLocaleString()}</p>
                                                    {(item as any).discount > 0 && (
                                                        <p className="text-[10px] text-emerald-400 font-black">DESC: -${(item as any).discount.toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <p className="font-black text-white text-sm">RD${(item.quantity * item.unitPrice).toLocaleString()}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notas / Observaciones</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all h-24 resize-none"
                            placeholder="Información adicional sobre la factura..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex space-x-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                            <p className="text-lg font-bold text-slate-400 mt-1">RD${subtotal.toLocaleString()}</p>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Descuento ({suggestions?.scholarship?.name})</p>
                                <p className="text-lg font-bold text-emerald-400 mt-1">-${totalDiscount.toLocaleString()}</p>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto Total</p>
                            <p className="text-3xl font-black text-white tracking-tighter mt-1">RD${total.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-800 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={createInvoice.isPending}
                            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center space-x-2"
                        >
                            {createInvoice.isPending ? 'Procesando...' : 'Generar Factura'}
                            <Check className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
