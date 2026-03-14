import { useState, useEffect } from 'react';
import { Settings, Users, Save, Globe, Shield, RefreshCw, Edit2, X, Lock } from 'lucide-react';
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

    // Edit User Modal State
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editUserForm, setEditUserForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        roleId: '',
        isActive: true
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

    const handleUpdateUserDetailed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsUpdatingUser(true);
        setMessage(null);

        try {
            const dataToUpdate: any = {
                first_name: editUserForm.first_name,
                last_name: editUserForm.last_name,
                email: editUserForm.email,
                roleId: editUserForm.roleId,
                isActive: editUserForm.isActive
            };

            if (editUserForm.password) {
                dataToUpdate.password = editUserForm.password;
            }

            await apiClient.patch(`/auth/users/${selectedUser.id}`, dataToUpdate);

            setMessage({ type: 'success', text: 'Usuario actualizado exitosamente' });
            setIsEditUserModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error('Error updating user:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar el usuario' });
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setEditUserForm({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: '',
            roleId: roles.find(r => r.name === user.role_name)?.id || '',
            isActive: user.is_active
        });
        setIsEditUserModalOpen(true);
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
            <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 bg-[#0f172a]/80 backdrop-blur-md z-20 w-full">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Configuración de Plataforma</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Control Global de la Institución</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black border border-blue-500/20">
                        ADMIN v2.0
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Tabs Sidebar */}
                <aside className="w-72 border-r border-slate-800 p-6 space-y-3 bg-[#020617]/50">
                    <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 mt-2">Módulos de Sistema</p>
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'company' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 active:scale-95' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                    >
                        <Globe className={`w-5 h-5 ${activeTab === 'company' ? 'text-white' : 'text-slate-500'}`} />
                        <span className="font-black text-xs uppercase tracking-widest">Institución</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                    >
                        <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-white' : 'text-slate-500'}`} />
                        <span className="font-black text-xs uppercase tracking-widest">Usuarios & Roles</span>
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
                        <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000">
                                    <Globe className="w-48 h-48 text-white" />
                                </div>
                                <div className="flex items-center space-x-4 mb-10 relative z-10">
                                    <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                                        <Globe className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Identidad Institucional</h2>
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
                                                        className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:ring-0 px-3 uppercase"
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
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-indigo-600/[0.03] transition-colors group/row">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 group-hover/row:border-indigo-500/50 transition-all">
                                                        {u.first_name[0]}{u.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-none mb-1">{u.first_name} {u.last_name}</p>
                                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="bg-black/20 border border-slate-800 p-1.5 rounded-xl flex items-center px-4 w-48">
                                                    <select
                                                        value={roles.find(r => r.name === u.role_name)?.id || ''}
                                                        onChange={(e) => handleUserUpdate(u.id, { roleId: e.target.value, isActive: u.is_active })}
                                                        className="bg-transparent border-none text-[10px] font-black text-indigo-400 w-full focus:ring-0 uppercase tracking-widest"
                                                    >
                                                        {roles.map((r) => (
                                                            <option key={r.id} value={r.id} className="bg-slate-900 text-white font-sans">{r.display_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleUserUpdate(u.id, { roleId: roles.find(r => r.name === u.role_name)?.id, isActive: !u.is_active })}
                                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black border transition-all active:scale-95 tracking-[0.2em] ${u.is_active
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                                        }`}
                                                >
                                                    {u.is_active ? 'CUENTA ACTIVA' : 'BLOQUEADA'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button 
                                                        onClick={() => openEditModal(u)}
                                                        className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-500/20"
                                                        title="Editar Datos Completos"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] italic">Persistencia Instantánea</span>
                                                </div>
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
                                <X className="w-6 h-6" />
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

            {/* Modal de Editar Usuario */}
            {isEditUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Editar Usuario</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">ID: {selectedUser?.id?.substring(0, 8)}</p>
                            </div>
                            <button
                                onClick={() => setIsEditUserModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdateUserDetailed} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            value={editUserForm.first_name}
                                            onChange={(e) => setEditUserForm({ ...editUserForm, first_name: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Apellido</label>
                                        <input
                                            type="text"
                                            required
                                            value={editUserForm.last_name}
                                            onChange={(e) => setEditUserForm({ ...editUserForm, last_name: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={editUserForm.email}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        Nueva Contraseña
                                        <span className="text-[8px] text-slate-600 font-bold lowercase tracking-normal bg-black/30 px-2 py-0.5 rounded-full">Dejar en blanco para no cambiar</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            minLength={6}
                                            value={editUserForm.password}
                                            onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pl-10"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="w-4 h-4 text-slate-700 absolute left-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rol del Usuario</label>
                                    <select
                                        required
                                        value={editUserForm.roleId}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, roleId: e.target.value })}
                                        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="">Seleccione un rol...</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id} className="bg-slate-900">{r.display_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                    <input 
                                        type="checkbox" 
                                        id="edit-is-active"
                                        checked={editUserForm.isActive}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded-lg bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                                    />
                                    <label htmlFor="edit-is-active" className="text-xs font-black text-white uppercase tracking-widest cursor-pointer">
                                        {editUserForm.isActive ? 'Cuenta Activa' : 'Cuenta Bloqueada'}
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditUserModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingUser}
                                        className={`px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center space-x-2 ${isUpdatingUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
                                    >
                                        <Save className={`w-4 h-4 ${isUpdatingUser ? 'animate-spin' : ''}`} />
                                        <span>{isUpdatingUser ? 'Actualizando...' : 'Guardar Cambios'}</span>
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
