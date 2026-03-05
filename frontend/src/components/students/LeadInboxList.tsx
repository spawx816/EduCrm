import { useState, useEffect } from 'react';
import { Mail, Phone, Users, CheckCircle, Search, X } from 'lucide-react';
import apiClient from '../../lib/api-client';
import { toast } from 'react-hot-toast';
import { EmptyState } from '../shared/EmptyState';
import { RegisterStudentModal } from './RegisterStudentModal';

export function LeadInboxList() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Error al cargar prospectos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = leads.filter(lead => {
        const full = `${lead.first_name} ${lead.last_name} ${lead.email} ${lead.phone}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const handleSuccessConversion = async () => {
        if (!selectedLead) return;
        try {
            // Delete the lead from inbox since it's already a student
            await apiClient.delete(`/leads/${selectedLead.id}`);
            toast.success('Prospecto movido exitosamente del inbox');
            fetchLeads();
        } catch (error) {
            console.error('Failed to cleanup lead:', error);
        }
        setSelectedLead(null);
    };

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl shadow-black/20">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Bandeja de Prospectos</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Contacta y matricula a los leads de tu formulario web</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl shadow-black/20">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-10 py-3 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-800 rounded-md transition-colors"
                        >
                            <X className="w-3 h-3 text-slate-500" />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden text-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 rounded-full animate-ping absolute"></div>
                            <div className="w-12 h-12 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse">Cargando Inbox...</p>
                    </div>
                ) : filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
                            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 md:px-6 py-4">Prospecto</th>
                                    <th className="px-4 md:px-6 py-4">Contacto</th>
                                    <th className="px-4 md:px-6 py-4">Origen</th>
                                    <th className="px-4 md:px-6 py-4 text-right">Acciones Estudiante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold border border-emerald-800 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                    {lead.first_name[0]}{lead.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium truncate max-w-[120px] md:max-w-none group-hover:text-emerald-400 transition-colors">
                                                        {lead.first_name} {lead.last_name}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">
                                                        {new Date(lead.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center text-xs">
                                                    <Mail className="w-3 h-3 mr-2 text-slate-500 shrink-0" />
                                                    <a href={`mailto:${lead.email}`} className="truncate max-w-[150px] hover:text-emerald-400 transition-colors">
                                                        {lead.email || 'N/A'}
                                                    </a>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    <button
                                                        onClick={() => lead.phone && openWhatsApp(lead.phone)}
                                                        className="flex items-center text-blue-400 hover:text-blue-300 underline underline-offset-4 tracking-tight transition-all"
                                                    >
                                                        <Phone className="w-3 h-3 mr-2 shrink-0" />
                                                        {lead.phone || 'N/A'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap bg-purple-900/20 text-purple-400 border border-purple-800/50">
                                                {lead.source || 'WEB'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                <span>Aprobar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={Users}
                        title="Bandeja Vacía"
                        description="No hay prospectos registrados aún."
                    />
                )}
            </div>

            <RegisterStudentModal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                initialData={selectedLead}
                onSuccess={handleSuccessConversion}
            />
        </div>
    );
}
