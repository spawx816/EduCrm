import { useState } from 'react';
import { useCohortModules, useAssignInstructor, useInstructors, useModules } from '../../hooks/useAcademic.ts';
import { UserPlus, UserCheck, Shield, Save, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CohortModuleManagerProps {
    cohortId: string;
    programId: string;
    onBack: () => void;
}

export function CohortModuleManager({ cohortId, programId, onBack }: CohortModuleManagerProps) {
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');

    const { data: programModules, isLoading: loadingProgram } = useModules(programId);
    const { data: cohortAssignments, isLoading: loadingAssignments } = useCohortModules(cohortId);
    const { data: instructors, isLoading: loadingInstructors } = useInstructors();
    const assignMutation = useAssignInstructor();

    const handleAssign = async () => {
        if (!selectedModule || !selectedInstructor) return;
        try {
            await assignMutation.mutateAsync({
                cohort_id: cohortId,
                module_id: selectedModule,
                teacher_id: selectedInstructor
            });
            setSelectedModule(null);
            setSelectedInstructor('');
            toast.success('Docente asignado correctamente');
        } catch (error) {
            toast.error('Error al asignar docente');
        }
    };

    if (loadingProgram || loadingAssignments || loadingInstructors) return <div className="p-8 text-center text-indigo-500 animate-pulse font-black uppercase tracking-widest">Actualizando planta docente...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Volver al Grupo</span>
                </button>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-indigo-500" />
                    Planta Docente por Módulo
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assignment List */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-4">Asignaciones Actuales</h3>
                    <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden divide-y divide-slate-800/50">
                        {Array.isArray(programModules) && programModules.map((m: any) => {
                            const assignment = cohortAssignments?.find((a: any) => a.module_id === m.id);
                            return (
                                <div key={m.id} className="p-6 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${assignment ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                            {assignment ? <UserCheck className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{m.name}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                                                {assignment ? `${assignment.teacher_first_name} ${assignment.teacher_last_name}` : 'Pendiente de asignar'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedModule(m.id)}
                                        className="p-2 text-slate-500 hover:text-indigo-500 transition-colors"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Assignment Form */}
                <div className="lg:sticky lg:top-24 h-fit">
                    {!selectedModule ? (
                        <div className="bg-slate-900/20 border border-dashed border-slate-800 p-12 rounded-[2.5rem] text-center">
                            <UserPlus className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Selecciona un módulo para asignar un profesor</p>
                        </div>
                    ) : (
                        <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2.5rem] space-y-6 animate-in zoom-in-95">
                            <div>
                                <h3 className="font-black text-white uppercase tracking-widest text-xs mb-1">Nueva Asignación</h3>
                                <p className="text-[10px] text-indigo-400 font-bold">Asignando docente al módulo:</p>
                                <p className="text-lg font-black text-white mt-1">{programModules?.find((m: any) => m.id === selectedModule)?.name}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Seleccionar Instructor</label>
                                    <select
                                        value={selectedInstructor}
                                        onChange={(e) => setSelectedInstructor(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                    >
                                        <option value="">Buscar en la nómina...</option>
                                        {Array.isArray(instructors) && instructors.map((inst: any) => (
                                            <option key={inst.id} value={inst.id}>
                                                {inst.first_name} {inst.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-800/30">
                                    <button
                                        onClick={() => setSelectedModule(null)}
                                        className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAssign}
                                        disabled={!selectedInstructor || assignMutation.isPending}
                                        className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Confirmar Profesor</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
