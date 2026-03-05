import { useState } from 'react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../hooks/useIntegrations';
import {
    Plus, Key, Trash2, Copy, Info,
    ExternalLink, Code2, ShieldCheck, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function IntegrationsPage() {
    const { data: keys, isLoading } = useApiKeys();
    const createKey = useCreateApiKey();
    const revokeKey = useRevokeApiKey();

    const [newName, setNewName] = useState('');
    const [newService, setNewService] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createKey.mutateAsync({ name: newName, serviceName: newService });
            toast.success('¡Llave API creada!');
            setNewName('');
            setNewService('');
            setIsModalOpen(false);
        } catch (err) {
            toast.error('Error al crear llave');
        }
    };

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success('Llave copiada al portapapeles');
    };

    const handleRevoke = async (id: string) => {
        if (window.confirm('¿Estás seguro de revocar esta llave? Dejará de funcionar inmediatamente.')) {
            try {
                await revokeKey.mutateAsync(id);
                toast.success('Llave revocada');
            } catch (err) {
                toast.error('Error al revocar llave');
            }
        }
    };

    if (isLoading) return <div className="p-12 text-center animate-pulse text-slate-500">Cargando integraciones...</div>;

    return (
        <div className="flex flex-col h-full bg-[#0a0f1e] overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Integraciones Externas</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">API Marketplace & Webhooks</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Conexión
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Intro Card */}
                    <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                        <Zap className="absolute top-0 right-0 w-32 h-32 text-blue-500/10 -translate-y-8 translate-x-8" />
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-2">Conecta tu Ecosistema</h2>
                            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                                Utiliza las llaves API para conectar el EduCRM con herramientas como **Zapier, Make, Facebook Lead Ads o Typeform**. Recibe estudiantes de cualquier parte automáticamente.
                            </p>
                        </div>
                    </div>

                    {/* Keys List */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                            <Key className="w-3 h-3 mr-2 text-blue-500" />
                            Llaves API Activas
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {Array.isArray(keys) && keys.map((k: any) => (
                                <div key={k.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-700 transition-all group">
                                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${k.is_active ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                            <Code2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white tracking-tight">{k.name}</h4>
                                            <div className="flex items-center space-x-3 text-[10px] uppercase font-bold tracking-wider">
                                                <span className="text-slate-500">{k.service_name || 'Servicio Genérico'}</span>
                                                <span className="text-slate-700">•</span>
                                                <span className={k.is_active ? 'text-emerald-500' : 'text-rose-500'}>{k.is_active ? 'Activa' : 'Revocada'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {k.is_active && (
                                            <button
                                                onClick={() => handleCopy(k.key)}
                                                className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 flex items-center space-x-2 transition-all"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copiar Key</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRevoke(k.id)}
                                            disabled={!k.is_active}
                                            className="bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 p-2.5 rounded-xl text-rose-500 transition-all disabled:opacity-30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {keys?.length === 0 && (
                                <div className="p-12 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                                    <Info className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">No has creado ninguna llave de integración aún.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Docs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                        <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl">
                            <h4 className="text-white font-bold mb-4 flex items-center text-sm">
                                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                                Seguridad
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Las Llaves API dan acceso para insertar leads en tu CRM. Nunca compartas tus llaves en sitios públicos o frontend. Úsalas solo en herramientas de servidor o automatización.
                            </p>
                        </div>
                        <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl">
                            <h4 className="text-white font-bold mb-4 flex items-center text-sm">
                                <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                                ¿Cómo usar?
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                Endpoint: <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400">POST /integrations/webhook</code>
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Header requerido: <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-400">x-api-key: TU_LLAVE</code>
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Nueva Integración</h2>
                        <p className="text-slate-500 text-sm mb-8">Nombra tu nueva conexión para identificarla luego.</p>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Nombre Descriptivo</label>
                                <input
                                    required
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Ej: Zapier para Facebook"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Servicio (Opcional)</label>
                                <input
                                    type="text"
                                    value={newService}
                                    onChange={e => setNewService(e.target.value)}
                                    placeholder="Ej: Facebook Ads"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl text-xs font-bold text-slate-400 hover:bg-slate-900 transition-all uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createKey.isPending}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl text-xs font-bold shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest flex items-center justify-center"
                                >
                                    {createKey.isPending ? 'Creando...' : 'Generar Llave'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
