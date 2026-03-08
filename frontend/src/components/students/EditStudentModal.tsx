import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, IdCard, Save } from 'lucide-react';
import { useUpdateStudent } from '../../hooks/useStudents';
import { useSedes } from '../../hooks/useAcademic';
import { toast } from 'react-hot-toast';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
}

export function EditStudentModal({ isOpen, onClose, student }: EditStudentModalProps) {
    const updateStudent = useUpdateStudent();
    const { data: sedes } = useSedes();
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
        status: 'ACTIVE'
    });

    useEffect(() => {
        if (isOpen && student) {
            setFormData({
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                email: student.email || '',
                document_type: student.document_type || 'CEDULA',
                document_id: student.document_id || '',
                phone: student.phone || '',
                address: student.address || '',
                sede_id: student.sede_id || '',
                status: student.status || 'ACTIVE'
            });
            setIsSubmitting(false);
        }
    }, [isOpen, student]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateStudent.mutateAsync({
                id: student.id,
                ...formData
            });
            toast.success('Información del estudiante actualizada');
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error al actualizar estudiante');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-3xl w-full max-w-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Editar Perfil del Estudiante</h2>
                        <p className="text-sm text-slate-400 mt-1 font-medium tracking-wide">Actualiza la información básica y de contacto</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-6">
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
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
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
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
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
                                            required
                                            value={formData.document_type}
                                            onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                            className="block w-full pl-10 pr-6 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="CEDULA">Cédula</option>
                                            <option value="PASAPORTE">Pasaporte</option>
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            required
                                            value={formData.document_id}
                                            onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                                            className="block w-full px-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
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
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Teléfono y Sede */}
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
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Sede Asignada</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <select
                                        value={formData.sede_id}
                                        onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                                        className="block w-full pl-10 pr-6 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="">Seleccionar Sede</option>
                                        {Array.isArray(sedes) && sedes.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Estado y Dirección */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Estado del Estudiante</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="ACTIVE">Activo</option>
                                    <option value="INACTIVE">Inactivo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase">Dirección Física</label>
                                <textarea
                                    rows={1}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner resize-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end items-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="edit-student-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center gap-2 group disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
