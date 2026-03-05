import { useState } from 'react';
import { usePortalAuth, usePortalData } from '../hooks/usePortal.tsx';
import { Layout, Receipt, GraduationCap, LogOut, Clock, Calendar, Trophy, TrendingUp, UserCheck, X } from 'lucide-react';
import { StudentExams } from '../components/exams/StudentExams';

type ViewMode = 'DASHBOARD' | 'EXAMS';

export function PortalMain() {
    const { student, logout } = usePortalAuth();
    const { profile, invoices, academic, attendance, grades } = usePortalData(student?.id);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');

    if (profile.isLoading || academic.isLoading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-[0.3em]">
            <GraduationCap className="w-12 h-12 mb-4 animate-bounce" />
            Optimizando tu portal...
        </div>
    );

    const gradesByModule = (grades.data || []).reduce((acc: any, g: any) => {
        const moduleName = g.module_name || 'General / Otros';
        if (!acc[moduleName]) acc[moduleName] = { grades: [], teacher: '' };
        acc[moduleName].grades.push(g);
        if (g.teacher_first_name && !acc[moduleName].teacher) {
            acc[moduleName].teacher = `${g.teacher_first_name} ${g.teacher_last_name}`;
        }
        return acc;
    }, {});

    const avgGrade = grades.data?.length
        ? (grades.data.reduce((acc: number, g: any) => acc + Number(g.value), 0) / grades.data.length).toFixed(1)
        : '0.0';

    const attendanceRecords = attendance.data || [];
    const presentCount = attendanceRecords.filter((a: any) => a.status === 'PRESENT').length;
    const lateCount = attendanceRecords.filter((a: any) => a.status === 'LATE').length;
    const attendancePct = attendanceRecords.length
        ? Math.round(((presentCount + (lateCount * 0.5)) / attendanceRecords.length) * 100)
        : 100;

    const pendingInvoices = invoices.data?.filter((inv: any) => inv.status !== 'PAID') || [];
    const totalPending = pendingInvoices.reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 pb-12">
            <nav className="border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-base tracking-tight">EduCRM <span className="text-blue-500 italic">Portal</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 mr-4">
                            <button
                                onClick={() => setViewMode('DASHBOARD')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Mi Progreso
                            </button>
                            <button
                                onClick={() => setViewMode('EXAMS')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'EXAMS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Exámenes
                            </button>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-white leading-none">{student?.first_name} {student?.last_name}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Mat: {student?.matricula}</span>
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

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {viewMode === 'DASHBOARD' ? (
                    <>
                        {/* Section: Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-7 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 shadow-2xl shadow-black/50">
                                <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-500/5 -rotate-12 group-hover:scale-110 group-hover:text-amber-500/10 transition-all duration-500" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2 flex items-center">
                                        <Trophy className="w-3 h-3 mr-2 text-amber-500" />
                                        Promedio General
                                    </p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{avgGrade}</h3>
                                    <div className="mt-3 flex items-center justify-between w-full">
                                        <div className="flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                                            <TrendingUp className="w-3 h-3 mr-1" /> Excelencia
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-7 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300 shadow-2xl shadow-black/50">
                                <UserCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-indigo-500/5 -rotate-12 group-hover:scale-110 group-hover:text-indigo-500/10 transition-all duration-500" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2 flex items-center">
                                        <UserCheck className="w-3 h-3 mr-2 text-indigo-500" />
                                        Asistencia
                                    </p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{attendancePct}%</h3>
                                    <div className="mt-3 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-lg inline-block">
                                        {presentCount} De {attendanceRecords.length} Clases
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-7 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300 shadow-2xl shadow-black/50">
                                <Layout className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-500/5 -rotate-12 group-hover:scale-110 group-hover:text-blue-500/10 transition-all duration-500" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2 flex items-center">
                                        <GraduationCap className="w-3 h-3 mr-2 text-blue-500" />
                                        Estatus Académico
                                    </p>
                                    <h3 className="text-2xl font-black text-emerald-400 h-[40px] flex items-center tracking-tight">ACTIVO</h3>
                                    <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                        {academic.data?.[0]?.program_name || 'Sin programas'}
                                    </div>
                                </div>
                            </div>
                            <div className={`bg-gradient-to-br ${totalPending > 0 ? 'from-rose-900/20 to-slate-900 border-rose-500/30' : 'from-emerald-900/20 to-slate-900 border-emerald-500/30'} border p-7 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-black/50`}>
                                <Receipt className={`absolute -right-6 -bottom-6 w-32 h-32 ${totalPending > 0 ? 'text-rose-500/10' : 'text-emerald-500/10'} -rotate-12 group-hover:scale-110 transition-all duration-500`} />
                                <div className="relative z-10">
                                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center ${totalPending > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        <Receipt className="w-3 h-3 mr-2" />
                                        Balance Pendiente
                                    </p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">RD${totalPending.toLocaleString()}</h3>
                                    <div className={`mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block ${totalPending > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                        {pendingInvoices.length} Factura{pendingInvoices.length !== 1 ? 's' : ''} Por Pagar
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Academics (2/3) */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] flex items-center">
                                        <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                                        Calificaciones por Módulo
                                    </h3>

                                    {Object.entries(gradesByModule).map(([moduleName, data]: [string, any]) => {
                                        const moduleAvg = (data.grades.reduce((acc: number, g: any) => acc + Number(g.value), 0) / data.grades.length).toFixed(1);
                                        return (
                                            <div key={moduleName} className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl shadow-black/20">
                                                <div className="p-6 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest">{moduleName}</h4>
                                                        {data.teacher && (
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 flex items-center">
                                                                <UserCheck className="w-3 h-3 mr-1.5 text-slate-400" /> Docente: {data.teacher}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Promedio Módulo</p>
                                                        <span className={`text-2xl font-black ${Number(moduleAvg) >= 3 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]'}`}>{moduleAvg}</span>
                                                    </div>
                                                </div>
                                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {data.grades.map((grade: any) => (
                                                        <div key={grade.id} className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-[1.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                                                            <div>
                                                                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">{grade.grade_type_name}</p>
                                                                <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-widest">{new Date(grade.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className={`px-4 py-2 rounded-xl text-xl font-black ${Number(grade.value) >= 3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                {Number(grade.value).toFixed(1)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {Object.keys(gradesByModule).length === 0 && (
                                        <div className="p-12 text-center bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                            Esperando el primer reporte de calificaciones...
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                        Historial de Asistencia
                                    </h3>
                                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl shadow-black/20">
                                        <div className="divide-y divide-slate-800/50">
                                            {attendance.data?.map((row: any) => (
                                                <div key={row.id} className="p-6 flex items-center justify-between hover:bg-slate-800/40 transition-all group">
                                                    <div className="flex items-center space-x-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                                                            <Clock className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                                                {new Date(row.date).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}
                                                            </p>
                                                            <p className="text-sm font-black text-white">{row.module_name || 'Clase Académica'}</p>
                                                            {row.teacher_first_name && (
                                                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1 opacity-80">Prof. {row.teacher_first_name} {row.teacher_last_name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${row.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' :
                                                            row.status === 'LATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5' :
                                                                'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'
                                                            }`}>
                                                            {row.status === 'PRESENT' ? 'Presente' : row.status === 'LATE' ? 'Retardo' : 'Ausente'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {attendance.data?.length === 0 && (
                                                <div className="p-16 text-center text-slate-500 text-[11px] uppercase font-black tracking-[0.2em] bg-slate-900/10">
                                                    Sin registros de asistencia
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Billing & Programs (1/3) */}
                            <div className="lg:col-span-4 space-y-8">
                                <div>
                                    <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center">
                                        <Receipt className="w-4 h-4 mr-2 text-emerald-500" />
                                        Estado de Cuenta
                                    </h3>
                                    <div className="space-y-4">
                                        {invoices.data?.slice(0, 4).map((invoice: any) => (
                                            <div key={invoice.id} className="relative bg-slate-900/60 border border-slate-800 p-6 rounded-3xl group hover:-translate-x-1 hover:border-slate-700 transition-all shadow-lg overflow-hidden flex flex-col justify-between">
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${invoice.status === 'PAID' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]'}`} />

                                                <div className="flex items-center justify-between mb-4 pl-2">
                                                    <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Factura #{invoice.invoice_number}</p>
                                                    <div className={`px-3 py-1 rounded-md text-[8px] font-black tracking-widest uppercase ${invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {invoice.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between pl-2">
                                                    <div>
                                                        <p className="text-2xl font-black text-white tracking-tight">RD${Number(invoice.total_amount).toLocaleString()}</p>
                                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1"><span className="text-slate-500">Vence:</span> {new Date(invoice.due_date || invoice.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedInvoice(invoice)}
                                                        className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 transition-all"
                                                    >
                                                        <Receipt className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
                                    <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                                        <GraduationCap className="w-32 h-32 text-indigo-300" />
                                    </div>
                                    <div className="relative z-10 text-center">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Mesa de Ayuda</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-6 px-2">¿Tienes dudas sobre tus notas o asistencia modular? Contacta a coordinación académica.</p>
                                        <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                                            Solicitar Soporte
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <StudentExams studentId={student?.id} cohortId={academic.data?.[0]?.cohort_id} />
                )}
            </main>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Detalle de Cobro</h2>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Factura #{selectedInvoice.invoice_number}</p>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                {selectedInvoice.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight">{item.item_name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1">Cantidad: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-white">RD${Number(item.unit_price * item.quantity).toLocaleString()}</p>
                                            <p className="text-[9px] text-slate-600 font-bold">Unidad: ${Number(item.unit_price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado del Pago</p>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedInvoice.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedInvoice.status === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {selectedInvoice.status === 'PAID' ? 'Pagado' : 'Pendiente de Pago'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Facturado</p>
                                    <p className="text-3xl font-black text-white">RD${Number(selectedInvoice.total_amount).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl text-[10px] text-blue-400 leading-relaxed font-bold">
                                <p className="flex items-center uppercase tracking-widest mb-1">
                                    <Receipt className="w-3 h-3 mr-2" /> Nota Administrativa
                                </p>
                                Si tienes dudas sobre los conceptos cobrados, por favor contacta al departamento de tesorería institucional mencionando tu número de factura.
                            </div>
                        </div>

                        <div className="p-8 bg-slate-950/50 border-t border-slate-800 text-center">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Entendido, cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
