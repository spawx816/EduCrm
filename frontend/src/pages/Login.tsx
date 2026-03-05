import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login.mutateAsync({ email, password });
            toast.success('Sesión iniciada correctamente');
        } catch (err) {
            toast.error('Credenciales inválidas. Verifica tu correo y contraseña.');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#0f172a]/40 backdrop-blur-2xl border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-600/20">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">CRM <span className="text-indigo-500 italic">Access</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Plataforma Académica y Administrativa</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Email Corporativo</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="email@institucion.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group-hover:border-slate-700"
                                />
                                <Mail className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Contraseña</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group-hover:border-slate-700"
                                />
                                <Lock className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={login.isPending}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 active:scale-[0.98]"
                        >
                            {login.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-600 text-[9px] uppercase font-black tracking-widest">
                            &copy; 2026 EduCRM All-in-One — Security Portal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
