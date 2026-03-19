import { useState } from 'react';
import { useCohortStudents, useAttendance, useRegisterAttendance, useCohortModules } from '../../hooks/useAcademic.ts';
import { Check, X, Clock, Save, ArrowLeft, Calendar as CalendarIcon, Users, BookOpen, ExternalLink, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StudentHistoryModal } from './StudentHistoryModal';

interface AttendanceManagerProps {
    cohortId: string;
    programId?: string;
    onBack?: () => void;
    initialModuleId?: string;
    availableModules?: any[];
}

export function AttendanceManager({ cohortId, onBack, initialModuleId, availableModules }: AttendanceManagerProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId || '');
    const [records, setRecords] = useState<Record<string, { status: string; remarks: string }>>({});
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, studentId: string, studentName: string }>({
        isOpen: false,
        studentId: '',
        studentName: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    const { data: students, isLoading: loadingStudents } = useCohortStudents(cohortId);
    const { data: cohortModules, isLoading: loadingModules } = useCohortModules(cohortId);

    const modules = availableModules || cohortModules;
    useAttendance(cohortId, selectedModuleId, selectedDate);
    const registerMutation = useRegisterAttendance();

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

    const markAllPresent = () => {
        const newRecords = { ...records };
        displayStudents.forEach(s => {
            newRecords[s.id] = { ...newRecords[s.id], status: 'PRESENT' };
        });
        setRecords(newRecords);
        toast.success('Todos marcados como Presente');
    };

    const stats = {
        present: displayStudents.filter(s => (records[s.id]?.status || 'PRESENT') === 'PRESENT').length,
        late: displayStudents.filter(s => records[s.id]?.status === 'LATE').length,
        absent: displayStudents.filter(s => records[s.id]?.status === 'ABSENT').length
    };

    const filteredStudents = displayStudents.filter(s => 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-blue-500" />
                                <h3 className="font-black text-white uppercase tracking-wider text-sm flex items-center">
                                    Lista de Estudiantes 
                                    <span className="ml-2 px-2 py-0.5 bg-blue-600/10 text-blue-500 rounded-lg text-[10px]">{displayStudents.length}</span>
                                </h3>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={markAllPresent}
                                    className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Marcar todos Presente
                                </button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                                    <input 
                                        type="text"
                                        placeholder="Buscar estudiante..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presentes: <span className="text-white">{stats.present}</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tardanzas: <span className="text-white">{stats.late}</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ausentes: <span className="text-white">{stats.absent}</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {filteredStudents.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-slate-500 text-sm font-bold">No se encontraron estudiantes con ese nombre.</p>
                            </div>
                        ) : (
                            filteredStudents.map((student) => {
                                const currentStatus = records[student.id]?.status || 'PRESENT';
                                return (
                                    <div key={student.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600 shadow-lg">
                                                <span className="text-xs font-black text-white italic">{student.first_name[0]}{student.last_name[0]}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-bold text-white text-sm tracking-tight">{student.last_name}, {student.first_name}</p>
                                                    <button 
                                                        onClick={() => setHistoryModal({ 
                                                            isOpen: true, 
                                                            studentId: student.id, 
                                                            studentName: `${student.first_name} ${student.last_name}` 
                                                        })}
                                                        className="p-1.5 hover:bg-indigo-600/20 rounded-lg transition-all text-indigo-400 border border-indigo-500/10"
                                                        title="Ver Historial Completo"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase opacity-60">{student.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                    className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${currentStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
                                                >
                                                    <Check className="w-4 h-4" />
                                                    {currentStatus === 'PRESENT' && <span className="text-[8px] font-black uppercase tracking-widest">Presente</span>}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'LATE')}
                                                    className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${currentStatus === 'LATE' ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    {currentStatus === 'LATE' && <span className="text-[8px] font-black uppercase tracking-widest">Tarde</span>}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                    className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${currentStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                    {currentStatus === 'ABSENT' && <span className="text-[8px] font-black uppercase tracking-widest">Ausente</span>}
                                                </button>
                                            </div>
                                            <div className="relative w-full md:w-64">
                                                <Save className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                                                <input
                                                    type="text"
                                                    placeholder="Observaciones de la sesión..."
                                                    value={records[student.id]?.remarks || ''}
                                                    onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 w-full transition-all placeholder:text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-8 bg-slate-900/80 border-t border-slate-800 flex justify-end items-center space-x-6 sticky bottom-0 backdrop-blur-md">
                        <div className="hidden lg:flex items-center space-x-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-500 uppercase">Confirmación Final</span>
                                <span className="text-xs font-bold text-white">Verificar antes de guardar</span>
                             </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={registerMutation.isPending}
                            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-2xl shadow-blue-900/40 group"
                        >
                            {registerMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            )}
                            <span>{registerMutation.isPending ? 'Guardando Registro...' : 'Guardar Todas las Asistencias'}</span>
                        </button>
                    </div>
                </div>
            )}
            <StudentHistoryModal 
                isOpen={historyModal.isOpen}
                onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
                studentId={historyModal.studentId}
                studentName={historyModal.studentName}
            />
        </div>
    );
}
