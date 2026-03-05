import { useState } from 'react';
import { useStudent, useUploadStudentAvatar } from '../hooks/useStudents';
import { useInvoices } from '../hooks/useBilling';
import {
    Mail, Phone, Calendar, BadgeCheck, Receipt,
    ArrowLeft, TrendingUp, Users, GraduationCap, BarChart3, Ticket, FolderKey,
    Camera, Loader2
} from 'lucide-react';
import { EnrollStudentModal } from '../components/students/EnrollStudentModal';
import { StudentAcademicHistory } from '../components/students/StudentAcademicHistory';
import { StudentAttachments } from '../components/students/StudentAttachments';
import { toast } from 'react-hot-toast';

interface StudentProfileProps {
    studentId: string;
    onBack: () => void;
}

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'academic' | 'billing' | 'docs'>('academic');
    const { data: student, isLoading: loadingStudent } = useStudent(studentId);
    const { data: invoices, isLoading: loadingInvoices } = useInvoices({ studentId });
    const uploadAvatarMutation = useUploadStudentAvatar();

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadAvatarMutation.mutateAsync({ studentId, file });
            toast.success('Foto de perfil actualizada');
        } catch (err) {
            toast.error('Error al actualizar foto');
        }
    };

    if (loadingStudent || loadingInvoices) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p>Cargando perfil 360°...</p>
            </div>
        );
    }

    if (!student) return null;

    const totalInvoiced = invoices?.reduce((acc: number, inv: any) => acc + parseFloat(inv.total_amount), 0) || 0;
    const totalPaid = invoices?.reduce((acc: number, inv: any) => acc + parseFloat(inv.paid_amount), 0) || 0;
    const balance = totalInvoiced - totalPaid;

    return (
        <div className="flex flex-col h-full bg-[#0a0f1e] overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full space-x-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Perfil 360° del Estudiante</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Resumen Académico y Financiero</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* 1. Header Card - Basic Info */}
                    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[100px] -z-10"></div>

                        {/* Avatar Section */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-blue-900/30 flex items-center justify-center overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-500/10 transition-all duration-300 relative">
                                {student.avatar_url ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/uploads/students/avatars/${student.avatar_url}`}
                                        alt={`${student.first_name} avatar`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-blue-400 text-4xl font-black">
                                        {student.first_name[0]}{student.last_name[0]}
                                    </span>
                                )}

                                {/* Overlay for upload */}
                                <label className="absolute inset-0 bg-blue-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadAvatarMutation.isPending}
                                    />
                                    {uploadAvatarMutation.isPending ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                                <h2 className="text-3xl font-bold text-white tracking-tight">{student.first_name} {student.last_name}</h2>
                                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                    <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
                                        ID: {student.matricula}
                                    </span>
                                    <span className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                        {student.status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 mt-4">
                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 mr-3 text-slate-500" />
                                    {student.email || 'Sin correo registrado'}
                                </div>
                                <div className="flex items-center text-sm">
                                    <Phone className="w-4 h-4 mr-3 text-slate-500" />
                                    {student.phone || 'Sin teléfono registrado'}
                                </div>
                                <div className="flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                                    Miembro desde: {new Date(student.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 2. Left Sidebar (Summary & Enrollments) */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Flujo Financiero</h3>
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-600 text-[9px] uppercase font-black tracking-widest mb-1">Total Facturado</p>
                                        <p className="text-2xl font-bold text-white">RD${totalInvoiced.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600 text-[9px] uppercase font-black tracking-widest mb-1">Monto Pagado</p>
                                        <p className="text-2xl font-bold text-emerald-400">RD${totalPaid.toLocaleString()}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800">
                                        <p className="text-slate-600 text-[9px] uppercase font-black tracking-widest mb-1">Saldo Pendiente</p>
                                        <p className={`text-3xl font-black ${balance > 0 ? 'text-amber-500' : 'text-slate-300'}`}>RD${balance.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Programs/Enrollments Sidebar */}
                            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Inscripciones</h3>
                                    <button
                                        onClick={() => setShowEnrollModal(true)}
                                        className="p-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                        title="Nueva Inscripción"
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {student.enrollments?.length ? (
                                    <div className="space-y-3">
                                        {student.enrollments.map((e: any) => (
                                            <div key={e.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-white text-xs font-bold truncate pr-2">{e.program_name || e.cohort_name || 'Programa'}</p>
                                                    <BadgeCheck className="w-3 h-3 text-blue-500 shrink-0" />
                                                </div>
                                                {e.scholarship_id && (
                                                    <div className="flex items-center space-x-1.5 mb-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
                                                        <Ticket className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                                            {e.scholarship_name}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{e.status}</p>
                                                    <p className="text-[9px] text-slate-600 font-bold">{new Date().getFullYear()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-6">
                                        <p className="text-xs text-slate-500 text-center mb-4 italic">No hay inscripciones registradas.</p>
                                        <button
                                            onClick={() => setShowEnrollModal(true)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 transition-all font-mono"
                                        >
                                            Inscribir Ahora
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {showEnrollModal && (
                            <EnrollStudentModal
                                studentId={student.id}
                                studentName={`${student.first_name} ${student.last_name}`}
                                onClose={() => setShowEnrollModal(false)}
                            />
                        )}

                        {/* 3. Main Content Area (Academic vs Billing) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tabs Navigation */}
                            <div className="flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl w-fit">
                                <button
                                    onClick={() => setActiveTab('academic')}
                                    className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'academic' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    Trayectoria Académica
                                </button>
                                <button
                                    onClick={() => setActiveTab('billing')}
                                    className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Historial Financiero
                                </button>
                                <button
                                    onClick={() => setActiveTab('docs')}
                                    className={`flex items-center px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <FolderKey className="w-4 h-4 mr-2" />
                                    Documentación
                                </button>
                            </div>

                            {activeTab === 'academic' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <StudentAcademicHistory studentId={studentId} />
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                        <h3 className="text-white font-black flex items-center text-[10px] uppercase tracking-[0.2em] text-slate-500">Relación de Facturas</h3>
                                        <Receipt className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                <tr>
                                                    <th className="px-6 py-4">Nº Factura</th>
                                                    <th className="px-6 py-4">Fecha de Emisión</th>
                                                    <th className="px-6 py-4 text-right">Monto Total</th>
                                                    <th className="px-6 py-4">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {Array.isArray(invoices) && invoices.map((invoice: any) => (
                                                    <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors group">
                                                        <td className="px-6 py-4 font-mono text-xs text-white group-hover:text-blue-400 transition-colors uppercase">{invoice.invoice_number}</td>
                                                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-right text-sm font-black group-hover:text-white transition-colors">RD${parseFloat(invoice.total_amount).toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${invoice.status === 'PAID' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/50' :
                                                                invoice.status === 'OVERDUE' ? 'bg-rose-900/20 text-rose-400 border border-rose-800/50' :
                                                                    'bg-amber-900/20 text-amber-500 border border-amber-800/50'
                                                                }`}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {!invoices?.length && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic text-xs font-bold uppercase tracking-widest">
                                                            No se han emitido facturas para este registro.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <StudentAttachments studentId={studentId} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
