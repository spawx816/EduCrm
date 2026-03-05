import { useStudentHistory } from '../../hooks/useStudents';
import {
    BookOpen, GraduationCap, Clock,
    Trophy, AlertCircle, ChevronRight
} from 'lucide-react';

interface StudentAcademicHistoryProps {
    studentId: string;
}

export function StudentAcademicHistory({ studentId }: StudentAcademicHistoryProps) {
    const { data: history, isLoading } = useStudentHistory(studentId);

    if (isLoading) {
        return (
            <div className="p-12 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest text-[10px]">
                Consolidando rastro académico...
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No se encontraron registros académicos para este estudiante.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {history.map((enrollment: any) => (
                <div key={enrollment.id} className="space-y-6">
                    {/* Enrollment Header */}
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/5">
                            <GraduationCap className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">{enrollment.program_name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{enrollment.cohort_name}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${enrollment.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-500'}`}>{enrollment.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Modules Timeline */}
                    <div className="relative pl-6 space-y-4">
                        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-slate-800/60"></div>

                        {enrollment.modules?.map((module: any, idx: number) => {
                            const attendanceCount = module.attendance?.length || 0;
                            const presentCount = (Array.isArray(module.attendance) ? module.attendance : []).filter((a: any) => a.status === 'PRESENT').length || 0;
                            const attendanceRate = attendanceCount > 0 ? (presentCount / attendanceCount) * 100 : 0;

                            const averageGrade = module.grades?.length > 0
                                ? (module.grades.reduce((acc: number, g: any) => acc + parseFloat(g.value), 0) / module.grades.length).toFixed(1)
                                : null;

                            return (
                                <div key={module.id} className="relative group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[30px] top-4 w-3 h-3 rounded-full border-2 transition-all group-hover:scale-125 z-10 ${averageGrade && parseFloat(averageGrade) >= 3 ? 'bg-emerald-500 border-emerald-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-slate-700'}`}></div>

                                    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/40 transition-all shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center space-x-2 text-slate-500">
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic opacity-50">#0{idx + 1}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Módulo Académico</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{module.name}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-1 italic">{module.description || 'Contenido académico en desarrollo...'}</p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 shrink-0">
                                                {/* Attendance Stat */}
                                                <div className="px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center min-w-[90px]">
                                                    <div className="flex items-center text-slate-600 mb-1">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Asistencia</span>
                                                    </div>
                                                    <p className={`text-sm font-black ${attendanceRate < 75 ? 'text-amber-500' : 'text-blue-400'}`}>
                                                        {attendanceRate.toFixed(0)}%
                                                    </p>
                                                </div>

                                                {/* Grade Stat */}
                                                <div className="px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center min-w-[90px]">
                                                    <div className="flex items-center text-slate-600 mb-1">
                                                        <Trophy className="w-3 h-3 mr-1" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Nota Final</span>
                                                    </div>
                                                    <p className={`text-sm font-black ${averageGrade && parseFloat(averageGrade) < 3.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        {averageGrade || '--'}
                                                    </p>
                                                </div>

                                                {/* Exams Stat */}
                                                <div className="px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center min-w-[90px] col-span-2 md:col-span-1">
                                                    <div className="flex items-center text-slate-600 mb-1">
                                                        <BookOpen className="w-3 h-3 mr-1" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Exámenes</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1.5 h-5">
                                                        {module.exams?.length > 0 ? (
                                                            module.exams.map((ex: any, i: number) => (
                                                                <div
                                                                    key={i}
                                                                    className={`w-2.5 h-2.5 rounded-full border ${ex.attempt_status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-900' : 'bg-slate-700 border-slate-600'}`}
                                                                    title={`${ex.exam_title}: ${ex.score || 'Pendiente'}`}
                                                                ></div>
                                                            ))
                                                        ) : (
                                                            <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">N/A</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Breakdown */}
                                        {(module.grades?.length > 0 || (module.exams && module.exams.some((ex: any) => ex.attempt_status === 'COMPLETED'))) && (
                                            <div className="mt-6 pt-5 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                                {module.grades.map((g: any) => (
                                                    <div key={g.id} className="group/item flex flex-col px-3 py-2 bg-slate-950/30 rounded-xl border border-slate-800/40 hover:border-slate-700 transition-colors">
                                                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.15em] mb-1 truncate">{g.grade_type_name}</span>
                                                        <span className={`text-xs font-black ${parseFloat(g.value) < 3.5 ? 'text-rose-500' : 'text-slate-300'}`}>{g.value}</span>
                                                    </div>
                                                ))}
                                                {(Array.isArray(module.exams) ? module.exams : []).filter((ex: any) => ex.attempt_status === 'COMPLETED').map((ex: any, idx: number) => (
                                                    <div key={idx} className="flex flex-col px-3 py-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                                        <span className="text-[8px] text-blue-500/60 uppercase font-black tracking-[0.15em] mb-1 truncate">Examen: {ex.exam_title}</span>
                                                        <span className="text-xs font-black text-blue-400">{ex.score}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
