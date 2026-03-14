import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Download, Filter, Calendar } from 'lucide-react';
import apiClient from '../../lib/api-client';
import toast from 'react-hot-toast';

export const DiplomasManager: React.FC = () => {
    const [diplomas, setDiplomas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCohort, setSelectedCohort] = useState('ALL');

    const fetchDiplomas = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/diplomas/all');
            setDiplomas(res.data);
        } catch (error) {
            console.error('Error fetching diplomas:', error);
            toast.error('Error al cargar la lista de diplomas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiplomas();
    }, []);

    const cohorts = Array.from(new Set(diplomas.map(d => d.cohort_name || 'Sin Cohorte'))).sort();

    const filteredDiplomas = diplomas.filter(d => {
        const matchesSearch = 
            d.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.course_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCohort = selectedCohort === 'ALL' || (d.cohort_name || 'Sin Cohorte') === selectedCohort;
        
        return matchesSearch && matchesCohort;
    });

    const handleDownload = (diplomaId: string) => {
        try {
            const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
            const url = `${baseUrl}/diplomas/${diplomaId}/pdf`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading diploma:', error);
            toast.error('Error al abrir enlace de descarga');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-white">
            <header className="h-20 shrink-0 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                        <GraduationCap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none">Gestión de Diplomas</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 text-indigo-500/80">Control Global de Graduaciones</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
                        <div className="px-3">
                            <Filter className="w-4 h-4 text-slate-500" />
                        </div>
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-slate-300 focus:ring-0 cursor-pointer pr-10"
                            value={selectedCohort}
                            onChange={(e) => setSelectedCohort(e.target.value)}
                        >
                            <option value="ALL">Todas las Cohortes</option>
                            {cohorts.map(cohort => (
                                <option key={cohort} value={cohort}>{cohort}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                {/* Search Bar */}
                <div className="mb-10 relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por estudiante, matrícula o curso..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-slate-700 rounded-[2rem] text-lg focus:outline-none focus:ring-4 focus:ring-indigo-600/20 focus:border-indigo-500 transition-all placeholder:text-slate-600 text-white shadow-2xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : filteredDiplomas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                        <GraduationCap className="w-20 h-20 mb-6 opacity-20" />
                        <p className="text-xl font-bold italic">No se encontraron diplomas con estos criterios</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDiplomas.map((diploma) => (
                            <div 
                                key={diploma.id}
                                className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-800/60 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <button 
                                        onClick={() => handleDownload(diploma.id)}
                                        className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-900/20"
                                        title="Descargar PDF"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-start space-x-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20 shrink-0">
                                        <GraduationCap className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="min-w-0 pr-10">
                                        <h3 className="text-lg font-black text-white truncate group-hover:text-indigo-400 transition-colors uppercase leading-tight">
                                            {diploma.student_name}
                                        </h3>
                                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                            {diploma.matricula || 'SIN MATRÍCULA'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Programa / Curso</p>
                                        <p className="text-sm font-bold text-slate-200 line-clamp-1">{diploma.course_name}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cohorte</p>
                                            <p className="text-sm font-bold text-slate-200 truncate">{diploma.cohort_name || 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fecha Emisión</p>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-3 h-3 text-indigo-400" />
                                                <p className="text-sm font-bold text-slate-200">
                                                    {new Date(diploma.issue_date || diploma.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                        ID Registro: {diploma.id.split('-')[0]}...
                                    </span>
                                    <div className="flex items-center space-x-1 text-emerald-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Certificado Válido</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
