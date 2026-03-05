import { useState } from 'react';
import { useCohortStudents, useGradeTypes, useGrades, useRegisterGrades, useCreateGradeType, useCohortModules } from '../../hooks/useAcademic.ts';
import { Save, ArrowLeft, Trophy, Plus, Users, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GradesManagerProps {
    cohortId: string;
    programId: string;
    onBack?: () => void;
    initialModuleId?: string;
}

export function GradesManager({ cohortId, programId, onBack, initialModuleId }: GradesManagerProps) {
    const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId || '');
    const [selectedGradeType, setSelectedGradeType] = useState<string>('');
    const [scores, setScores] = useState<Record<string, { value: number; remarks: string }>>({});
    const [isAddingType, setIsAddingType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');

    const { data: students, isLoading: loadingStudents } = useCohortStudents(cohortId);
    const { data: modules, isLoading: loadingModules } = useCohortModules(cohortId);
    const { data: gradeTypes } = useGradeTypes(programId, selectedModuleId);
    useGrades(cohortId, selectedModuleId);

    const createTypeMutation = useCreateGradeType();
    const registerMutation = useRegisterGrades();

    const handleScoreChange = (studentId: string, value: string) => {
        const numValue = parseFloat(value);
        setScores(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], value: isNaN(numValue) ? 0 : numValue }
        }));
    };

    const handleRemarkChange = (studentId: string, remarks: string) => {
        setScores(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleCreateType = async () => {
        if (!newTypeName || !selectedModuleId) return;
        try {
            await createTypeMutation.mutateAsync({
                program_id: programId,
                module_id: selectedModuleId,
                name: newTypeName,
                weight: 1.0
            });
            setNewTypeName('');
            setIsAddingType(false);
            toast.success('Tipo de evaluación creado');
        } catch (error) {
            toast.error('Error al crear evaluación');
        }
    };

    const handleSaveGrades = async () => {
        if (!selectedGradeType || !selectedModuleId) {
            toast.error('Selecciona módulo y tipo de evaluación');
            return;
        }

        const gradeData = students?.map((s: any) => ({
            student_id: s.id,
            value: scores[s.id]?.value || 0,
            remarks: scores[s.id]?.remarks || ''
        })) || [];

        try {
            await registerMutation.mutateAsync({
                cohort_id: cohortId,
                module_id: selectedModuleId,
                grade_type_id: selectedGradeType,
                records: gradeData
            });
            toast.success('Calificaciones registradas');
        } catch (error) {
            toast.error('Error al registrar notas');
        }
    };

    if (loadingStudents || loadingModules) return <div className="p-8 text-center text-amber-500 animate-pulse font-black uppercase tracking-widest">Cargando datos académicos...</div>;

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
                            <Trophy className="w-6 h-6 mr-3 text-amber-500" />
                            Gestión de Calificaciones
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Evaluación modular continua</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center">
                        <BookOpen className="w-3 h-3 mr-1" /> Módulo Académico
                    </label>
                    <select
                        value={selectedModuleId}
                        onChange={(e) => {
                            setSelectedModuleId(e.target.value);
                            setSelectedGradeType(''); // Reset grade type when module changes
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">Selecciona un módulo...</option>
                        {Array.isArray(modules) && modules.map((m: any) => (
                            <option key={m.module_id} value={m.module_id}>
                                {m.module_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center">
                        <Trophy className="w-3 h-3 mr-1" /> Tipo de Evaluación
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedGradeType}
                            onChange={(e) => setSelectedGradeType(e.target.value)}
                            disabled={!selectedModuleId}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                        >
                            <option value="">Selecciona evaluación...</option>
                            {Array.isArray(gradeTypes) && gradeTypes.map((gt: any) => (
                                <option key={gt.id} value={gt.id}>{gt.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsAddingType(true)}
                            disabled={!selectedModuleId}
                            className="p-3 bg-slate-800 text-amber-500 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {isAddingType && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-end animate-in zoom-in-95 duration-300">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Nombre de la Evaluación (ej: Examen Final)</label>
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
                            placeholder="Ej: Quiz 1, Trabajo Práctico..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAddingType(false)} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase hover:text-white">Cancelar</button>
                        <button onClick={handleCreateType} className="px-6 py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase hover:bg-amber-400 transition-all">Crear</button>
                    </div>
                </div>
            )}

            {!selectedModuleId || !selectedGradeType ? (
                <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center">
                    <Trophy className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-500 text-sm font-bold">Selecciona un módulo y un tipo de evaluación para cargar notas</p>
                </div>
            ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-amber-500" />
                            <h3 className="font-black text-white uppercase tracking-wider text-sm">Registro de Notas ({students?.length})</h3>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto">
                        {Array.isArray(students) && students.map((student: any) => (
                            <div key={student.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-800/20 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                                        <span className="text-xs font-black text-white">{student.first_name[0]}{student.last_name[0]}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{student.last_name}, {student.first_name}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{student.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <label className="text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">Calificación (0-5.0)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={scores[student.id]?.value || 0}
                                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-right font-black focus:border-amber-500 outline-none w-24"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-[150px]">
                                        <label className="text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">Observación</label>
                                        <input
                                            type="text"
                                            placeholder="..."
                                            value={scores[student.id]?.remarks || ''}
                                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:border-amber-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-900/50 border-t border-slate-800 flex justify-center">
                        <button
                            onClick={handleSaveGrades}
                            disabled={registerMutation.isPending}
                            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 disabled:opacity-50 shadow-xl shadow-amber-500/20"
                        >
                            <Save className="w-4 h-4" />
                            <span>{registerMutation.isPending ? 'Guardando...' : 'Guardar Calificaciones del Módulo'}</span>
                        </button>
                    </div>
                </div >
            )
            }
        </div >
    );
}
