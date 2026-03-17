import { useCohortStudents, useCohortAllGrades } from '../../hooks/useAcademic.ts';
import { ArrowLeft, AlertCircle, CheckCircle, TrendingUp, Search } from 'lucide-react';
import { useState } from 'react';

interface CohortGradesReportProps {
    cohortId: string;
    programId: string;
    onBack: () => void;
}

export function CohortGradesReport({ cohortId, onBack }: CohortGradesReportProps) {
    const { data: students, isLoading: loadingStudents } = useCohortStudents(cohortId);
    const { data: allGrades, isLoading: loadingGrades } = useCohortAllGrades(cohortId);
    const [searchTerm, setSearchTerm] = useState('');

    if (loadingStudents || loadingGrades) {
        return (
            <div className="p-20 text-center text-amber-500 font-black animate-pulse uppercase tracking-[0.3em]">
                Generando Reporte de Rendimiento...
            </div>
        );
    }

    const filteredStudents = (students || []).filter((s: any) => 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group grades by student
    const studentStats = filteredStudents.map((student: any) => {
        const studentGrades = (allGrades || []).filter((g: any) => g.student_id === student.id);
        
        // Calculate points based on weight logic (weight > 1 = points directly)
        let totalEarned = 0;
        
        studentGrades.forEach((g: any) => {
            const weight = parseFloat(g.weight) || 0;
            const val = parseFloat(g.value) || 0;
            
            if (weight > 1) {
                totalEarned += val;
            } else if (weight > 0) {
                totalEarned += (val * weight);
            }
        });

        // Heuristic for passing: 70 points
        const isPassing = totalEarned >= 70;
        
        return {
            ...student,
            totalEarned,
            isPassing,
            gradesCount: studentGrades.length
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center uppercase">
                            <TrendingUp className="w-8 h-8 mr-4 text-indigo-500" />
                            Reporte Académico General
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Visión consolidada de calificaciones y aprobación</p>
                    </div>
                </div>

                <div className="relative group w-full md:w-80">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar estudiante o matrícula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                    />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Estudiantes</p>
                    <p className="text-2xl font-black text-white">{studentStats.length}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Superan los 70 pts</p>
                    <p className="text-2xl font-black text-emerald-400">{studentStats.filter((s: any) => s.isPassing).length}</p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Bajo el promedio (fail)</p>
                    <p className="text-2xl font-black text-rose-400">{studentStats.filter((s: any) => !s.isPassing).length}</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">% de Aprobación</p>
                    <p className="text-2xl font-black text-white">
                        {studentStats.length > 0 ? Math.round((studentStats.filter((s: any) => s.isPassing).length / studentStats.length) * 100) : 0}%
                    </p>
                </div>
            </div>

            {/* Main Table View */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-6">Estudiante</th>
                                <th className="px-8 py-6">Matrícula</th>
                                <th className="px-8 py-6 text-center">Actividades</th>
                                <th className="px-8 py-6 text-right">Puntos Totales</th>
                                <th className="px-8 py-6">Estatus Final</th>
                                <th className="px-8 py-6">Recomendación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {studentStats.map((student: any) => (
                                <tr key={student.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-xs text-white group-hover:border-indigo-500 transition-colors">
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-white">{student.last_name}, {student.first_name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white">{student.matricula}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                            {student.gradesCount} reg.
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`text-xl font-black ${student.isPassing ? 'text-emerald-400' : 'text-rose-400 italic'}`}>
                                            {student.totalEarned.toFixed(1)} <span className="text-[10px] opacity-40">/ 100</span>
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        {student.isPassing ? (
                                            <div className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                                <CheckCircle className="w-3 h-3 mr-1.5" /> Aprobado
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-500/20">
                                                <AlertCircle className="w-3 h-3 mr-1.5" /> Deficiente
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {!student.isPassing ? (
                                            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                                <p className="text-[9px] font-black text-amber-500 uppercase leading-none mb-1">Acción Requerida</p>
                                                <p className="text-[10px] font-bold text-slate-300">Programar Recuperación</p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 font-bold uppercase italic">Sin observaciones</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
