import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Phone, MapPin, Save, Edit2, Check, ShieldCheck, UserCircle, Bell, Key, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminProfile() {
    const { user, updateProfile } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({
        first_name: user?.firstName || user?.first_name || '',
        last_name: user?.lastName || user?.last_name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        avatar_url: user?.avatar_url || ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile.mutateAsync(profileForm);
            setEditMode(false);
            toast.success('Perfil de administrador actualizado');
        } catch (error) {
            toast.error('Error al actualizar perfil');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0f1e] overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Mi Perfil Administrativo</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Gestión de Cuenta Personal</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                        Nivel: {user?.role?.toUpperCase()}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                            <ShieldCheck className="w-64 h-64 text-white" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10">
                            <div className="relative">
                                <div className="w-36 h-36 bg-slate-800 rounded-[3rem] flex items-center justify-center border-4 border-slate-700 shadow-2xl overflow-hidden group-hover:border-indigo-500/50 transition-colors">
                                    {user?.avatar_url ? (
                                        <img src={`${import.meta.env.VITE_API_URL}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle className="w-20 h-20 text-slate-600" />
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-500 border-4 border-[#0a0f1e] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
                                    <Check className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-4 uppercase">
                                    {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                                </h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="bg-slate-950/80 px-4 py-2 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800">
                                        ID: {user?.id?.slice(0, 8)}
                                    </span>
                                    <span className="bg-emerald-500/10 px-4 py-2 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                                        Acceso Total
                                    </span>
                                    <span className="bg-blue-500/10 px-4 py-2 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20">
                                        Admin Global
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setEditMode(!editMode)}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 hover:border-indigo-500/50 flex items-center shadow-xl backdrop-blur-md"
                            >
                                <Edit2 className="w-4 h-4 mr-3 text-indigo-400" />
                                {editMode ? 'Cancelar Cambios' : 'Editar Mi Cuenta'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Personal Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] shadow-xl">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-10 flex items-center">
                                    <User className="w-4 h-4 mr-3" /> Información de Identidad
                                </h3>

                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 block">Nombre Pila</label>
                                            <div className="bg-black/20 border border-slate-800 p-4 rounded-2xl focus-within:border-indigo-500/50 transition-all">
                                                <input 
                                                    type="text"
                                                    disabled={!editMode}
                                                    value={profileForm.first_name}
                                                    onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                    className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 block">Primer Apellido</label>
                                            <div className="bg-black/20 border border-slate-800 p-4 rounded-2xl focus-within:border-indigo-500/50 transition-all">
                                                <input 
                                                    type="text"
                                                    disabled={!editMode}
                                                    value={profileForm.last_name}
                                                    onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                    className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 block">Número de Contacto</label>
                                        <div className="bg-black/20 border border-slate-800 p-4 rounded-2xl flex items-center focus-within:border-emerald-500/50 transition-all">
                                            <Phone className="w-5 h-5 text-emerald-500 mr-4" />
                                            <input 
                                                type="text"
                                                disabled={!editMode}
                                                value={profileForm.phone}
                                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0"
                                                placeholder="809-XXX-XXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 block">Residencia Física</label>
                                        <div className="bg-black/20 border border-slate-800 p-4 rounded-2xl flex items-start focus-within:border-blue-500/50 transition-all">
                                            <MapPin className="w-5 h-5 text-blue-500 mr-4 mt-1" />
                                            <textarea 
                                                disabled={!editMode}
                                                rows={2}
                                                value={profileForm.address}
                                                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                                className="bg-transparent border-none text-sm font-bold text-white w-full focus:ring-0 resize-none"
                                                placeholder="Dirección completa"
                                            />
                                        </div>
                                    </div>

                                    {editMode && (
                                        <button 
                                            type="submit"
                                            disabled={updateProfile.isPending}
                                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center space-x-3 active:scale-95"
                                        >
                                            {updateProfile.isPending ? (
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Actualizar Credenciales</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Sidebar Widgets */}
                        <div className="space-y-8">
                            {/* Security Box */}
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-3" /> Seguridad Avanzada
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="p-5 bg-black/30 border border-slate-800 rounded-2xl flex flex-col space-y-1">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Email Corporativo</span>
                                        <div className="flex items-center text-xs font-bold text-white">
                                            <Mail className="w-4 h-4 mr-3 text-indigo-500" />
                                            {user?.email}
                                        </div>
                                    </div>
                                    
                                    <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center">
                                        <Key className="w-4 h-4 mr-3" /> Cambiar Contraseña
                                    </button>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="bg-gradient-to-br from-indigo-900/10 to-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                                    <Bell className="w-4 h-4 mr-3" /> Preferencias
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Globe className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idioma del Sistema</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white">ES-LATAM</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800">
                                        <div className="flex items-center justify-between opacity-50">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado de Cuenta</span>
                                            <span className="text-[10px] font-black text-emerald-500">VERIFICADA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
