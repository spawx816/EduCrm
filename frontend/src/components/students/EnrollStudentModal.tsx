import { useState } from 'react';
import { usePrograms, useCohorts } from '../../hooks/useAcademic.ts';
import { useScholarships } from '../../hooks/useBilling.ts';
import { useEnrollStudent } from '../../hooks/useStudents.ts';
import { X, GraduationCap, CheckCircle2, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EnrollStudentModalProps {
    studentId: string;
    studentName: string;
    onClose: () => void;
}

export function EnrollStudentModal({ studentId, studentName, onClose }: EnrollStudentModalProps) {
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [selectedCohortId, setSelectedCohortId] = useState<string>('');
    const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('');
    const { data: programs } = usePrograms();
    const { data: cohorts, isLoading: loadingCohorts } = useCohorts(selectedProgramId || undefined);
    const { data: scholarships } = useScholarships();
    const enrollMutation = useEnrollStudent();

    const handleEnroll = async () => {
        if (!selectedCohortId) return;
        try {
            await enrollMutation.mutateAsync({
                studentId,
                cohortId: selectedCohortId,
                scholarshipId: selectedScholarshipId || undefined
            });
            onClose();
        } catch (error: any) {
            console.error('Error enrolling student:', error);
            const message = error.response?.data?.message || 'El estudiante ya se encuentra inscrito en este programa académico.';
            toast.error(message);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Nueva Inscripción</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Estudiante</p>
                        <p className="text-sm font-bold text-white">{studentName}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Programa Académico</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                value={selectedProgramId}
                                onChange={(e) => {
                                    setSelectedProgramId(e.target.value);
                                    setSelectedCohortId('');
                                }}
                            >
                                <option value="">Selecciona un programa...</option>
                                {Array.isArray(programs) && programs.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                        </div>

                        {selectedProgramId && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Cohorte / Grupo</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={selectedCohortId}
                                    onChange={(e) => setSelectedCohortId(e.target.value)}
                                >
                                    <option value="">Selecciona un cohorte...</option>
                                    {Array.isArray(cohorts) && cohorts.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {cohorts?.length === 0 && !loadingCohorts && (
                                    <p className="text-[10px] text-amber-500 mt-2 italic px-1 font-medium">No hay cohortes activos para este programa.</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Beca / Descuento (Opcional)</label>
                            <div className="relative">
                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <select
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={selectedScholarshipId}
                                    onChange={(e) => setSelectedScholarshipId(e.target.value)}
                                >
                                    <option value="">Ninguna beca aplicada</option>
                                    {Array.isArray(scholarships) && scholarships.map((s: any) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.type === 'PERCENTAGE' ? `${s.value}%` : `$${s.value}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex flex-col space-y-3">
                    <button
                        onClick={handleEnroll}
                        disabled={!selectedCohortId || enrollMutation.isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                        {enrollMutation.isPending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirmar Inscripción</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-transparent hover:bg-slate-800 text-slate-400 text-sm font-bold rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
