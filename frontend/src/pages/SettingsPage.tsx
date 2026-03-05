import { useState, useEffect } from 'react';
import { Settings, Users, Save, Globe, Shield, RefreshCw } from 'lucide-react';
import apiClient from '../lib/api-client';

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'company' | 'users'>('company');
    const [settings, setSettings] = useState({
        company_name: '',
        logo_url: '',
        primary_color: '#2563eb',
        address: '',
        phone: '',
        website: '',
        invoice_header: '',
        invoice_footer: ''
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // New User Modal State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        roleId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [settingsRes, usersRes, rolesRes] = await Promise.all([
                apiClient.get('/settings'),
                apiClient.get('/auth/users'),
                apiClient.get('/auth/roles')
            ]);
            setSettings({
                ...settingsRes.data,
                address: settingsRes.data.address || '',
                phone: settingsRes.data.phone || '',
                website: settingsRes.data.website || '',
                invoice_header: settingsRes.data.invoice_header || '¡Gracias por su pago!',
                invoice_footer: settingsRes.data.invoice_footer || 'Este ticket no es una factura fiscal.'
            });
            setUsers(usersRes.data);
            setRoles(rolesRes.data);

            if (settingsRes.data.logo_url) {
                setLogoPreview(settingsRes.data.logo_url.startsWith('http')
                    ? settingsRes.data.logo_url
                    : `${apiClient.defaults.baseURL?.replace('/api', '')}${settingsRes.data.logo_url}`
                );
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Error al cargar los datos' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('company_name', settings.company_name);
            formData.append('primary_color', settings.primary_color);
            formData.append('address', settings.address);
            formData.append('phone', settings.phone);
            formData.append('website', settings.website);
            formData.append('invoice_header', settings.invoice_header);
            formData.append('invoice_footer', settings.invoice_footer);

            if (logoFile) {
                formData.append('logo', logoFile);
            }

            await apiClient.patch('/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
            fetchData();
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Error al guardar la configuración' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUserUpdate = async (userId: string, updateData: any) => {
        try {
            await apiClient.patch(`/auth/users/${userId}`, updateData);
            setMessage({ type: 'success', text: 'Usuario actualizado' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar usuario' });
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingUser(true);
        setMessage(null);

        try {
            await apiClient.post('/auth/register', {
                first_name: newUserForm.first_name,
                last_name: newUserForm.last_name,
                email: newUserForm.email,
                password: newUserForm.password,
                role: newUserForm.roleId, // The auth service expects 'role'
                organizationId: users[0]?.organization_id // Assuming organization isolation or we fetch from context
            });

            setMessage({ type: 'success', text: 'Usuario creado exitosamente' });
            setIsAddUserModalOpen(false);
            setNewUserForm({ first_name: '', last_name: '', email: '', password: '', roleId: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage({ type: 'error', text: 'Error al crear el usuario. Verifique los datos o si el correo ya existe.' });
        } finally {
            setIsCreatingUser(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#0f172a]">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
                <h1 className="text-lg font-bold text-white tracking-tight">Panel de Administración</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Tabs Sidebar */}
                <aside className="w-64 border-r border-slate-800 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'company' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <Globe className="w-5 h-5" />
                        <span className="font-bold">Empresa</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-bold">Usuarios</span>
                    </button>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'company' ? (
                        <div className="max-w-4xl space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                                <div className="flex items-center space-x-3 mb-8">
                                    <Globe className="w-6 h-6 text-blue-500" />
                                    <h2 className="text-xl font-black text-white">Información de la Empresa</h2>
                                </div>

                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre de la Empresa</label>
                                                <input
                                                    type="text"
                                                    value={settings.company_name}
                                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                                    placeholder="Ej. Mi Academia"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Color Principal (Marca)</label>
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="color"
                                                        value={settings.primary_color}
                                                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                                        className="w-12 h-12 bg-transparent border-none cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.primary_color}
                                                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                                        className="flex-1 bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dirección</label>
                                                <input
                                                    type="text"
                                                    value={settings.address}
                                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Teléfono</label>
                                                    <input
                                                        type="text"
                                                        value={settings.phone}
                                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sitio Web</label>
                                                    <input
                                                        type="text"
                                                        value={settings.website}
                                                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Logo Corporativo</label>
                                                <div
                                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                                    className="w-full aspect-square bg-[#020617] border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all"
                                                >
                                                    {logoPreview ? (
                                                        <div className="relative w-full h-full flex items-center justify-center p-8">
                                                            <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                            <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                                <RefreshCw className="w-8 h-8 text-white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Save className="w-12 h-12 text-slate-700 mb-4" />
                                                            <p className="text-xs font-bold text-slate-500">Haz clic para subir logo</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="logo-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <Settings className="w-5 h-5 text-indigo-500" />
                                            <h3 className="text-lg font-black text-white">Configuración de Factura (POS)</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Encabezado de Factura</label>
                                                <textarea
                                                    value={settings.invoice_header}
                                                    onChange={(e) => setSettings({ ...settings, invoice_header: e.target.value })}
                                                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-20 resize-none font-medium"
                                                    placeholder="Ej. ¡Gracias por confiar en nosotros!"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pie de Factura (Instrucciones de Pago, etc.)</label>
                                                <textarea
                                                    value={settings.invoice_footer}
                                                    onChange={(e) => setSettings({ ...settings, invoice_footer: e.target.value })}
                                                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-20 resize-none font-medium"
                                                    placeholder="Ej. Este ticket no es una factura fiscal."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className={`w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
                                        <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-6 h-6 text-indigo-500" />
                                    <h2 className="text-xl font-black text-white">Gestión de Usuarios</h2>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-[10px] font-black px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">{users.length} USUARIOS</span>
                                    <button
                                        onClick={() => setIsAddUserModalOpen(true)}
                                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>Añadir Usuario</span>
                                    </button>
                                </div>
                            </div>

                            <table className="w-full text-left">
                                <thead className="bg-[#020617]/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuario</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol actual</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white">{u.first_name} {u.last_name}</span>
                                                    <span className="text-xs text-slate-500">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={roles.find(r => r.name === u.role_name)?.id || ''}
                                                    onChange={(e) => handleUserUpdate(u.id, { roleId: e.target.value, isActive: u.is_active })}
                                                    className="bg-[#020617] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                                >
                                                    {roles.map((r) => (
                                                        <option key={r.id} value={r.id}>{r.display_name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleUserUpdate(u.id, { roleId: roles.find(r => r.name === u.role_name)?.id, isActive: !u.is_active })}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${u.is_active
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                        }`}
                                                >
                                                    {u.is_active ? 'ACTIVO' : 'INACTIVO'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] text-slate-600 italic">Cambios inmediatos</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Crear Usuario */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-white">Añadir Nuevo Usuario</h3>
                            <button
                                onClick={() => setIsAddUserModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUserForm.first_name}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Apellido</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUserForm.last_name}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUserForm.email}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contraseña Temporal</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newUserForm.password}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rol Asignado</label>
                                    <select
                                        required
                                        value={newUserForm.roleId}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, roleId: e.target.value })}
                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="">Seleccione un rol...</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.name}>{r.display_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddUserModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingUser || !newUserForm.roleId}
                                        className={`px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center space-x-2 ${isCreatingUser || !newUserForm.roleId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                                    >
                                        <span>{isCreatingUser ? 'Creando...' : 'Crear Usuario'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
