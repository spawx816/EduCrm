import { useState } from 'react';
import { useInstructorPayments, useRegisterInstructorPayment } from '../../hooks/useBilling.ts';
import { useInstructors } from '../../hooks/useAcademic.ts';
import { Wallet, Plus, Loader2, ArrowLeft, Hash, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/api-client.ts';

const PAYMENT_METHODS: Record<string, string> = {
    'TRANSFER': 'Transferencia',
    'CASH': 'Efectivo',
    'CARD': 'Tarjeta',
    'CHECK': 'Cheque'
};

export function InstructorPayrollManager() {
    const { data: instructors } = useInstructors();
    const { data: payments, isLoading } = useInstructorPayments();
    const registerPayment = useRegisterInstructorPayment();

    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: '',
        amount: '',
        method: 'TRANSFER',
        reference: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerPayment.mutateAsync({
                teacherId: formData.teacherId,
                amount: parseFloat(formData.amount),
                paymentMethod: formData.method,
                referenceNumber: formData.reference,
                notes: formData.notes,
                date: formData.date
            });
            toast.success('Pago registrado correctamente');
            setIsAdding(false);
            setFormData({
                teacherId: '',
                amount: '',
                method: 'TRANSFER',
                reference: '',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            toast.error('Error al registrar el pago');
        }
    };

    const handleDownloadReceipt = async (paymentId: string) => {
        try {
            const response = await apiClient.get(`/billing/instructor-payments/${paymentId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nomina-${paymentId.substring(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error downloading receipt:', error);
            toast.error('Error al generar el recibo');
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 text-indigo-500 font-black animate-pulse">
            <Wallet className="w-12 h-12 mb-4 animate-bounce" />
            PROCESANDO NÓMINA...
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter flex items-center">
                        <Wallet className="w-10 h-10 mr-4 text-indigo-500" />
                        Nómina de <span className="text-indigo-500 italic ml-2">Docentes</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Gestión y control de honorarios académicos</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center space-x-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Pago</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-900/50 border border-indigo-500/30 p-8 rounded-[2.5rem] backdrop-blur-xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-white tracking-tight">Nuevo Registro de Pago</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Docente</label>
                            <select
                                required
                                value={formData.teacherId}
                                onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            >
                                <option value="">Seleccionar Instructor</option>
                                {Array.isArray(instructors) && instructors.map((inst: any) => (
                                    <option key={inst.id} value={inst.id}>{inst.first_name} {inst.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Monto (USD)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Fecha de Pago</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Método</label>
                            <select
                                required
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            >
                                {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Referencia</label>
                            <input
                                type="text"
                                value={formData.reference}
                                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                placeholder="Ej: TXN-9988"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Notas / Concepto</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Detalles adicionales del pago..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all h-20 resize-none"
                            />
                        </div>

                        <div className="lg:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={registerPayment.isPending}
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50"
                            >
                                {registerPayment.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Registro'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Fecha</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Docente</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Método</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Referencia</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Monto</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {Array.isArray(payments) && payments.map((payment: any) => (
                            <tr key={payment.id} className="hover:bg-indigo-500/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col items-center">
                                        <span className="text-white font-black text-sm">{new Date(payment.payment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(payment.payment_date).getFullYear()}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-400 border border-slate-700">
                                            {payment.first_name[0]}{payment.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{payment.first_name} {payment.last_name}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Docente de Planta</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700">
                                        {PAYMENT_METHODS[payment.payment_method] || payment.payment_method || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center text-slate-400 text-sm font-mono">
                                        <Hash className="w-3 h-3 mr-2 text-slate-600" />
                                        {payment.reference_number || '---'}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className="text-lg font-black text-emerald-400 tracking-tighter">RD${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => handleDownloadReceipt(payment.id)}
                                        className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-colors group-hover:bg-slate-700 inline-flex items-center justify-center"
                                        title="Descargar Comprobante"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {payments?.length === 0 && (
                    <div className="p-20 text-center">
                        <Wallet className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest">No hay registros de pago</h3>
                        <p className="text-slate-700 text-xs mt-2 uppercase font-black tracking-widest">Inicia la nómina registrando el primer pago.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
