import { useState } from 'react';
import { useExpenseCategories, useExpenses, useCreateExpense, useDeleteExpense } from '../../hooks/useBilling.ts';
import { useAuth } from '../../hooks/useAuth.tsx';
import {
    Wallet, Plus, Trash2, Calendar, CreditCard,
    Loader2, ArrowDownCircle, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ExpenseManager() {
    const { user } = useAuth();
    const { data: categories, isLoading: isLoadingCats } = useExpenseCategories();
    const [filters, setFilters] = useState({ categoryId: '', startDate: '', endDate: '' });
    const { data: expenses, isLoading: isLoadingExpenses } = useExpenses(filters);

    const createExpense = useCreateExpense();
    const deleteExpense = useDeleteExpense();

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'Efectivo',
        referenceNumber: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExpense.mutateAsync({
                ...formData,
                amount: parseFloat(formData.amount),
                userId: user?.id
            });
            toast.success('Gasto registrado exitosamente');
            setIsAdding(false);
            setFormData({
                categoryId: '',
                amount: '',
                expenseDate: new Date().toISOString().split('T')[0],
                description: '',
                paymentMethod: 'Efectivo',
                referenceNumber: ''
            });
        } catch (err: any) {
            toast.error('Error al registrar gasto');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro de gasto?')) return;
        try {
            await deleteExpense.mutateAsync(id);
            toast.success('Gasto eliminado');
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const totalSpent = (Array.isArray(expenses) ? expenses : []).reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0) || 0;

    if (isLoadingCats || isLoadingExpenses) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-rose-600/20 to-slate-900 border border-rose-500/20 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowDownCircle className="w-20 h-20 text-rose-500" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full mb-4 inline-block border border-rose-500/20">Egresos Totales</span>
                        <p className="text-4xl font-black text-white mt-2">RD${totalSpent.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-2 font-bold tracking-tight">Periodo Seleccionado</p>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Operación</span>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-rose-600 hover:bg-rose-500 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20 transition-all flex items-center justify-center space-x-3 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Registrar Nuevo Gasto</span>
                    </button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Filtrar Historial</span>
                    <div className="flex space-x-2">
                        <select
                            value={filters.categoryId}
                            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs font-bold outline-none flex-1 focus:ring-1 focus:ring-rose-500/50 transition-all"
                        >
                            <option value="">Todas las Categorías</option>
                            {Array.isArray(categories) && categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-3">
                        <Wallet className="w-6 h-6 text-rose-500" />
                        <span>Libro de Gastos</span>
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="bg-transparent text-[10px] font-bold text-slate-400 px-3 py-1 outline-none appearance-none"
                            />
                            <span className="text-slate-700 mx-1">/</span>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="bg-transparent text-[10px] font-bold text-slate-400 px-3 py-1 outline-none appearance-none"
                            />
                        </div>
                        {(filters.categoryId || filters.startDate || filters.endDate) && (
                            <button
                                onClick={() => setFilters({ categoryId: '', startDate: '', endDate: '' })}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/40">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría / Concepto</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Método</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Referencia</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Monto</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {Array.isArray(expenses) && expenses.map((expense: any) => (
                                <tr key={expense.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                            <span className="text-sm font-bold text-slate-300">
                                                {new Date(expense.expense_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight">{expense.category_name}</p>
                                            <p className="text-xs text-slate-500 font-medium truncate max-w-md">{expense.description}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="w-3 h-3 text-slate-600" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {expense.payment_method}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                            {expense.reference_number || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="text-base font-black text-rose-400">
                                            -${parseFloat(expense.amount).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {expenses?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Wallet className="w-16 h-16 mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest font-mono">No hay gastos registrados en este periodo</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 blur-3xl -z-10"></div>

                        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Registrar Egreso</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Control de Salida de Capital</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Categoría del Gasto</label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
                                    >
                                        <option value="">Seleccionar Categoría</option>
                                        {Array.isArray(categories) && categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Monto del Pago</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 font-black text-lg">RD$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-10 pr-5 py-4 text-lg font-black outline-none focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Fecha del Movimiento</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expenseDate}
                                        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Método de Pago</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
                                    >
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Número de Referencia (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.referenceNumber}
                                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                    placeholder="Ej: Factura #1234 o Comprobante"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Descripción del Concepto</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles adicionales del gasto..."
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500/50 transition-all h-24 resize-none"
                                />
                            </div>

                            <div className="pt-4 flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 hover:bg-slate-800 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createExpense.isPending}
                                    className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-900/30 transition-all flex items-center justify-center space-x-2"
                                >
                                    {createExpense.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirmar Registro de Gasto</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
