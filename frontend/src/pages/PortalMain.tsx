import { useState } from 'react';
import { usePortalAuth, usePortalData } from '../hooks/usePortal.tsx';
import { StudentExams } from '../components/exams/StudentExams';
import { Menu, GraduationCap, LogOut, Clock, Calendar, Trophy, TrendingUp, UserCheck, X, User, Mail, Phone, MapPin, CreditCard, Download, Edit2, Check, ShieldCheck, UserCircle, Save, Layout, Receipt, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PlatformTour } from '../components/common/PlatformTour.tsx';
import { GlobalCalendar } from '../components/common/GlobalCalendar.tsx';
import { LibraryDashboard } from '../components/library/LibraryDashboard.tsx';

type ViewMode = 'DASHBOARD' | 'EXAMS' | 'LIBRARY' | 'DIPLOMAS' | 'PROFILE' | 'CALENDAR';

const CircularProgress = ({ value, label }: { value: number, label: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center group">
            <svg className="w-24 h-24 transform -rotate-90">
                <circle
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
                <circle
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="48"
                    cy="48"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white">{value}%</span>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
        </div>
    );
};

export function PortalMain() {
    const { student, logout } = usePortalAuth();
    const { profile, invoices, academic, attendance, grades, exams, diplomas, updateProfile } = usePortalData(student?.id);
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState<any>({});
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Set initial enrollment
    useEffect(() => {
        if (!selectedEnrollmentId && academic.data?.length > 0) {
            setSelectedEnrollmentId(academic.data[0].id);
        }
    }, [academic.data, selectedEnrollmentId]);

    const currentEnrollment = academic.data?.find((e: any) => e.id === selectedEnrollmentId) || academic.data?.[0];
    const currentCohortId = currentEnrollment?.cohort_id;

    if (profile.isLoading || academic.isLoading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-[0.3em]">
            <GraduationCap className="w-12 h-12 mb-4 animate-bounce" />
            Optimizando tu portal...
        </div>
    );

    // Filter grades by current cohort
    const filteredGrades = (grades.data || []).filter((g: any) => g.cohort_id === currentCohortId);

    // Merge exams into grades view
    const filteredExams = (exams.data || [])
        .filter((ex: any) => ex.cohort_id === currentCohortId && ex.status === 'COMPLETED')
        .map((ex: any) => ({
            id: `exam-${ex.id}`,
            value: ex.score,
            module_name: ex.module_name,
            grade_type_name: `Examen: ${ex.exam_title}`,
            created_at: ex.completed_at,
            order_index: ex.order_index,
            is_exam: true
        }));

    const allScores = [...filteredGrades, ...filteredExams];

    const gradesByModule = Object.entries(allScores.reduce((acc: any, g: any) => {
        const moduleName = g.module_name || 'General / Otros';
        if (!acc[moduleName]) acc[moduleName] = { grades: [], teacher: '', order_index: g.order_index || 0 };
        acc[moduleName].grades.push(g);
        if (g.teacher_first_name && !acc[moduleName].teacher) {
            acc[moduleName].teacher = `${g.teacher_first_name} ${g.teacher_last_name}`;
        }
        return acc;
    }, {} as any))
        .sort(([, a]: any, [, b]: any) => (a.order_index || 0) - (b.order_index || 0))
        .reduce((acc: any, [key, value]: any) => {
            acc[key] = value;
            return acc;
        }, {});

    // Weighted calculation for average grade
    let totalEarnedPoints = 0;
    let totalPossibleWeight = 0;
    let totalHasGrades = false;

    allScores.forEach((g: any) => {
        let weight = parseFloat(g.weight);
        const value = parseFloat(g.value) || 0;
        const name = (g.grade_type_name || '').toLowerCase();

        // FALLBACK: If weight is missing, 0, or 1.0 (default), try to infer from name
        if (!weight || weight <= 1.0) {
            if (name.includes('asistencia')) weight = 10;
            else if (name.includes('careo')) weight = 25;
            else if (name.includes('exposic')) weight = 25;
            else if (name.includes('examen')) weight = 40;
            else weight = weight || 0; // Keep 0 if no match
        }
        
        if (weight > 0) {
            totalHasGrades = true;
            if (weight > 1) {
                totalEarnedPoints += value;
                totalPossibleWeight += weight;
            } else {
                totalEarnedPoints += (value * weight);
                totalPossibleWeight += (weight * 100);
            }
        }
    });

    // Final result should be raw earned points for points systems
    // but weighted average for pure percentage systems. 
    // For this app, we usually target a 0-100 total.
    const avgGrade = totalHasGrades ? totalEarnedPoints.toFixed(1) : '0.0';
    const isPointsSystem = totalPossibleWeight > 1.1; 


    const attendanceRecords = (attendance.data || []).filter((a: any) => a.cohort_id === currentCohortId);
    const presentCount = attendanceRecords.filter((a: any) => a.status === 'PRESENT').length;
    const lateCount = attendanceRecords.filter((a: any) => a.status === 'LATE').length;
    const attendancePct = attendanceRecords.length
        ? Math.round(((presentCount + (lateCount * 0.5)) / attendanceRecords.length) * 100)
        : 100;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile.mutateAsync(profileForm);
            setEditMode(false);
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            toast.error('Error al actualizar perfil');
        }
    };

    const studentInfo = profile.data || {};

    const pendingInvoices = invoices.data?.filter((inv: any) => inv.status !== 'PAID') || [];
    const totalPending = pendingInvoices.reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 pb-12">
            <PlatformTour role="estudiante" />
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

                    <div className="flex items-center space-x-4 md:space-x-6">
                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                            {[
                                { id: 'DASHBOARD', label: 'Mi Progreso' },
                                { id: 'EXAMS', label: 'Exámenes' },
                                { id: 'DIPLOMAS', label: 'Diplomas' },
                                { id: 'CALENDAR', label: 'Calendario' },
                                { id: 'LIBRARY', label: 'Biblioteca' },
                                { id: 'PROFILE', label: 'Mi Perfil' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id as ViewMode)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700/50"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

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

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#0f172a] border-l border-slate-800 p-8 shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Menú Portal</h3>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'DASHBOARD', label: 'Mi Progreso', icon: Trophy },
                                { id: 'EXAMS', label: 'Exámenes', icon: ClipboardList },
                                { id: 'DIPLOMAS', label: 'Diplomas', icon: Trophy },
                                { id: 'CALENDAR', label: 'Calendario', icon: Calendar },
                                { id: 'LIBRARY', label: 'Biblioteca', icon: GraduationCap },
                                { id: 'PROFILE', label: 'Mi Perfil', icon: UserCircle }
                            ].map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setViewMode(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${viewMode === item.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="absolute bottom-12 left-8 right-8">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center space-x-3 p-4 bg-rose-600/10 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {viewMode === 'DASHBOARD' ? (
                    <>
                        {/* Section: Program Selector (if multiple) */}
                        {academic.data?.length > 1 && (
                            <div className="bg-[#0f172a]/80 border border-slate-800 p-4 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Programa Seleccionado</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">{currentEnrollment?.program_name}</p>
                                    </div>
                                </div>
                                <select
                                    value={selectedEnrollmentId || ''}
                                    onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                                >
                                    {academic.data.map((e: any) => (
                                        <option key={e.id} value={e.id}>{e.program_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Section: Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 shadow-2xl shadow-black/50">
                                <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-500/5 -rotate-12 group-hover:scale-110 group-hover:text-amber-500/10 transition-all duration-500" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2 flex items-center">
                                        <Trophy className="w-3 h-3 mr-2 text-amber-500" />
                                        {isPointsSystem ? 'Puntos Totales' : 'Promedio General'}
                                    </p>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{avgGrade}{isPointsSystem ? '/100' : ''}</h3>
                                    <div className="mt-3 flex items-center justify-between w-full">
                                        <div className="flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                                            <TrendingUp className="w-3 h-3 mr-1" /> Excelencia
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 shadow-2xl shadow-black/50">
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

                            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 shadow-2xl shadow-black/50">
                                <Layout className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-500/5 -rotate-12 group-hover:scale-110 group-hover:text-blue-500/10 transition-all duration-500" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2 flex items-center">
                                        <GraduationCap className="w-3 h-3 mr-2 text-blue-500" />
                                        Estatus Académico
                                    </p>
                                    <h3 className="text-2xl font-black text-emerald-400 h-[40px] flex items-center tracking-tight">ACTIVO</h3>
                                    <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                        {currentEnrollment?.program_name || 'Sin programas'}
                                    </div>
                                </div>
                            </div>
                            <div className={`bg-gradient-to-br ${totalPending > 0 ? 'from-rose-900/20 to-slate-900 border-rose-500/30' : 'from-emerald-900/20 to-slate-900 border-emerald-500/30'} border p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden group transition-all duration-300 shadow-2xl shadow-black/50`}>
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
                                         let moduleEarned = 0;
                                        let moduleWeight = 0;
                                        let moduleHasGrades = false;

                                         data.grades.forEach((g: any) => {
                                            const weight = parseFloat(g.weight) || 0;
                                            const value = parseFloat(g.value) || 0;
                                            
                                            moduleHasGrades = true;
                                            
                                            if (weight > 1) {
                                                moduleEarned += value;
                                                moduleWeight += weight;
                                            } else if (weight > 0) {
                                                moduleEarned += (value * weight);
                                                moduleWeight += (weight * 100);
                                            }
                                        });

                                        const moduleTotal = moduleHasGrades ? moduleEarned.toFixed(1) : '0';
                                        const isModPoints = moduleWeight > 1.1;

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
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{isModPoints ? 'PUNTOS GANADOS' : 'PROMEDIO MÓDULO'}</p>
                                                        <span className={`text-2xl font-black ${Number(moduleTotal) >= (isModPoints ? 70 : 60) ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]'}`}>
                                                            {moduleTotal}{isModPoints ? '/100' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {data.grades.map((grade: any) => (
                                                        <div key={grade.id} className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-[1.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                                                            <div>
                                                                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">{grade.grade_type_name}</p>
                                                                <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-widest">{new Date(grade.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className={`px-4 py-2 rounded-xl text-xl font-black ${Number(grade.value || 0) >= (parseFloat(grade.weight) > 1 ? (parseFloat(grade.weight) * 0.7) : 70) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                {parseFloat(grade.weight) > 1 ? Number(grade.value || 0).toFixed(1) : Number(grade.value || 0).toFixed(0)}
                                                                {parseFloat(grade.weight) > 1 && <span className="text-[8px] opacity-40 ml-1">/{parseFloat(grade.weight)}p</span>}
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
                                            {attendanceRecords.map((row: any) => (
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
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => setSelectedInvoice(invoice)}
                                                                className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/30"
                                                            >
                                                                <Receipt className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/billing/invoices/${invoice.id}/pdf`, '_blank')}
                                                                className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 hover:text-white hover:bg-blue-600 transition-all border border-blue-500/30"
                                                            >
                                                                <Download className="w-5 h-5" />
                                                            </button>
                                                        </div>
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
                ) : viewMode === 'EXAMS' ? (
                    <StudentExams studentId={student?.id} cohortId={currentCohortId} />
                ) : viewMode === 'PROFILE' ? (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                        {/* Header Profile */}
                        <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                               <ShieldCheck className="w-64 h-64 text-blue-400" />
                           </div>
                           
                           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-700 group-hover:border-blue-500/50 transition-colors shadow-2xl shadow-black/50 overflow-hidden">
                                        {studentInfo.avatar_url ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${studentInfo.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle className="w-16 h-16 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-[#020617] rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                                        <Check className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">{studentInfo.first_name} {studentInfo.last_name}</h2>
                                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                                <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                                                    Mat: {studentInfo.matricula}
                                                </div>
                                                <div className="bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                                                    Estatus: ACTIVO
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setEditMode(!editMode)}
                                            className="mt-6 md:mt-0 px-6 py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center border border-slate-700 hover:border-blue-400 group/btn shadow-xl"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                            {editMode ? 'Cancelar Edición' : 'Editar Información'}
                                        </button>
                                    </div>
                                </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info Box */}
                            <div className="bg-slate-900/60 border border-slate-800 p-10 rounded-[3rem] shadow-xl group">
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Datos Personales
                                </h4>
                                
                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Cédula / Documento</label>
                                        <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-[1.5rem] flex items-center space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <CreditCard className="w-5 h-5 text-indigo-500" />
                                            <span className="text-sm font-bold text-white tracking-widest">{studentInfo.document_id}</span>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">({studentInfo.document_type})</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Correo Electrónico</label>
                                        <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] group/input transition-all focus-within:border-blue-500/50 focus-within:bg-slate-950">
                                            <div className="flex items-center space-x-4 px-3 py-3">
                                                <Mail className="w-5 h-5 text-blue-500" />
                                                <input 
                                                    type="email"
                                                    disabled={!editMode}
                                                    value={profileForm.email || ''}
                                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 placeholder-slate-700"
                                                    placeholder="tucorreo@ejemplo.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Teléfono / WhatsApp</label>
                                            <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] group/input transition-all focus-within:border-emerald-500/50 focus-within:bg-slate-950">
                                                <div className="flex items-center space-x-4 px-3 py-3">
                                                    <Phone className="w-5 h-5 text-emerald-500" />
                                                    <input 
                                                        type="text"
                                                        disabled={!editMode}
                                                        value={profileForm.phone || ''}
                                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 placeholder-slate-700"
                                                        placeholder="809-000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Other field if needed */}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Dirección de Residencia</label>
                                        <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] group/input transition-all focus-within:border-indigo-500/50 focus-within:bg-slate-950">
                                            <div className="flex items-center space-x-4 px-3 py-3">
                                                <MapPin className="w-5 h-5 text-indigo-500" />
                                                <textarea 
                                                    disabled={!editMode}
                                                    rows={1}
                                                    value={profileForm.address || ''}
                                                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                                    className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 placeholder-slate-700 resize-none pt-2"
                                                    placeholder="Sector, calle, #..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {editMode && (
                                        <button 
                                            type="submit"
                                            disabled={updateProfile.isPending}
                                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center space-x-3 active:scale-95"
                                        >
                                            {updateProfile.isPending ? 'Guardando Cambios...' : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Guardar Cambios</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* Academic Status Box */}
                            <div className="space-y-8">
                                <div className="bg-slate-900/60 border border-slate-800 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-10 flex items-center">
                                        <ShieldCheck className="w-4 h-4 mr-2" /> Seguridad de Cuenta
                                    </h4>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-slate-950/80 border border-slate-800 rounded-3xl group-hover:bg-slate-950 transition-all">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contraseña Institucional</p>
                                                    <p className="text-xs font-bold text-white mt-1 uppercase tracking-tight">Activa & Segura</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => toast.success('Para cambiar tu contraseña, contacta a Soporte Técnico')}
                                                className="px-5 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-700"
                                            >
                                                Gestionar
                                            </button>
                                        </div>

                                        <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                                            <p className="text-[10px] text-blue-400 leading-relaxed font-bold uppercase tracking-wider">
                                                <ShieldCheck className="w-3 h-3 inline mr-2" /> 
                                                Tu acceso está vinculado a tu matrícula institucional. Mantén tus credenciales seguras para proteger tu avance académico.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                             <div className="bg-gradient-to-br from-[#0f172a] to-slate-950 border border-slate-800 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-8 relative z-10 flex items-center">
                                         <GraduationCap className="w-4 h-4 mr-2" /> Avance de Carrera
                                     </h4>
                                      <div className="relative z-10 flex flex-col items-center">
                                          <CircularProgress 
                                            value={attendancePct} 
                                            label="Asistencia"
                                          />
                                          <div className="mt-8 w-full space-y-4">
                                              <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Académica</span>
                                                  <span className="text-xs font-black text-white">{academic.data?.length === 1 ? '1 Programa' : `${academic.data?.length} Programas`}</span>
                                              </div>
                                              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                                  <div className="flex items-center space-x-3">
                                                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                          <Check className="w-4 h-4" />
                                                      </div>
                                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Módulos Completados</p>
                                                  </div>
                                                  <span className="text-xl font-black text-white">{Object.keys(gradesByModule).length}</span>
                                              </div>
                                          </div>
                                      </div>
                                 </div>

                                 {/* Badges Section */}
                                 <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex items-center">
                                        <Trophy className="w-4 h-4 mr-2" /> Logros Obtenidos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {attendancePct >= 90 && (
                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col items-center text-center group/badge">
                                                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-2 group-hover/badge:scale-110 transition-transform">
                                                    <UserCheck className="w-5 h-5" />
                                                </div>
                                                <span className="text-[9px] font-black text-white uppercase leading-tight">Asistencia Perfecta</span>
                                            </div>
                                        )}
                                        {Number(avgGrade) >= 90 && (
                                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col items-center text-center group/badge">
                                                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-2 group-hover/badge:scale-110 transition-transform">
                                                    <Trophy className="w-5 h-5" />
                                                </div>
                                                <span className="text-[9px] font-black text-white uppercase leading-tight">Excelencia Académica</span>
                                            </div>
                                        )}
                                        {Object.keys(gradesByModule).length >= 1 && (
                                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex flex-col items-center text-center group/badge">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 mb-2 group-hover/badge:scale-110 transition-transform">
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <span className="text-[9px] font-black text-white uppercase leading-tight">Primer Paso</span>
                                            </div>
                                        )}
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'LIBRARY' ? (
                    <LibraryDashboard />
                ) : viewMode === 'CALENDAR' ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <GlobalCalendar isAdmin={false} />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase text-white tracking-[0.2em] flex items-center">
                                <Trophy className="w-6 h-6 mr-3 text-amber-500" />
                                Mis Diplomas & Certificados
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {diplomas.data?.map((diploma: any) => (
                                <div key={diploma.id} className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-2 hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                                    <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                                        <Trophy className="w-48 h-48 text-blue-400 rotate-12" />
                                    </div>
                                    
                                    <div className="relative z-10 space-y-6">
                                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <Trophy className="w-8 h-8" />
                                        </div>
                                        
                                        <div>
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Título Obtenido</p>
                                            <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{diploma.course_name}</h4>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800/50">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Emitido el {new Date(diploma.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            
                                            <button 
                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/diplomas/${diploma.id}/pdf`, '_blank')}
                                                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-500 hover:text-white hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform active:scale-95"
                                            >
                                                Descargar Diploma
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(diplomas.data?.length === 0 || !diplomas.data) && (
                                <div className="col-span-full py-24 text-center bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-800">
                                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Trophy className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Aún no tienes diplomas disponibles</h4>
                                    <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase">Se generarán automáticamente al completar tus pagos de graduación.</p>
                                </div>
                            )}
                        </div>
                    </div>
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
                                    <button 
                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/billing/invoices/${selectedInvoice.id}/pdf`, '_blank')}
                                        className="mt-4 flex items-center justify-end w-full text-blue-500 hover:text-blue-400 font-black uppercase text-[9px] tracking-[0.2em] transition-colors"
                                    >
                                        <Download className="w-3 h-3 mr-2" /> Descargar PDF
                                    </button>
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
