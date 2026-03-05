import { useDashboardStats } from '../hooks/useStats';
import { DashboardStatsGrid } from '../components/dashboard/DashboardStatsGrid';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { Loader2, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function DashboardOverview() {
    const { data: stats, isLoading, isError, refetch, isRefetching } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-medium animate-pulse">Cargando métricas estratégicas...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Error al cargar datos</h3>
                <p className="max-w-xs mb-6 text-sm">No pudimos conectar con el servicio de estadísticas. Por favor intenta de nuevo.</p>
                <button
                    onClick={() => refetch()}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl transition-all flex items-center"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0f1e] overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Panel de Control</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Resumen de Operaciones</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Actualizar datos"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-blue-500' : ''}`} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    {/* 1. Summary Cards */}
                    {stats?.summary && <DashboardStatsGrid summary={stats.summary} />}

                    {/* 3. Lead Link Generator (Automation) */}
                    <div className="bg-gradient-to-br from-blue-600/10 to-emerald-600/5 rounded-2xl border border-blue-500/20 p-8 mb-8 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <RefreshCw className="w-24 h-24 text-blue-500" />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-xl font-black text-white mb-2 tracking-tight flex items-center">
                                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-600/20">
                                    <Send className="w-4 h-4 text-white" />
                                </span>
                                Automatiza tu Captación de Leads
                            </h2>
                            <p className="text-slate-400 text-sm mb-8 font-medium">
                                Genera enlaces personalizados para tus campañas y capta estudiantes directamente en tu Kanban de admisiones. El sistema rastreará el origen automáticamente.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Facebook Ads', source: 'facebook', icon: 'FB' },
                                    { label: 'Instagram Ads', source: 'instagram', icon: 'IG' },
                                    { label: 'Google Search', source: 'google', icon: 'G' },
                                    { label: 'WhatsApp', source: 'whatsapp', icon: 'WA' },
                                    { label: 'Sitio Web', source: 'website', icon: 'WWW' },
                                ].map((plat) => (
                                    <button
                                        key={plat.source}
                                        onClick={() => {
                                            const url = `${window.location.origin}/solicitar?source=${plat.source}`;
                                            navigator.clipboard.writeText(url);
                                            toast.success(`Enlace para ${plat.label} copiado`);
                                        }}
                                        className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center space-x-2 active:scale-95"
                                    >
                                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{plat.icon}</span>
                                        <span>Copiar Link</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. Charts Section */}
                    {stats && (
                        <DashboardCharts
                            leadsByStage={stats.leadsByStage || []}
                            studentsByProgram={stats.studentsByProgram || []}
                        />
                    )}

                    {/* 3. Footer Info */}
                    <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-medium">
                        <p>© 2026 EduCRM All-in-One — Inteligencia de Negocio</p>
                        <p>Última actualización: {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
