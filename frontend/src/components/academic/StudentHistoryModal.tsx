import { useStudentHistory } from '../../hooks/useStudents';
import { X, Trophy, Clock, BookOpen, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface StudentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

export function StudentHistoryModal({ isOpen, onClose, studentId, studentName }: StudentHistoryModalProps) {
    const { data: history, isLoading } = useStudentHistory(studentId);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                            <BookOpen className="w-6 h-6 mr-3 text-indigo-500" />
                            Historial Académico
                        </h2>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{studentName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {isLoading ? (
                        <div className="p-20 text-center text-indigo-500 font-black animate-pulse uppercase tracking-widest">
                            Recuperando historial académico...
                        </div>
                    ) : history?.length === 0 ? (
                        <div className="p-12 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-[2rem]">
                            <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay datos académicos registrados</p>
                        </div>
                    ) : (
                        history?.map((enrollment: any) => (
                            <div key={enrollment.id} className="space-y-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="h-px flex-1 bg-slate-800"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{enrollment.program_name} - {enrollment.cohort_name}</span>
                                    <div className="h-px flex-1 bg-slate-800"></div>
                                </div>

                                <div className="grid gap-4">
                                    {enrollment.modules?.map((module: any) => {
                                        const isExpanded = expandedModule === `${enrollment.id}-${module.id}`;
                                        const validGrades = module.grades.filter((g: any) => g.value !== null);
                                         let earnedPoints = 0;
                                        let totalWeight = 0;
                                        let hasGrades = false;

                                        validGrades.forEach((g: any) => {
                                            const weight = parseFloat(g.weight) || 0;
                                            const value = parseFloat(g.value) || 0;
                                            if (weight > 0) {
                                                if (weight > 1) { // Points-based system (e.g., 100 points total)
                                                    earnedPoints += value;
                                                    totalWeight += weight; // Sum of max points for each grade
                                                } else { // Percentage-based system (e.g., 0.2 for 20%)
                                                    earnedPoints += value * weight;
                                                    totalWeight += weight; // Sum of weights for weighted average
                                                }
                                                hasGrades = true;
                                            }
                                        });

                                        let avgGrade = null;
                                        let isPoints = false;

                                        if (hasGrades) {
                                            if (totalWeight > 1.1) { // Heuristic: if totalWeight is significantly > 1, assume points system
                                                avgGrade = (earnedPoints / totalWeight * 100).toFixed(1); // Convert to percentage
                                                isPoints = true;
                                            } else if (totalWeight > 0) { // Weighted average for percentage system
                                                avgGrade = (earnedPoints / totalWeight).toFixed(1);
                                            } else if (validGrades.length > 0) { // Simple average if no weights or weights sum to 0
                                                avgGrade = (validGrades.reduce((acc: number, g: any) => acc + parseFloat(g.value), 0) / validGrades.length).toFixed(1);
                                            }
                                        }
                                        
                                        const presentCount = module.attendance.filter((a: any) => a.status === 'PRESENT').length;
                                        const totalAttendance = module.attendance.length;
                                        const attendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : null;

                                        return (
                                            <div key={module.id} className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden transition-all hover:border-slate-700">
                                                <div 
                                                    onClick={() => setExpandedModule(isExpanded ? null : `${enrollment.id}-${module.id}`)}
                                                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.01]"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm">{module.name}</h4>
                                                            <div className="flex items-center space-x-3 mt-1">
                                                                {avgGrade && (
                                                                    <span className={`text-[9px] font-black uppercase ${parseFloat(avgGrade) >= (isPoints ? 70 : 3.5) ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-2 py-0.5 rounded-md flex items-center`}>
                                                                        <Trophy className="w-3 h-3 mr-1" /> {isPoints ? 'Puntos' : 'Nota'}: {avgGrade}{isPoints ? '%' : ''}
                                                                    </span>
                                                                )}
                                                                {attendancePct !== null && (
                                                                    <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" /> Asist: {attendancePct}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                                                </div>

                                                {isExpanded && (
                                                    <div className="p-6 pt-0 border-t border-slate-800 bg-white/[0.01] animate-in slide-in-from-top-2 duration-300">
                                                        <div className="grid md:grid-cols-2 gap-8 mt-6">
                                                            {/* Grades Detail */}
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                                                    <Trophy className="w-3 h-3 mr-2 text-amber-500" /> Calificaciones Detalladas
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {module.grades.length > 0 ? module.grades.map((grade: any) => (
                                                                        <div key={grade.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                                                                            <div>
                                                                                <p className="text-[10px] font-bold text-white uppercase tracking-tight">{grade.grade_type_name}</p>
                                                                                {grade.remarks && <p className="text-[9px] text-slate-600 mt-0.5 italic">{grade.remarks}</p>}
                                                                            </div>
                                                                            <span className={`text-sm font-black ${parseFloat(grade.value) >= 3 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                                {grade.value}
                                                                            </span>
                                                                        </div>
                                                                    )) : (
                                                                        <p className="text-[10px] text-slate-700 italic">No hay calificaciones</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Attendance Detail */}
                                                            <div>
                                                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                                                    <Clock className="w-3 h-3 mr-2 text-blue-500" /> Registro de Asistencia
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {module.attendance.length > 0 ? module.attendance.map((att: any) => (
                                                                        <div key={att.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                                {new Date(att.date).toLocaleDateString()}
                                                                            </span>
                                                                            <div className="flex items-center space-x-2">
                                                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                                    att.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                                                    att.status === 'LATE' ? 'bg-amber-500/10 text-amber-500' : 
                                                                                    'bg-rose-500/10 text-rose-500'
                                                                                }`}>
                                                                                    {att.status === 'PRESENT' ? 'Presente' : att.status === 'LATE' ? 'Tarde' : 'Ausente'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )) : (
                                                                        <p className="text-[10px] text-slate-700 italic">No hay registros</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                    >
                        Cerrar Historial
                    </button>
                </div>
            </div>
        </div>
    );
}
