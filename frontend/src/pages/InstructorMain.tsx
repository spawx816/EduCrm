import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useInstructorCohorts } from '../hooks/useInstructor';
import { GraduationCap, Users, Clock, ChevronRight, LogOut, Layout, Wallet, Hash, User, Mail, Phone, MapPin, Download, Edit2, Save, Check, ShieldCheck, UserCircle, TrendingUp } from 'lucide-react';
import { InstructorCohortDetail } from '../components/academic/InstructorCohortDetail.tsx';
import { useInstructorPayments } from '../hooks/useBilling.ts';
import { toast } from 'react-hot-toast';

export function InstructorMain() {
    const { user, logout, updateProfile } = useAuth();
    const { data: cohorts, isLoading } = useInstructorCohorts(user?.id);
    const [selectedCohort, setSelectedCohort] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'COHORTS' | 'PAYMENTS' | 'PROFILE'>('COHORTS');
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState<any>({});

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
                        <div className="flex items-center bg-slate-800/30 p-1.5 rounded-2xl border border-slate-700/50 mr-4">
                            <button
                                onClick={() => setViewMode('COHORTS')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'COHORTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                Académico
                            </button>
                            <button
                                onClick={() => setViewMode('PAYMENTS')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'PAYMENTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                Pagos
                            </button>
                            <button
                                onClick={() => {
                                    setViewMode('PROFILE');
                                    setProfileForm({
                                        first_name: user?.firstName || user?.first_name,
                                        last_name: user?.lastName || user?.last_name,
                                        phone: user?.phone,
                                        address: user?.address
                                    });
                                }}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewMode === 'PROFILE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                Mi Perfil
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
                ) : viewMode === 'PAYMENTS' ? (
                    <InstructorPaymentsView teacherId={user?.id} />
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                        {/* Header Profile */}
                        <div className="bg-gradient-to-r from-indigo-900/30 via-slate-900 to-blue-900/30 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                               <ShieldCheck className="w-64 h-64 text-indigo-400" />
                           </div>
                           
                           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-slate-800 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-700 group-hover:border-indigo-500/50 transition-colors shadow-2xl shadow-black/50 overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle className="w-16 h-16 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 border-4 border-[#020617] rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                                        <Check className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">{user?.firstName || user?.first_name} {user?.lastName || user?.last_name}</h2>
                                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                                <div className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                                                    ID: {user?.id?.slice(0, 8)}
                                                </div>
                                                <div className="bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                                                    Estatus: ACTIVO
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setEditMode(!editMode)}
                                            className="mt-6 md:mt-0 px-6 py-3 bg-slate-800 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center border border-slate-700 hover:border-indigo-400 group/btn shadow-xl"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                                            {editMode ? 'Cancelar Edición' : 'Editar Mi Perfil'}
                                        </button>
                                    </div>
                                </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900/60 border border-slate-800 p-10 rounded-[3rem] shadow-xl group">
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Información de docente
                                </h4>
                                
                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Nombre</label>
                                            <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] focus-within:border-indigo-500/50 transition-all">
                                                <input 
                                                    type="text"
                                                    disabled={!editMode}
                                                    value={profileForm.first_name || ''}
                                                    onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                    className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 px-3"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Apellido</label>
                                            <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] focus-within:border-indigo-500/50 transition-all">
                                                <input 
                                                    type="text"
                                                    disabled={!editMode}
                                                    value={profileForm.last_name || ''}
                                                    onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                    className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 px-3"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Teléfono / Celular</label>
                                        <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] flex items-center px-4 focus-within:border-emerald-500/50 transition-all">
                                            <Phone className="w-4 h-4 text-emerald-500 mr-4" />
                                            <input 
                                                type="text"
                                                disabled={!editMode}
                                                value={profileForm.phone || ''}
                                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0"
                                                placeholder="Tu número de contacto"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Dirección de Vivienda</label>
                                        <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-[1.5rem] flex items-center px-4 focus-within:border-blue-500/50 transition-all">
                                            <MapPin className="w-4 h-4 text-blue-500 mr-4" />
                                            <textarea 
                                                disabled={!editMode}
                                                rows={1}
                                                value={profileForm.address || ''}
                                                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                                className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 resize-none pt-2"
                                                placeholder="Dirección física"
                                            />
                                        </div>
                                    </div>

                                    {editMode && (
                                        <button 
                                            type="submit"
                                            disabled={updateProfile.isPending}
                                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center space-x-3 active:scale-95"
                                        >
                                            {updateProfile.isPending ? 'Guardando...' : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Actualizar Información</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </form>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                                        <ShieldCheck className="w-4 h-4 mr-2" /> Seguridad & Cuenta
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between group-hover:bg-slate-950 transition-all">
                                            <div className="flex items-center space-x-4">
                                                <Mail className="w-5 h-5 text-indigo-500" />
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Correo Institucional</p>
                                                    <p className="text-xs font-bold text-white">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl">
                                            <p className="text-[10px] text-indigo-400 leading-relaxed font-bold uppercase tracking-wider">
                                                Como docente, tu cuenta tiene acceso a expedientes académicos confidenciales. Mantén tus credenciales seguras.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#0f172a] to-slate-950 border border-slate-800 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                     <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                                         <TrendingUp className="w-4 h-4 mr-2" /> Resumen de Actividad
                                     </h4>
                                     <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grupos Asignados</span>
                                            <span className="text-xl font-black text-white">{cohorts?.length || 0}</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[65%]" />
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                        <div className="flex items-center justify-end space-x-3">
                                            <span className="text-lg font-black text-emerald-400 tracking-tighter mr-4">RD${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            <button 
                                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/billing/instructor-payments/${payment.id}/pdf`, '_blank')}
                                                className="p-3 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-500/20"
                                                title="Descargar Comprobante"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
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
