import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useRegisterPayment } from '../../hooks/useBilling.ts';

export function RegisterPaymentModal({ isOpen, onClose, invoice }: { isOpen: boolean; onClose: () => void; invoice: any }) {
    const registerPayment = useRegisterPayment();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('TRANSFER');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen || !invoice) return null;

    const remaining = parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerPayment.mutateAsync({
                invoiceId: invoice.id,
                studentId: invoice.student_id,
                amount: parseFloat(amount),
                paymentMethod: method,
                reference,
                notes
            });
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Registrar Pago</h2>
                        <p className="text-xs text-slate-500 mt-1">Factura: {invoice.invoice_number}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                            <p className="text-2xl font-black text-white">RD$ {remaining.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-blue-600/10 rounded-xl">
                            <DollarSign className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Monto a Pagar</label>
                            <input
                                type="number"
                                step="0.01"
                                max={remaining}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Método</label>
                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                >
                                    <option value="TRANSFER">Transferencia</option>
                                    <option value="CASH">Efectivo</option>
                                    <option value="CARD">Tarjeta</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Referencia</label>
                                <input
                                    type="text"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="Nº de comprobante"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Notas</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all h-24 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!amount || registerPayment.isPending}
                            className="flex-3 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {registerPayment.isPending ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
