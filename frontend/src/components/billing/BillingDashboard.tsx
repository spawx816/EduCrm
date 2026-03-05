import { useState } from 'react';
import { useInvoices, useBillingItems, useVoidInvoice } from '../../hooks/useBilling.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { Receipt, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Search, Tag, Eye, Trash2 } from 'lucide-react';
import apiClient from '../../lib/api-client.ts';
import { CreateInvoiceModal } from './CreateInvoiceModal.tsx';
import { RegisterPaymentModal } from './RegisterPaymentModal.tsx';
import { CreateBillingItemModal } from './CreateBillingItemModal.tsx';
import { InvoiceDetailsModal } from './InvoiceDetailsModal.tsx';
import { ScholarshipSettings } from './ScholarshipSettings.tsx';

export function BillingDashboard() {
    const [mainTab, setMainTab] = useState<'invoices' | 'catalog' | 'scholarships'>('invoices');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: invoices, isLoading: isLoadingInvoices } = useInvoices({
        status: statusFilter,
        search: debouncedSearch,
        startDate,
        endDate
    });
    const { data: items, isLoading: isLoadingItems } = useBillingItems();
    const voidInvoice = useVoidInvoice();

    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Only block if it's the INITIAL load (no data yet)
    if ((isLoadingInvoices && !invoices) || (isLoadingItems && !items)) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const pendingTotal = (Array.isArray(invoices) ? invoices : []).reduce((sum: number, inv: any) =>
        inv.status !== 'PAID' && inv.status !== 'VOIDED' ? sum + (parseFloat(inv.total_amount) - parseFloat(inv.paid_amount)) : sum, 0) || 0;
    const collectedTotal = (Array.isArray(invoices) ? invoices : []).reduce((sum: number, inv: any) => sum + parseFloat(inv.paid_amount), 0) || 0;
    const overdueCount = (Array.isArray(invoices) ? invoices : []).filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'VOIDED' && new Date(inv.due_date) < new Date()).length || 0;

    return (
        <div className="space-y-6">
            <div className="flex border-b border-slate-800 space-x-8 mb-2">
                <button
                    onClick={() => setMainTab('invoices')}
                    className={`pb-4 text-sm font-bold transition-all relative ${mainTab === 'invoices' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Facturación General
                    {mainTab === 'invoices' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setMainTab('catalog')}
                    className={`pb-4 text-sm font-bold transition-all relative ${mainTab === 'catalog' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Catálogo de Conceptos
                    {mainTab === 'catalog' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setMainTab('scholarships')}
                    className={`pb-4 text-sm font-bold transition-all relative ${mainTab === 'scholarships' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Becas y Descuentos
                    {mainTab === 'scholarships' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
            </div>

            {mainTab === 'invoices' ? (
                <>
                    {/* Metrics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pendiente</span>
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">RD$ {pendingTotal.toLocaleString()}</div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Recaudado</span>
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">RD$ {collectedTotal.toLocaleString()}</div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mora</span>
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{overdueCount}</div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
                        <div className="p-4 border-b border-slate-800">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Receipt className="w-5 h-5 text-blue-500" />
                                        <h2 className="font-bold text-white uppercase tracking-tight text-sm">Registro de Facturas</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsInvoiceModalOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center shadow-lg shadow-blue-600/20"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Factura
                                    </button>
                                </div>

                                {/* Advanced Filters Bar */}
                                <div className="flex flex-wrap items-center gap-3 bg-slate-800/20 p-3 rounded-xl border border-slate-800/50">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar estudiante o factura..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                                        {['ALL', 'PENDING', 'PARTIAL', 'PAID', 'VOIDED'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setStatusFilter(f)}
                                                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${statusFilter === f
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {f === 'ALL' ? 'Todos' : (f === 'PENDING' ? 'Pendiente' : (f === 'PARTIAL' ? 'Parcial' : (f === 'PAID' ? 'Pagado' : 'Anulado')))}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-900 p-1 px-2 rounded-lg border border-slate-800">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent border-none text-[10px] text-white outline-none w-24"
                                        />
                                        <span className="text-slate-700">-</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent border-none text-[10px] text-white outline-none w-24"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Nº Factura</th>
                                        <th className="px-6 py-4">Estudiante / Conceptos</th>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                        <th className="px-6 py-4 text-right">Pagado</th>
                                        <th className="px-6 py-4 text-right">Saldo</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {Array.isArray(invoices) && invoices.map((invoice: any) => {
                                        const remaining = parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount);
                                        return (
                                            <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4 text-white font-mono font-bold tracking-tighter">
                                                    {invoice.invoice_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-medium">{invoice.first_name} {invoice.last_name}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]" title={invoice.concepts}>
                                                        {invoice.concepts || 'Sin conceptos'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs">{new Date(invoice.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-white font-bold text-right">RD$ {parseFloat(invoice.total_amount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-emerald-400 font-bold text-right">RD$ {parseFloat(invoice.paid_amount).toLocaleString()}</td>
                                                <td className={`px-6 py-4 font-bold text-right ${remaining > 0 ? 'text-amber-400' : 'text-slate-500'}`}>RD$ {remaining.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${invoice.status === 'PAID'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : invoice.status === 'PARTIAL'
                                                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                            : invoice.status === 'VOIDED'
                                                                ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        }`}>
                                                        {invoice.status === 'PAID' ? 'PAGADO' : (invoice.status === 'PARTIAL' ? 'PARCIAL' : (invoice.status === 'VOIDED' ? 'ANULADO' : 'PENDIENTE'))}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInvoice(invoice);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                            className="text-slate-400 hover:text-blue-400 p-1.5 hover:bg-slate-800 rounded-lg transition-all"
                                                            title="Ver Detalle"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await apiClient.get(`/billing/invoices/${invoice.id}/pdf`, {
                                                                        responseType: 'arraybuffer'
                                                                    });
                                                                    const blob = new Blob([res.data], { type: 'application/pdf' });
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    window.open(url, '_blank');
                                                                } catch (err) {
                                                                    console.error('Error generating PDF:', err);
                                                                }
                                                            }}
                                                            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-all"
                                                            title="Imprimir Ticket"
                                                        >
                                                            <Receipt className="w-4 h-4" />
                                                        </button>

                                                        {invoice.status !== 'PAID' && invoice.status !== 'VOIDED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedInvoice(invoice);
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    className="text-emerald-500 hover:text-emerald-400 p-1.5 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                                    title="Registrar Pago"
                                                                >
                                                                    <DollarSign className="w-4 h-4" />
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm(`¿Estás seguro de anular la factura ${invoice.invoice_number}? Esta acción no se puede deshacer.`)) {
                                                                            voidInvoice.mutate(invoice.id);
                                                                        }
                                                                    }}
                                                                    className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                    title="Anular Factura"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : mainTab === 'catalog' ? (
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Tag className="w-5 h-5 text-emerald-500" />
                            <h2 className="font-bold text-white uppercase tracking-tight text-sm">Catálogo de Conceptos</h2>
                        </div>
                        <button
                            onClick={() => setIsItemModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center shadow-lg shadow-emerald-600/10"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Concepto
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Descripción</th>
                                    <th className="px-6 py-4 text-right">Precio Base</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {Array.isArray(items) && items.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 text-white font-bold">{item.name}</td>
                                        <td className="px-6 py-4 text-xs italic text-slate-500">{item.description || 'Sin descripción'}</td>
                                        <td className="px-6 py-4 text-white font-bold text-right">RD$ {parseFloat(item.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <ScholarshipSettings />
            )}

            <CreateInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
            />

            <RegisterPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                invoice={selectedInvoice}
            />

            <CreateBillingItemModal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
            />

            <InvoiceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                invoice={selectedInvoice}
            />
        </div>
    );
}
