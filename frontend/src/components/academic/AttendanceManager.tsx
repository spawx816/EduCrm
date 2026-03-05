import { useState } from 'react';
import { useCohortStudents, useAttendance, useRegisterAttendance, useCohortModules } from '../../hooks/useAcademic.ts';
import { Check, X, Clock, Save, ArrowLeft, Calendar as CalendarIcon, Users, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AttendanceManagerProps {
    cohortId: string;
    programId?: string;
    onBack?: () => void;
    initialModuleId?: string;
}

export function AttendanceManager({ cohortId, onBack, initialModuleId }: AttendanceManagerProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId || '');
    const [records, setRecords] = useState<Record<string, { status: string; remarks: string }>>({});

    const { data: students, isLoading: loadingStudents } = useCohortStudents(cohortId);
    const { data: modules, isLoading: loadingModules } = useCohortModules(cohortId);
    useAttendance(cohortId, selectedModuleId, selectedDate);
    const registerMutation = useRegisterAttendance();

    // Initialize/Update records when students or existing attendance data changes
    const displayStudents: any[] = students || [];

    const handleStatusChange = (studentId: string, status: string) => {
        setRecords(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarkChange = (studentId: string, remarks: string) => {
        setRecords(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleSave = async () => {
        if (!selectedModuleId) {
            toast.error('Debes seleccionar un módulo');
            return;
        }

        const attendanceData = displayStudents.map(s => ({
            student_id: s.id,
            status: records[s.id]?.status || 'PRESENT',
            remarks: records[s.id]?.remarks || ''
        }));

        try {
            await registerMutation.mutateAsync({
                cohort_id: cohortId,
                module_id: selectedModuleId,
                date: selectedDate,
                records: attendanceData
            });
            toast.success('Asistencia guardada correctamente');
        } catch (error) {
            toast.error('Error al guardar asistencia');
        }
    };

    if (loadingStudents || loadingModules) return <div className="p-8 text-center text-blue-500 animate-pulse font-black uppercase tracking-widest">Cargando datos del grupo...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl transition-all group">
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-indigo-500" />
                            Control de Asistencia
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Registro diario por módulo</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" /> Fecha de Clase
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" /> Módulo Académico
                    </label>
                    <select
                        value={selectedModuleId}
                        onChange={(e) => setSelectedModuleId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">Selecciona un módulo...</option>
                        {Array.isArray(modules) && modules.map((m: any) => (
                            <option key={m.module_id} value={m.module_id}>
                                {m.module_name} {m.teacher_first_name ? `(${m.teacher_first_name})` : '(Sin docente)'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedModuleId ? (
                <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center">
                    <BookOpen className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-500 text-sm font-bold">Selecciona un módulo para comenzar el pase de lista</p>
                </div>
            ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-blue-500" />
                            <h3 className="font-black text-white uppercase tracking-wider text-sm">Lista de Estudiantes ({displayStudents.length})</h3>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        {displayStudents.map((student) => {
                            const currentStatus = records[student.id]?.status || 'PRESENT';
                            return (
                                <div key={student.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                                            <span className="text-xs font-black text-white">{student.first_name[0]}{student.last_name[0]}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{student.last_name}, {student.first_name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{student.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                className={`p-2 rounded-lg transition-all ${currentStatus === 'PRESENT' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'LATE')}
                                                className={`p-2 rounded-lg transition-all ${currentStatus === 'LATE' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                <Clock className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                className={`p-2 rounded-lg transition-all ${currentStatus === 'ABSENT' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Observaciones..."
                                            value={records[student.id]?.remarks || ''}
                                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full md:w-48 transition-all"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-8 bg-slate-900/50 border-t border-slate-800 flex justify-center">
                        <button
                            onClick={handleSave}
                            disabled={registerMutation.isPending}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 disabled:opacity-50 shadow-xl shadow-blue-600/20"
                        >
                            {registerMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{registerMutation.isPending ? 'Guardando...' : 'Guardar Asistencia del Módulo'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
