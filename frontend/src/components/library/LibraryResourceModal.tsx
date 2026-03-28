import React, { useState, useEffect } from 'react';
import { X, Book, FileText, Video, MoreHorizontal, Upload, Check, Shield } from 'lucide-react';
import { useCreateLibraryResource, useUpdateLibraryResource, useLibraryPermissions, useAddLibraryPermission, useRemoveLibraryPermission } from '../../hooks/useLibrary';
import { usePrograms } from '../../hooks/useAcademic';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/api-client';

interface LibraryResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: any | null;
}

export function LibraryResourceModal({ isOpen, onClose, resource }: LibraryResourceModalProps) {
  const createResource = useCreateLibraryResource();
  const updateResource = useUpdateLibraryResource();
  const { data: programs } = usePrograms();
  const addPermission = useAddLibraryPermission();
  const removePermission = useRemoveLibraryPermission();
  const { data: permissions } = useLibraryPermissions(resource?.id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'DOCUMENT',
    file_url: '',
    thumbnail_url: '',
    is_active: true
  });

  const [uploading, setUploading] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description || '',
        resource_type: resource.resource_type,
        file_url: resource.file_url,
        thumbnail_url: resource.thumbnail_url || '',
        is_active: resource.is_active
      });
    } else {
      setFormData({
        title: '',
        description: '',
        resource_type: 'DOCUMENT',
        file_url: '',
        thumbnail_url: '',
        is_active: true
      });
    }
  }, [resource, isOpen]);

  useEffect(() => {
    if (permissions) {
      setSelectedPrograms(permissions.map((p: any) => p.program_id));
    } else {
      setSelectedPrograms([]);
    }
  }, [permissions]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { data } = await apiClient.post('/library/upload', uploadData);
      setFormData(prev => ({ ...prev, file_url: data.url || data.filename }));
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: data.originalname.split('.')[0] }));
      }
      toast.success('Archivo subido correctamente');
    } catch (err) {
      toast.error('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const toggleProgramPermission = async (programId: string) => {
    if (!resource?.id) {
      if (selectedPrograms.includes(programId)) {
        setSelectedPrograms(prev => prev.filter(id => id !== programId));
      } else {
        setSelectedPrograms(prev => [...prev, programId]);
      }
      return;
    }

    try {
      if (selectedPrograms.includes(programId)) {
        await removePermission.mutateAsync({ resourceId: resource.id, programId });
        toast.success('Permiso removido');
      } else {
        await addPermission.mutateAsync({ resourceId: resource.id, programId });
        toast.success('Permiso otorgado');
      }
    } catch (err) {
      toast.error('Error al actualizar permisos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file_url) {
      toast.error('Debes subir un archivo para el recurso');
      return;
    }

    try {
      if (resource) {
        await updateResource.mutateAsync({ id: resource.id, ...formData });
        toast.success('Recurso actualizado');
      } else {
        const newResource = await createResource.mutateAsync(formData);
        for (const pId of selectedPrograms) {
          await addPermission.mutateAsync({ resourceId: newResource.id, programId: pId });
        }
        toast.success('Recurso creado y permisos asignados');
      }
      onClose();
    } catch (err) {
      toast.error('Error al guardar el recurso');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center z-[150] p-6 animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 right-0 p-8">
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8 shrink-0">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Book className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {resource ? 'Gestionar Recurso' : 'Nuevo Recurso'}
              </h2>
              <p className="text-slate-500 text-sm font-medium">Añade materiales a la biblioteca virtual y define quién puede verlos.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <form id="resource-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center">Detalles del Documento</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Título</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Manual de Aerodinámica I"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Tipo de Recurso</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'BOOK', label: 'Libro', icon: Book },
                    { id: 'DOCUMENT', label: 'Manual/Guía', icon: FileText },
                    { id: 'VIDEO', label: 'Video Clase', icon: Video },
                    { id: 'OTHER', label: 'Otro', icon: MoreHorizontal }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, resource_type: type.id as any })}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${
                        formData.resource_type === type.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Archivo del Recurso</label>
                <div className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${formData.file_url ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
                  {uploading ? (
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Subiendo...</p>
                    </div>
                  ) : formData.file_url ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/30">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Archivo Preparado</p>
                      <p className="text-[9px] text-slate-500 max-w-[200px] truncate">{formData.file_url}</p>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({...prev, file_url: ''}))} 
                        className="mt-4 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                      >
                        Cambiar Archivo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.mp4" />
                      <Upload className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-300 mb-2">Haz clic para subir archivo</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">PDF, Manuales o Videos (Máx 50MB)</p>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center">Visibilidad y Control</h3>
              
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Acceso Restringido</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">El documento solo será visible para los estudiantes matriculados en los programas seleccionados.</p>
                
                <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {Array.isArray(programs) && programs.map((program) => (
                    <button
                      key={program.id}
                      type="button"
                      onClick={() => toggleProgramPermission(program.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedPrograms.includes(program.id)
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold truncate pr-3">{program.name}</span>
                      {selectedPrograms.includes(program.id) ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-800 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem]">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1">Protección de Datos</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      Este recurso se abrirá en modo lectura segura. Se deshabilitarán las opciones de descarga e impresión automáticas del navegador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 flex space-x-4 pt-6 shrink-0 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl text-xs font-bold text-slate-400 hover:bg-slate-900 transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            form="resource-form"
            type="submit"
            disabled={createResource.isPending || updateResource.isPending || uploading}
            className="flex-[3] bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-2xl text-xs font-black shadow-xl shadow-blue-600/20 transition-all uppercase tracking-widest disabled:opacity-50 flex items-center justify-center"
          >
            {resource ? 'Actualizar Recurso' : 'Habilitar en Biblioteca'}
          </button>
        </div>
      </div>
    </div>
  );
}
