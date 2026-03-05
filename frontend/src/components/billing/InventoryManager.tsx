import { useState } from 'react';
import { useBillingItems, useInventoryMovements, useAdjustStock } from '../../hooks/useBilling.ts';
import { Package, ArrowUpRight, ArrowDownRight, History, AlertTriangle, Plus, Minus, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function InventoryManager() {
    const { data: items, isLoading: isLoadingItems } = useBillingItems();
    const { data: movements, isLoading: isLoadingMovements } = useInventoryMovements();
    const adjustStock = useAdjustStock();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [adjustmentQty, setAdjustmentQty] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');
    const [adjustmentNotes, setAdjustmentNotes] = useState('');

    const inventoryItems = (Array.isArray(items) ? items : []).filter((i: any) => i.is_inventory &&
        (i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItemId || !adjustmentQty) return;

        try {
            await adjustStock.mutateAsync({
                itemId: selectedItemId,
                quantity: parseInt(adjustmentQty),
                type: adjustmentType,
                notes: adjustmentNotes
            });
            toast.success('Inventario actualizado');
            setSelectedItemId(null);
            setAdjustmentQty('');
            setAdjustmentNotes('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al ajustar stock');
        }
    };

    if (isLoadingItems || isLoadingMovements) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Artículos</span>
                    </div>
                    <p className="text-4xl font-black text-white">{inventoryItems.length}</p>
                    <p className="text-xs text-slate-500 mt-1 font-bold">Materiales Registrados</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock Bajo</span>
                    </div>
                    <p className="text-4xl font-black text-white">{inventoryItems.filter((i: any) => i.stock_quantity <= i.min_stock && i.stock_quantity > 0).length}</p>
                    <p className="text-xs text-slate-500 mt-1 font-bold">Requieren Reposición</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center">
                            <Minus className="w-6 h-6 text-rose-500" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agotados</span>
                    </div>
                    <p className="text-4xl font-black text-white">{inventoryItems.filter((i: any) => i.stock_quantity <= 0).length}</p>
                    <p className="text-xs text-slate-500 mt-1 font-bold">Sin Existencias</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Inventory List */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-3">
                            <Package className="w-6 h-6 text-blue-500" />
                            <span>Control de Existencias</span>
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar material..."
                                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500/50 outline-none w-64 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inventoryItems.map((item: any) => (
                            <div
                                key={item.id}
                                className={`p-6 bg-slate-900 border transition-all rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/5 group cursor-pointer ${selectedItemId === item.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-800'
                                    }`}
                                onClick={() => {
                                    setSelectedItemId(item.id);
                                    setAdjustmentType('IN');
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-black text-white text-lg tracking-tight mb-1 group-hover:text-blue-400 transition-colors uppercase">{item.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.description || 'Sin descripción'}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-center min-w-[80px] ${item.stock_quantity <= 0 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                        item.stock_quantity <= item.min_stock ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        }`}>
                                        <p className="text-2xl font-black leading-none">{item.stock_quantity}</p>
                                        <p className="text-[8px] font-black uppercase mt-1">Stock</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mínimo: {item.min_stock}</p>
                                    </div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ajustar Stock</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Adjustment Form & Movements History */}
                <div className="space-y-8">
                    {/* Adjustment Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -z-10"></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center space-x-2">
                            <Plus className="w-4 h-4 text-blue-500" />
                            <span>Ajuste de Inventario</span>
                        </h3>

                        {!selectedItemId ? (
                            <div className="h-48 flex flex-col items-center justify-center text-center opacity-40">
                                <Package className="w-12 h-12 mb-4 text-slate-600" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecciona un artículo para ajustar</p>
                            </div>
                        ) : (
                            <form onSubmit={handleAdjust} className="space-y-6">
                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 mb-6">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ajustando:</p>
                                    <p className="text-sm font-black text-blue-400 uppercase tracking-tight">
                                        {items?.find((i: any) => i.id === selectedItemId)?.name}
                                    </p>
                                </div>

                                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustmentType('IN')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adjustmentType === 'IN' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        Enrtada (+)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAdjustmentType('OUT')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adjustmentType === 'OUT' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        Salida (-)
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cantidad</label>
                                        <input
                                            type="number"
                                            value={adjustmentQty}
                                            onChange={(e) => setAdjustmentQty(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none border-blue-500/30"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Motivo/Notas</label>
                                        <textarea
                                            value={adjustmentNotes}
                                            onChange={(e) => setAdjustmentNotes(e.target.value)}
                                            placeholder="Ej: Reposición de libros..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none h-20 resize-none h-16"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={adjustStock.isPending}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center space-x-2"
                                >
                                    {adjustStock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirmar Ajuste</span>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedItemId(null)}
                                    className="w-full py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Historical Movements */}
                    <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <History className="w-5 h-5 text-slate-500" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial Reciente</h3>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {Array.isArray(movements) && movements.map((mov: any) => (
                                <div key={mov.id} className="flex space-x-4 p-3 hover:bg-slate-800/30 rounded-2xl transition-all border border-transparent hover:border-slate-800">
                                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${mov.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {mov.type === 'IN' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-white truncate">{mov.item_name}</p>
                                            <p className={`text-xs font-black ${mov.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{mov.notes || mov.reference_type}</p>
                                            <p className="text-[8px] text-slate-600 font-black">{new Date(mov.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
