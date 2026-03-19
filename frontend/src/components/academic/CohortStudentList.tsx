import { useState } from 'react';
import { useCohortStudents } from '../../hooks/useAcademic.ts';
import { Search, User, Mail, Phone, ArrowLeft, MoreVertical, BadgeCheck, FileText, X } from 'lucide-react';
import { EmptyState } from '../shared/EmptyState.tsx';

interface CohortStudentListProps {
    cohortId: string;
    cohortName: string;
    onBack: () => void;
}

export function CohortStudentList({ cohortId, cohortName, onBack }: CohortStudentListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: students, isLoading } = useCohortStudents(cohortId);

    const filteredStudents = Array.isArray(students) 
        ? students.filter((s: any) => 
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">{cohortName}</h2>
                        <div className="flex items-center space-x-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Listado de Estudiantes</p>
                        </div>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar en el grupo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all shadow-inner font-bold"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded-lg">
                            <X className="w-3 h-3 text-slate-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* List Table */}
            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="p-20 text-center space-y-4">
                         <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Obteniendo matriculados...</p>
                    </div>
                ) : filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/30 text-slate-500 uppercase text-[9px] font-black tracking-[0.15em]">
                                <tr>
                                    <th className="px-8 py-5">Estudiante</th>
                                    <th className="px-6 py-5">Matrícula</th>
                                    <th className="px-6 py-5">Contacto</th>
                                    <th className="px-6 py-5">Inscripción</th>
                                    <th className="px-6 py-5">Estado</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredStudents.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/10 flex items-center justify-center text-blue-400 font-black shadow-lg">
                                                    {student.first_name[0]}{student.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{student.first_name} {student.last_name}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{student.document_id || 'SIN CÉDULA'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-black text-blue-500 tracking-wider">
                                                {student.matricula}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5 font-bold">
                                                <div className="flex items-center text-[10px] text-slate-400">
                                                    <Mail className="w-3 h-3 mr-2 text-slate-600" />
                                                    {student.email}
                                                </div>
                                                <div className="flex items-center text-[10px] text-slate-400">
                                                    <Phone className="w-3 h-3 mr-2 text-slate-600" />
                                                    {student.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                 {new Date(student.enrollment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                             </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                student.enrollment_status === 'ACTIVE' 
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                                            }`}>
                                                {student.enrollment_status === 'ACTIVE' ? 'ACTIVO' : student.enrollment_status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-xl" title="Ver Perfil 360°">
                                                    <BadgeCheck className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all" title="Ver Expediente">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24">
                        <EmptyState 
                            icon={User}
                            title="No hay estudiantes"
                            description={searchTerm ? "No se encontraron estudiantes con ese nombre en este grupo." : "Este grupo aún no tiene estudiantes matriculados."}
                        />
                    </div>
                )}
            </div>

            {/* Footer with counts */}
            {!isLoading && filteredStudents.length > 0 && (
                <div className="flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <p>Mostrando {filteredStudents.length} de {students?.length} estudiantes</p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                            Activos: {filteredStudents.filter((s: any) => s.enrollment_status === 'ACTIVE').length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
