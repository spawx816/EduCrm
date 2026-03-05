import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateBillingItem } from '../../hooks/useBilling.ts';

export function CreateBillingItemModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const createItem = useCreateBillingItem();
    const [name, setName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isInventory, setIsInventory] = useState(false);
    const [stockQuantity, setStockQuantity] = useState('');
    const [minStock, setMinStock] = useState('5');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createItem.mutateAsync({
                name,
                price: parseFloat(itemPrice),
                description,
                is_inventory: isInventory,
                stock_quantity: isInventory ? parseInt(stockQuantity) : 0,
                min_stock: isInventory ? parseInt(minStock) : 5
            });
            setName('');
            setItemPrice('');
            setDescription('');
            setIsInventory(false);
            setStockQuantity('');
            setMinStock('5');
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white tracking-tight">Nuevo Concepto de Cobro</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre del Concepto</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Libro de Inglés A1"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Precio Base</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">RD$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={itemPrice}
                                    onChange={(e) => setItemPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all">
                                <input
                                    type="checkbox"
                                    checked={isInventory}
                                    onChange={(e) => setIsInventory(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-900"
                                />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Inventariable</span>
                            </label>
                        </div>
                    </div>

                    {isInventory && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stock Inicial</label>
                                <input
                                    type="number"
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    required={isInventory}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stock Mínimo</label>
                                <input
                                    type="number"
                                    value={minStock}
                                    onChange={(e) => setMinStock(e.target.value)}
                                    placeholder="5"
                                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
                                    required={isInventory}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve detalle del cobro..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all h-20 resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name || !itemPrice || (isInventory && !stockQuantity) || createItem.isPending}
                            className="flex-3 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {createItem.isPending ? 'Guardando...' : 'Guardar Concepto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
