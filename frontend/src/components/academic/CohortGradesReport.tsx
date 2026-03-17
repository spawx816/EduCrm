import { useCohortStudents, useCohortAllGrades, useCohortModules } from '../../hooks/useAcademic.ts';
import { ArrowLeft, AlertCircle, CheckCircle, TrendingUp, Search, BookOpen, User, Percent } from 'lucide-react';
import { useState, useMemo } from 'react';

interface CohortGradesReportProps {
    cohortId: string;
    programId: string;
    onBack: () => void;
}

export function CohortGradesReport({ cohortId, onBack }: CohortGradesReportProps) {
    const { data: students, isLoading: loadingStudents } = useCohortStudents(cohortId);
    const { data: allGrades, isLoading: loadingGrades } = useCohortAllGrades(cohortId);
    const { data: modules, isLoading: loadingModules } = useCohortModules(cohortId);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState<string>('all');

    const isLoading = loadingStudents || loadingGrades || loadingModules;

    const filteredStudents = useMemo(() => {
        return (students || []).filter((s: any) => 
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    // Calculate detailed stats
    const reportData = useMemo(() => {
        if (!students || !allGrades) return { studentStats: [], moduleStats: [], generalAvg: 0 };

        // 1. Calculate per-student stats
        const studentStats = filteredStudents.map((student: any) => {
            const studentGrades = (allGrades || []).filter((g: any) => {
                const matchStudent = g.student_id === student.id;
                const matchModule = selectedModuleId === 'all' || g.module_id === selectedModuleId;
                return matchStudent && matchModule;
            });
            
            let totalEarned = 0;
            let possiblePoints = 0;

            studentGrades.forEach((g: any) => {
                let weight = parseFloat(g.weight);
                const val = parseFloat(g.value) || 0;
                const name = (g.grade_type_name || '').toLowerCase();

                // FALLBACK LOGIC
                if (!weight || weight <= 1.0) {
                    if (name.includes('asistencia')) weight = 10;
                    else if (name.includes('careo')) weight = 25;
                    else if (name.includes('exposic')) weight = 25;
                    else if (name.includes('examen')) weight = 40;
                    else weight = weight || 0;
                }
                
                if (weight > 1) {
                    totalEarned += val;
                    possiblePoints += weight;
                } else if (weight > 0) {
                    totalEarned += (val * weight);
                    possiblePoints += (weight * 100);
                }
            });

            // If we are looking at all modules, we normalize to 100 for status, 
            // but for a single module we just show the points.
            const passingThreshold = selectedModuleId === 'all' ? 70 : (possiblePoints * 0.7);
            const isPassing = totalEarned >= passingThreshold && studentGrades.length > 0;
            
            return {
                ...student,
                totalEarned,
                isPassing,
                gradesCount: studentGrades.length,
                possiblePoints
            };
        });

        // 2. Calculate per-module stats (averages)
        const moduleStats = (modules || []).map((mod: any) => {
            const moduleId = mod.module_id || mod.id;
            const modGrades = (allGrades || []).filter((g: any) => g.module_id === moduleId);
            
            if (modGrades.length === 0) return { ...mod, avgPoints: 0, studentCount: 0 };

            // Group points by student in this module
            const studentTotals: Record<string, number> = {};
            modGrades.forEach((g: any) => {
                let weight = parseFloat(g.weight);
                const val = parseFloat(g.value) || 0;
                const name = (g.grade_type_name || '').toLowerCase();

                // FALLBACK LOGIC
                if (!weight || weight <= 1.0) {
                    if (name.includes('asistencia')) weight = 10;
                    else if (name.includes('careo')) weight = 25;
                    else if (name.includes('exposic')) weight = 25;
                    else if (name.includes('examen')) weight = 40;
                    else weight = weight || 0;
                }

                if (!studentTotals[g.student_id]) studentTotals[g.student_id] = 0;
                
                if (weight > 1) studentTotals[g.student_id] += val;
                else studentTotals[g.student_id] += (val * weight);
            });

            const totalsArray = Object.values(studentTotals);
            // Average = Sum of student totals in this module / Count of students who actually have grades in this module
            const avgPoints = totalsArray.reduce((a: number, b: number) => a + b, 0) / (totalsArray.length || 1);

            return {
                ...mod,
                avgPoints,
                studentCount: totalsArray.length
            };
        });

        // 3. General Average of the whole cohort (avg of students WHO HAVE grades)
        const gradedStudents = studentStats.filter((s: any) => s.gradesCount > 0);
        const totalPointsSum = gradedStudents.reduce((acc: number, s: any) => acc + s.totalEarned, 0);
        const generalAvg = gradedStudents.length > 0 ? (totalPointsSum / gradedStudents.length) : 0;

        return { studentStats, moduleStats, generalAvg };
    }, [students, allGrades, modules, filteredStudents, selectedModuleId]);

    if (isLoading) {
        return (
            <div className="p-20 text-center text-amber-500 font-black animate-pulse uppercase tracking-[0.3em]">
                Generando Reporte de Rendimiento...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group w-full sm:w-64">
                        <select 
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="block w-full pl-4 pr-10 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                        >
                            <option value="all">Todos los Módulos</option>
                            {(modules || []).map((m: any) => (
                                <option key={m.module_id} value={m.module_id}>{m.module_name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <BookOpen className="h-4 w-4 text-slate-600" />
                        </div>
                    </div>

                    <div className="relative group w-full sm:w-80">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* General Metrics & Module Averages */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Quick Stats */}
                <div className="xl:col-span-1 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Estudiantes</p>
                        <p className="text-3xl font-black text-white">{reportData.studentStats.length}</p>
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[2rem] backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Percent className="w-12 h-12 text-white" />
                        </div>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Promedio General</p>
                        <p className="text-3xl font-black text-white">{reportData.generalAvg.toFixed(1)}</p>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] backdrop-blur-sm">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">Tasa Aprobación</p>
                        <p className="text-2xl font-black text-emerald-400">
                            {reportData.studentStats.length > 0 ? Math.round((reportData.studentStats.filter((s: any) => s.isPassing).length / reportData.studentStats.length) * 100) : 0}%
                        </p>
                    </div>

                    <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-[2rem] backdrop-blur-sm">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Bajo el Promedio</p>
                        <p className="text-2xl font-black text-rose-400">{reportData.studentStats.filter((s: any) => !s.isPassing).length}</p>
                    </div>
                </div>

                {/* Right: Module Averages Breakdown */}
                <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                            Rendimiento por Módulo (Promedios)
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                        {reportData.moduleStats.map((mod: any) => (
                            <div key={mod.module_id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl hover:border-indigo-500/30 transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase truncate max-w-[150px]">{mod.module_name}</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter italic">{mod.studentCount} est. evaluados</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black ${mod.avgPoints >= 70 ? 'text-emerald-400' : 'text-amber-500'}`}>
                                        {mod.avgPoints.toFixed(1)}
                                    </p>
                                    <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${mod.avgPoints >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                            style={{ width: `${Math.min(mod.avgPoints, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Table View */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-6">Estudiante</th>
                                <th className="px-8 py-6">Matrícula</th>
                                <th className="px-8 py-6 text-center">Registros</th>
                                <th className="px-8 py-6 text-right">Puntos Acum.</th>
                                <th className="px-8 py-6">Estatus</th>
                                <th className="px-8 py-6">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {reportData.studentStats.map((student: any) => (
                                <tr key={student.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-xs text-white group-hover:border-indigo-500 transition-colors">
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-white group-hover:text-indigo-400 transition-colors">{student.last_name}, {student.first_name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white">{student.matricula}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest italic tracking-tighter">
                                            {student.gradesCount} notas
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`text-xl font-black ${student.isPassing ? 'text-emerald-400' : 'text-rose-400 italic'}`}>
                                            {student.totalEarned.toFixed(1)} 
                                            <span className="text-[10px] opacity-20 ml-1">/ {student.possiblePoints > 0 ? student.possiblePoints : 100}</span>
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
                                            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20">
                                                Recuperación
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 font-bold uppercase italic tracking-widest">Al día</span>
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
