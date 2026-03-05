import { X, Receipt, DollarSign, Calendar, Clock, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/api-client.ts';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any;
}

export function InvoiceDetailsModal({ isOpen, onClose, invoice }: InvoiceDetailsModalProps) {
    const { data: payments, isLoading: isLoadingPayments } = useQuery({
        queryKey: ['payments', invoice?.id],
        queryFn: async () => {
            const res = await apiClient.get('/billing/payments', {
                params: { invoiceId: invoice.id }
            });
            return res.data;
        },
        enabled: !!invoice?.id
    });

    const { data: items, isLoading: isLoadingItems } = useQuery({
        queryKey: ['invoiceItems', invoice?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/billing/invoices/${invoice.id}/items`);
            return res.data;
        },
        enabled: !!invoice?.id
    });

    if (!isOpen || !invoice) return null;

    const remaining = parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Receipt className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Detalles de Factura</h2>
                            <p className="text-xs text-slate-500">Nº {invoice.invoice_number} • {new Date(invoice.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Facturado</span>
                            <p className="text-xl font-bold text-white mt-1">RD$ {parseFloat(invoice.total_amount).toLocaleString()}</p>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Total Pagado</span>
                            <p className="text-xl font-bold text-emerald-400 mt-1">RD$ {parseFloat(invoice.paid_amount).toLocaleString()}</p>
                        </div>
                        <div className={`p-4 rounded-xl border ${remaining > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${remaining > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {remaining > 0 ? 'Saldo Restante' : 'Factura Liquidada'}
                            </span>
                            <p className={`text-xl font-bold mt-1 ${remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>RD$ {remaining.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Receipt className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conceptos Facturados</h3>
                        </div>

                        {isLoadingItems ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : items?.length > 0 ? (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Descripción</th>
                                            <th className="px-4 py-3 text-center">Cant.</th>
                                            <th className="px-4 py-3 text-right">Unitario</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {items.map((item: any, idx: number) => (
                                            <tr key={idx} className="text-slate-300">
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-bold text-white">{item.description}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-xs">RD$ {parseFloat(item.unit_price).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-bold text-white">RD$ {parseFloat(item.subtotal).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                                <p className="text-slate-500 text-xs">No hay ítems registrados en esta factura.</p>
                            </div>
                        )}
                    </div>

                    {/* Payment History */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historial de Pagos</h3>
                        </div>

                        {isLoadingPayments ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : payments?.length > 0 ? (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Método</th>
                                            <th className="px-4 py-3">Referencia</th>
                                            <th className="px-4 py-3 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {payments.map((payment: any) => (
                                            <tr key={payment.id} className="text-slate-300">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        {payment.payment_method === 'CASH' ? <Clock className="w-3.5 h-3.5 text-orange-500" /> : <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                                                        <span className="text-xs">{payment.payment_method}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">{payment.reference_number || '-'}</td>
                                                <td className="px-4 py-3 text-right font-bold text-emerald-400">RD$ {parseFloat(payment.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center">
                                <p className="text-slate-500 text-sm">No se han registrado pagos para esta factura aún.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
