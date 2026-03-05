import { useState } from 'react';
import { usePortalAuth } from '../hooks/usePortal.tsx';
import { GraduationCap, Mail, Fingerprint, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function PortalLogin() {
    const { login } = usePortalAuth();
    const [matricula, setMatricula] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login.mutateAsync({ matricula, email });
            toast.success('¡Bienvenido a tu portal!');
        } catch (err) {
            toast.error('Credenciales no encontradas. Verifica tu Matrícula y Email.');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                            <GraduationCap className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Portal del Alumno</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Ingresa con tus datos institucionales para consultar tus pagos y progreso académico.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Matrícula</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="text"
                                    value={matricula}
                                    onChange={e => setMatricula(e.target.value)}
                                    placeholder="Ej: 000001"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all group-hover:border-slate-700 font-mono"
                                />
                                <Fingerprint className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Correo Electrónico</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all group-hover:border-slate-700"
                                />
                                <Mail className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={login.isPending}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                            {login.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Acceder a mi portal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                            ¿Problemas para entrar? Contacta a soporte
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
