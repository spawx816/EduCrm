import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useInstructorCohorts } from '../hooks/useInstructor';
import { GraduationCap, Users, Clock, ChevronRight, LogOut, Layout, Wallet, Hash } from 'lucide-react';
import { InstructorCohortDetail } from '../components/academic/InstructorCohortDetail.tsx';
import { useInstructorPayments } from '../hooks/useBilling.ts';

export function InstructorMain() {
    const { user, logout } = useAuth();
    const { data: cohorts, isLoading } = useInstructorCohorts(user?.id);
    const [selectedCohort, setSelectedCohort] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'COHORTS' | 'PAYMENTS'>('COHORTS');

    if (isLoading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-indigo-500 font-black animate-pulse uppercase tracking-[0.3em]">
            <GraduationCap className="w-12 h-12 mb-4 animate-bounce" />
            Cargando Portal Académico...
        </div>
    );

    if (selectedCohort) {
        return <InstructorCohortDetail cohort={selectedCohort} onBack={() => setSelectedCohort(null)} />;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
            {/* Header / Nav */}
            <nav className="border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-base tracking-tight">EduCRM <span className="text-indigo-400 italic">Instructor</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 mr-4">
                            <button
                                onClick={() => setViewMode('COHORTS')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'COHORTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Académico
                            </button>
                            <button
                                onClick={() => setViewMode('PAYMENTS')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'PAYMENTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Pagos
                            </button>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-white leading-none">{user?.firstName} {user?.lastName}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Docente de Planta</span>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-700/50"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                {viewMode === 'COHORTS' ? (
                    <>
                        {/* Section: Welcome & Stats */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Panel de Control <span className="text-indigo-500 italic">Académico</span></h1>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Gestiona tus grupos, reporta asistencias y registra calificaciones.</p>
                            </div>
                            <div className="flex bg-slate-900/50 p-2 rounded-2xl border border-slate-800 backdrop-blur-sm">
                                <div className="px-6 py-2 border-r border-slate-800">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Grupos Activos</p>
                                    <p className="text-xl font-black text-white">{cohorts?.length || 0}</p>
                                </div>
                                <div className="px-6 py-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ciclo Actual</p>
                                    <p className="text-xl font-black text-indigo-400">2026-Q1</p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Cohorts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.isArray(cohorts) && cohorts.map((cohort: any) => (
                                <div
                                    key={cohort.id}
                                    onClick={() => setSelectedCohort(cohort)}
                                    className="group relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/5 -rotate-12 group-hover:scale-110 group-hover:text-indigo-500/10 transition-all">
                                        <Users className="w-full h-full" />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="px-3 py-1 bg-indigo-600/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                                                Grupo Activo
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <div className="mb-8">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{cohort.program_name}</p>
                                            <h3 className="text-2xl font-black text-white tracking-tight">{cohort.name}</h3>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-4">
                                            <div className="flex items-center text-slate-400">
                                                <Users className="w-4 h-4 mr-2 text-indigo-500" />
                                                <span className="text-[10px] font-bold uppercase">Estudiantes</span>
                                            </div>
                                            <div className="flex items-center text-slate-400">
                                                <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                                <span className="text-[10px] font-bold uppercase">Modular</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {cohorts?.length === 0 && (
                            <div className="p-20 text-center bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800">
                                <Layout className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No tienes grupos asignados</h3>
                                <p className="text-slate-600 text-sm mt-2">Contacta a coordinación académica para gestionar tus asignaciones.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <InstructorPaymentsView teacherId={user?.id} />
                )}
            </main>
        </div>
    );
}

function InstructorPaymentsView({ teacherId }: { teacherId: string }) {
    const { data: payments, isLoading } = useInstructorPayments(teacherId);

    if (isLoading) return (
        <div className="p-20 text-center font-black animate-pulse text-indigo-500 uppercase tracking-widest">
            Cargando Historial de Pagos...
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Mis <span className="text-indigo-500 italic">Pagos</span></h1>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Consulta tu historial de honorarios y comprobantes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Recibido</p>
                    <p className="text-3xl font-black text-white tracking-tighter">RD${(Array.isArray(payments) ? payments : []).reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Método</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Referencia</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {Array.isArray(payments) && payments.map((payment: any) => (
                                <tr key={payment.id} className="hover:bg-indigo-500/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="text-white font-black text-sm">
                                            {new Date(payment.payment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700">
                                            {payment.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-slate-400 text-sm font-mono uppercase">
                                        <div className="flex items-center leading-none">
                                            <Hash className="w-3 h-3 mr-2 opacity-50" />
                                            {payment.reference_number || 'S/R'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-lg font-black text-emerald-400 tracking-tighter">RD${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!payments || payments.length === 0) && (
                    <div className="p-20 text-center opacity-50">
                        <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No hay registros de pagos disponibles</p>
                    </div>
                )}
            </div>
        </div>
    );
}
