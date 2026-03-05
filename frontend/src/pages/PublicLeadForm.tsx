import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient, { getStaticUrl } from '../lib/api-client';
import { Send, GraduationCap, CheckCircle2 } from 'lucide-react';

export function PublicLeadForm() {
    const [searchParams] = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        apiClient.get('/settings').then(res => setSettings(res.data)).catch(console.error);
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentType: 'CEDULA',
        documentId: '',
        address: '',
    });

    const source = searchParams.get('source') || 'WEB_PUBLIC';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/leads/public', {
                ...formData,
                source
            });
            setIsSuccess(true);
            toast.success('¡Registro exitoso!');
        } catch (err) {
            toast.error('Hubo un error al procesar tu registro.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#0f172a]/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4 tracking-tight">¡Todo listo!</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Hemos recibido tus datos con éxito. Uno de nuestros asesores se pondrá en contacto contigo muy pronto.
                    </p>
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="text-blue-400 font-bold hover:underline text-sm uppercase tracking-widest"
                    >
                        Volver a registrarse
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1e] selection:bg-blue-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-screen">

                {/* Left Side: Branding/Value Prop */}
                <div className="flex flex-col justify-center p-8 lg:p-16 text-white">
                    <div className="flex items-center space-x-4 mb-12">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden ${settings?.logo_url ? 'bg-white shadow-slate-900/20' : 'bg-blue-600 shadow-blue-600/30'}`}>
                            {settings?.logo_url ? (
                                <img
                                    src={getStaticUrl(settings.logo_url)}
                                    alt="Logo"
                                    className="w-full h-full object-contain p-1"
                                />
                            ) : (
                                <GraduationCap className="w-7 h-7" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block text-xl md:text-2xl font-black tracking-tight leading-tight uppercase line-clamp-3">
                                {settings?.company_name || 'EduPremium'}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
                        Impulsa tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">futuro académico</span> hoy.
                    </h1>

                    <p className="text-lg text-slate-400 mb-12 max-w-lg leading-relaxed font-medium">
                        Únete a nuestra comunidad de estudiantes y accede a los programas más innovadores del mercado. Déjanos tus datos y te enviaremos toda la información.
                    </p>


                </div>

                {/* Right Side: Form */}
                <div className="flex items-center justify-center p-6 lg:p-16">
                    <div className="w-full max-w-md bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 lg:p-12 shadow-[0_0_50px_-12px_rgba(37,99,235,0.15)]">
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Solicita Información</h2>
                        <p className="text-slate-500 text-sm mb-10 font-medium">Completa el formulario y nos activaremos por ti.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Nombre</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="Ej: Juan"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Apellido</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="Ej: Pérez"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Correo Electrónico</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="name@email.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">WhatsApp / Teléfono</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Tipo</label>
                                    <select
                                        value={formData.documentType}
                                        onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-3 py-3 text-white text-xs outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value="CEDULA">Cédula</option>
                                        <option value="PASAPORTE">Passport</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Número de Identidad</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.documentId}
                                        onChange={e => setFormData({ ...formData, documentId: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                                        placeholder="000-0000000-0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Dirección Residencial</label>
                                <textarea
                                    rows={2}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner resize-none"
                                    placeholder="Calle, Número, Sector..."
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-widest text-xs">Enviar Solicitud</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] text-center text-slate-600 uppercase font-bold tracking-tight px-4 mt-6">
                                Al enviar este formulario, aceptas nuestra política de tratamiento de datos personales.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
