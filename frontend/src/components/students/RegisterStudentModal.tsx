import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, GraduationCap, ChevronRight, IdCard } from 'lucide-react';
import { useCreateStudent, useEnrollStudent } from '../../hooks/useStudents';
import { usePrograms, useCohorts } from '../../hooks/useAcademic';
import { useScholarships } from '../../hooks/useBilling';
import { toast } from 'react-hot-toast';

interface RegisterStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    };
    onSuccess?: () => void;
}

export function RegisterStudentModal({ isOpen, onClose, initialData, onSuccess }: RegisterStudentModalProps) {
    const createStudent = useCreateStudent();
    const enrollStudent = useEnrollStudent();

    const { data: programs } = usePrograms();
    const { data: scholarships } = useScholarships();

    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        document_type: 'CEDULA',
        document_id: '',
        phone: '',
        address: '',
        sede_id: '',
        program_id: '',
        cohort_id: '',
        scholarship_id: ''
    });

    const { data: cohorts, isLoading: isLoadingCohorts } = useCohorts(formData.program_id);

    // Reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({
                first_name: initialData?.first_name || '',
                last_name: initialData?.last_name || '',
                email: initialData?.email || '',
                document_type: 'CEDULA',
                document_id: '',
                phone: initialData?.phone || '',
                address: '',
                sede_id: '',
                program_id: '',
                cohort_id: '',
                scholarship_id: ''
            });
            setIsSubmitting(false);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.document_id) {
            toast.error('Por favor, completa los campos requeridos (*)');
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Si están en el paso 1 y presionan Enter
        if (step === 1) {
            handleNext();
            return;
        }

        if (!formData.program_id || !formData.cohort_id) {
            toast.error('Debes seleccionar un programa y un curso para finalizar el registro');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create Student
            const newStudent = await createStudent.mutateAsync({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                document_type: formData.document_type,
                document_id: formData.document_id,
                phone: formData.phone,
                address: formData.address,
                sede_id: formData.sede_id
            });

            // 2. Enroll Student directly
            await enrollStudent.mutateAsync({
                studentId: newStudent.id,
                cohortId: formData.cohort_id,
                scholarshipId: formData.scholarship_id || undefined
            });

            toast.success('Estudiante registrado e inscrito correctamente');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error al completar el registro');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-3xl w-full max-w-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Registro Directo de Estudiante</h2>
                        <p className="text-sm text-slate-400 mt-1 font-medium tracking-wide">
                            {step === 1 ? 'Paso 1: Información Personal' : 'Paso 2: Selección Académica'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-slate-900">
                    <div
                        className={`h-full bg-blue-500 transition-all duration-300 ease-in-out ${step === 1 ? 'w-1/2' : 'w-full'}`}
                    />
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <form id="register-student-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Paso 1: Información Personal */}
                        <div className={`space-y-6 transition-all duration-300 ${step === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>

                            {/* Nombres y Apellidos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Nombres *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required={step === 1}
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                                            placeholder="Juan"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Apellidos *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required={step === 1}
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                                            placeholder="Pérez"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Correo y Documento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Documento de Identidad *</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-1/3 min-w-[120px]">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IdCard className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <select
                                                required={step === 1}
                                                value={formData.document_type}
                                                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                                className="block w-full pl-10 pr-6 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="CEDULA">Cédula</option>
                                                <option value="PASAPORTE">Pasaporte</option>
                                            </select>
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                required={step === 1}
                                                value={formData.document_id}
                                                onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                                                className="block w-full px-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                                                placeholder={formData.document_type === 'CEDULA' ? "000-0000000-0" : "Número de Pasaporte"}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Correo Electrónico *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="email"
                                            required={step === 1}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                                            placeholder="juan@ejemplo.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Teléfono y Dirección */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Teléfono</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Dirección Física</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                                            <MapPin className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <textarea
                                            rows={1}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner resize-none"
                                            placeholder="Calle Principal #123..."
                                        />
                                    </div>
                                </div>
                            </div>



                        </div>

                        {/* Paso 2: Selección Académica */}
                        <div className={`space-y-6 transition-all duration-300 ${step === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>

                            <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                                <GraduationCap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-100">Matriculación Inmediata</h4>
                                    <p className="text-xs text-blue-400 mt-1 leading-relaxed">
                                        Selecciona el Programa y Curso (Cohorte) al que este estudiante entrará. Al finalizar, el sistema creará su matrícula oficial.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Programa Académico</label>
                                    <select
                                        required={step === 2}
                                        value={formData.program_id}
                                        onChange={(e) => {
                                            setFormData({ ...formData, program_id: e.target.value, cohort_id: '' });
                                        }}
                                        className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value="" disabled className="text-slate-500">Seleccionar Programa</option>
                                        {Array.isArray(programs) && programs.map(program => (
                                            <option key={program.id} value={program.id}>{program.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Curso Disponible (Cohorte)</label>
                                    <select
                                        required={step === 2}
                                        value={formData.cohort_id}
                                        onChange={(e) => setFormData({ ...formData, cohort_id: e.target.value })}
                                        disabled={!formData.program_id || isLoadingCohorts}
                                        className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:emerald-500 focus:border-emerald-500 sm:text-sm transition-all appearance-none cursor-pointer shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="" disabled className="text-slate-500">
                                            {isLoadingCohorts ? 'Cargando cursos...' : (formData.program_id ? 'Seleccionar Curso' : 'Primero selecciona un Programa')}
                                        </option>
                                        {Array.isArray(cohorts) && cohorts.map(cohort => (
                                            <option key={cohort.id} value={cohort.id}>
                                                {cohort.name} (Inicia: {new Date(cohort.start_date).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Beca / Descuento (Opcional)</label>
                                    <select
                                        value={formData.scholarship_id}
                                        onChange={(e) => setFormData({ ...formData, scholarship_id: e.target.value })}
                                        className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value="">Sin beca</option>
                                        {Array.isArray(scholarships) && scholarships.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.type === 'PERCENTAGE' ? `${s.value}%` : `$${s.value}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center gap-4">
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-6 py-2.5 text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                        >
                            Atrás
                        </button>
                    )}

                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-8 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2 group"
                        >
                            Siguiente Paso
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            form="register-student-form"
                            type="submit"
                            disabled={isSubmitting || !formData.cohort_id}
                            className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all ${isSubmitting || !formData.cohort_id
                                ? 'bg-slate-700 cursor-not-allowed opacity-70'
                                : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/50'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Registrando...</span>
                                </>
                            ) : (
                                <>
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Completar Inscripción</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
