import { useState, useEffect } from 'react';
import { useStudents } from '../../hooks/useStudents.ts';
import { useBillingItems, useCreateInvoice, useInvoiceSuggestions } from '../../hooks/useBilling.ts';
import { X, Plus, Trash2, Check, Sparkles, AlertTriangle, Ticket, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function CreateInvoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data: items } = useBillingItems();
    const { data: students } = useStudents();
    const createInvoice = useCreateInvoice();

    const [studentId, setStudentId] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ itemId: string; description: string; quantity: number; unitPrice: number; discount?: number; moduleId?: string; enrollmentId?: string }[]>([]);
    const [notes, setNotes] = useState('');

    const { data: suggestions } = useInvoiceSuggestions(studentId);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setStudentId('');
            setStudentSearch('');
            setShowStudentDropdown(false);
            setDueDate('');
            setSelectedItems([]);
            setNotes('');
        }
    }, [isOpen]);

    const filteredStudents = Array.isArray(students)
        ? students.filter((s: any) =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(studentSearch.toLowerCase())
        )
        : [];

    const selectedStudent = Array.isArray(students)
        ? students.find((s: any) => s.id === studentId)
        : null;

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

    const handleToggleSuggestedItem = (type: 'ENROLL' | 'MOD' | 'ADDON', data: any, enrollSeg: any) => {
        const itemId = type === 'ENROLL' ? 'ENROLL-' + enrollSeg.enrollmentId :
            type === 'MOD' ? 'MOD-' + data.id :
                data.id;

        const exists = selectedItems.find(i => i.itemId === itemId && i.enrollmentId === enrollSeg.enrollmentId);

        if (exists) {
            setSelectedItems(selectedItems.filter(i => !(i.itemId === itemId && i.enrollmentId === enrollSeg.enrollmentId)));
        } else {
            const newItem: any = {
                itemId,
                description: type === 'ENROLL' ? data.name : `${data.name} (${enrollSeg.programName})`,
                quantity: 1,
                unitPrice: parseFloat(data.price),
                discount: parseFloat(data.discount) || 0,
                enrollmentId: enrollSeg.enrollmentId
            };
            if (type === 'MOD') newItem.moduleId = data.id;
            setSelectedItems([...selectedItems, newItem]);
        }
    };

    const handleApplySuggestion = () => {
        if (!suggestions?.enrollmentSuggestions) return;

        const newItems = [...selectedItems];
        let addedCount = 0;

        suggestions.enrollmentSuggestions.forEach((enrollSeg: any) => {
            // Add enrollment fee
            if (enrollSeg.enrollmentFee) {
                const enrollmentId = 'ENROLL-' + enrollSeg.enrollmentId;
                if (!newItems.find(i => i.itemId === enrollmentId)) {
                    newItems.push({
                        itemId: enrollmentId,
                        enrollmentId: enrollSeg.enrollmentId,
                        description: enrollSeg.enrollmentFee.name,
                        quantity: 1,
                        unitPrice: parseFloat(enrollSeg.enrollmentFee.price),
                        discount: parseFloat(enrollSeg.enrollmentFee.discount) || 0
                    });
                    addedCount++;
                }
            }

            // Add module
            if (enrollSeg.suggestedModule) {
                const moduleId = 'MOD-' + enrollSeg.suggestedModule.id;
                if (!newItems.find(i => i.itemId === moduleId && i.enrollmentId === enrollSeg.enrollmentId)) {
                    newItems.push({
                        itemId: moduleId,
                        moduleId: enrollSeg.suggestedModule.id,
                        enrollmentId: enrollSeg.enrollmentId,
                        description: `${enrollSeg.suggestedModule.name} (${enrollSeg.programName})`,
                        quantity: 1,
                        unitPrice: parseFloat(enrollSeg.suggestedModule.price),
                        discount: parseFloat(enrollSeg.suggestedModule.discount) || 0
                    });
                    addedCount++;
                }
            }

            // Add addons
            if (enrollSeg.addons) {
                enrollSeg.addons.forEach((addon: any) => {
                    if (!newItems.find(i => i.itemId === addon.id)) {
                        newItems.push({
                            itemId: addon.id,
                            description: `${addon.name} (${enrollSeg.programName})`,
                            quantity: 1,
                            unitPrice: parseFloat(addon.price)
                        });
                        addedCount++;
                    }
                });
            }
        });

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
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Estudiante</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Buscar estudiante...'}
                                    value={studentSearch}
                                    onChange={(e) => {
                                        setStudentSearch(e.target.value);
                                        setStudentId('');
                                        setShowStudentDropdown(true);
                                    }}
                                    onFocus={() => setShowStudentDropdown(true)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-500"
                                    required={!studentId}
                                />
                                {studentId && !studentSearch && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                        Seleccionado
                                    </span>
                                )}
                            </div>
                            {showStudentDropdown && studentSearch.length > 0 && (
                                <div className="absolute z-50 top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar">
                                    {filteredStudents.length === 0 ? (
                                        <p className="px-4 py-3 text-xs text-slate-500 italic">No se encontraron estudiantes.</p>
                                    ) : (
                                        filteredStudents.map((s: any) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setStudentId(s.id);
                                                    setStudentSearch('');
                                                    setShowStudentDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition-colors text-sm text-white flex items-center justify-between group"
                                            >
                                                <span className="font-medium">{s.first_name} {s.last_name}</span>
                                                <span className="text-[9px] font-black text-slate-500 group-hover:text-blue-400 uppercase tracking-widest">{s.matricula}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                            {showStudentDropdown && studentSearch.length > 0 && (
                                <div className="fixed inset-0 z-40" onClick={() => setShowStudentDropdown(false)} />
                            )}
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
                    {studentId && suggestions?.enrollmentSuggestions?.length > 0 && (
                        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2 text-indigo-400">
                                    <Sparkles className="w-4 h-4 fill-current" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sugerencias por Programa Académico</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleApplySuggestion}
                                    className="text-[10px] font-black text-indigo-500 hover:text-white px-3 py-1 bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition-all border border-indigo-500/20"
                                >
                                    Aplicar Todo
                                </button>
                            </div>

                            <div className="space-y-4">
                                {suggestions.enrollmentSuggestions.map((enrollSeg: any) => (
                                    <div key={enrollSeg.enrollmentId} className="space-y-2 border-l-2 border-indigo-500/20 pl-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{enrollSeg.programName}</p>

                                            {/* Extra: Manual Module Selection per Program */}
                                            {enrollSeg.allModules?.length > 0 && (
                                                <select
                                                    className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[8px] font-black uppercase text-indigo-400 outline-none"
                                                    onChange={(e) => {
                                                        const modId = e.target.value;
                                                        if (!modId) return;
                                                        const m = enrollSeg.allModules.find((xm: any) => xm.id === modId);
                                                        if (m) handleToggleSuggestedItem('MOD', m, enrollSeg);
                                                        e.target.value = '';
                                                    }}
                                                >
                                                    <option value="">+ Seleccionar Módulo...</option>
                                                    {enrollSeg.allModules.map((m: any) => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {enrollSeg.error && !enrollSeg.enrollmentFee && (
                                            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-2">
                                                <AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5" />
                                                <p className="text-[9px] text-rose-400 font-bold">{enrollSeg.error}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {enrollSeg.isEnrollmentPaid && (
                                                <div className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[9px] text-emerald-400 flex items-center space-x-1">
                                                    <Check className="w-2 h-2" />
                                                    <span className="font-bold uppercase tracking-tighter">Inscripción Pago</span>
                                                </div>
                                            )}
                                            {enrollSeg.enrollmentFee && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleSuggestedItem('ENROLL', enrollSeg.enrollmentFee, enrollSeg)}
                                                    className={`px-2 py-1 rounded-lg border text-[9px] flex items-center space-x-1 transition-all ${selectedItems.some(i => i.itemId === 'ENROLL-' + enrollSeg.enrollmentId)
                                                        ? 'bg-indigo-600 text-white border-indigo-500'
                                                        : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20'
                                                        }`}>
                                                    <Ticket className="w-2 h-2" />
                                                    <span className="font-bold">Inscripción: RD${parseFloat(enrollSeg.enrollmentFee.price).toLocaleString()}</span>
                                                </button>
                                            )}
                                            {enrollSeg.uninvoicedModules?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {enrollSeg.uninvoicedModules.map((mod: any) => (
                                                        <button
                                                            key={mod.id}
                                                            type="button"
                                                            onClick={() => handleToggleSuggestedItem('MOD', mod, enrollSeg)}
                                                            className={`px-3 py-1.5 rounded-xl border text-[10px] flex items-center space-x-2 transition-all shadow-sm ${selectedItems.some(i => i.itemId === 'MOD-' + mod.id && i.enrollmentId === enrollSeg.enrollmentId)
                                                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                                                                : 'bg-slate-950 border-slate-800 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                                                                }`}>
                                                            <Check className="w-3 h-3" />
                                                            <span className="font-bold uppercase tracking-tight">{mod.name}</span>
                                                            <span className="opacity-60 font-black">RD${parseFloat(mod.price).toLocaleString()}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {enrollSeg.addons?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <p className="w-full text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Complementos sugeridos:</p>
                                                    {enrollSeg.addons.map((addon: any) => (
                                                        <button
                                                            key={addon.id}
                                                            type="button"
                                                            onClick={() => handleToggleSuggestedItem('ADDON', addon, enrollSeg)}
                                                            className={`px-3 py-1.5 rounded-xl border text-[10px] flex items-center space-x-2 transition-all ${selectedItems.some(i => i.itemId === addon.id)
                                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
                                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/50'
                                                                }`}>
                                                            <Plus className="w-3 h-3" />
                                                            <span className="font-bold uppercase">{addon.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
