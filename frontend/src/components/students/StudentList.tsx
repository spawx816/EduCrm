import { useState, useEffect } from 'react';
import { useStudents } from '../../hooks/useStudents.ts';
import { useSedes } from '../../hooks/useAcademic.ts';
import { Mail, Phone, BadgeCheck, Users, User, GraduationCap, Search, Filter, X, MapPin } from 'lucide-react';
import { EmptyState } from '../shared/EmptyState.tsx';
import { EnrollStudentModal } from './EnrollStudentModal.tsx';
import { RegisterStudentModal } from './RegisterStudentModal.tsx';

export function StudentList({ onSelectStudent }: { onSelectStudent: (id: string) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sedeFilter, setSedeFilter] = useState('');

    const { data: sedes } = useSedes();

    const { data: students, isLoading } = useStudents({
        search: debouncedSearch,
        status: statusFilter,
        sede_id: sedeFilter
    });

    const [enrollingStudent, setEnrollingStudent] = useState<{ id: string, name: string } | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl shadow-black/20">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Directorio Estudiantil</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Gestiona y matricula a tus estudiantes</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50"
                >
                    <User className="w-4 h-4" />
                    <span>Registrar Estudiante</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl shadow-black/20">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o matrícula..."
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

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="relative w-full md:w-48 shrink-0">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                        <select
                            value={sedeFilter}
                            onChange={(e) => setSedeFilter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-white appearance-none focus:border-blue-500 outline-none cursor-pointer"
                        >
                            <option value="">Todas las Sedes</option>
                            {Array.isArray(sedes) && sedes.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative w-full md:w-48 shrink-0">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-white appearance-none focus:border-blue-500 outline-none cursor-pointer"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="ACTIVE">Activos</option>
                            <option value="INACTIVE">Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden text-xs">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-ping absolute"></div>
                            <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Sincronizando Base de Datos...</p>
                    </div>
                ) : Array.isArray(students) && students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
                            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 md:px-6 py-4">Estudiante</th>
                                    <th className="px-4 md:px-6 py-4">Contacto</th>
                                    <th className="px-4 md:px-6 py-4">Estado</th>
                                    <th className="px-4 md:px-6 py-4">Acciones</th>
                                    <th className="px-4 md:px-6 py-4 text-right">Registrado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {Array.isArray(students) && students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-slate-800/30 transition-colors group"
                                    >
                                        <td className="px-4 md:px-6 py-4 cursor-pointer" onClick={() => onSelectStudent(student.id)}>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-800 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {student.first_name[0]}{student.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium truncate max-w-[120px] md:max-w-none group-hover:text-blue-400 transition-colors">
                                                        {student.first_name} {student.last_name}
                                                    </div>
                                                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                                                        ID: {student.matricula}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-xs">
                                                    <Mail className="w-3 h-3 mr-2 text-slate-500 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{student.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    <Phone className="w-3 h-3 mr-2 text-slate-500 shrink-0" />
                                                    <span>{student.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${student.status === 'ACTIVE'
                                                ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/50'
                                                : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => onSelectStudent(student.id)}
                                                    className="flex items-center text-blue-400 hover:text-blue-300 text-[10px] font-black underline underline-offset-4 tracking-tight uppercase transition-all"
                                                >
                                                    <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                                                    Perfil 360°
                                                </button>
                                                <button
                                                    onClick={() => setEnrollingStudent({ id: student.id, name: `${student.first_name} ${student.last_name}` })}
                                                    className="flex items-center text-emerald-400 hover:text-emerald-300 text-[10px] font-black underline underline-offset-4 tracking-tight uppercase transition-all"
                                                >
                                                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                                                    Inscribir
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-slate-500 text-[10px] whitespace-nowrap text-right font-mono uppercase">
                                            {new Date(student.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={Users}
                        title="No hay estudiantes"
                        description="Aún no tienes estudiantes registrados en el sistema."
                    />
                )}

                {enrollingStudent && (
                    <EnrollStudentModal
                        studentId={enrollingStudent.id}
                        studentName={enrollingStudent.name}
                        onClose={() => setEnrollingStudent(null)}
                    />
                )}

                <RegisterStudentModal
                    isOpen={isRegisterModalOpen}
                    onClose={() => setIsRegisterModalOpen(false)}
                />
            </div>
        </div>
    );
}
