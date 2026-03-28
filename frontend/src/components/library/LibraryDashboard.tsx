import { useState } from 'react';
import { Book, Search, Plus, FileText, Video, MoreHorizontal, Play, Eye, Trash2, Edit2, Lock } from 'lucide-react';
import { useLibraryResources, useDeleteLibraryResource } from '../../hooks/useLibrary';
import { useAuth } from '../../hooks/useAuth';
import { getStaticUrl } from '../../lib/api-client';
import { LibraryResourceModal } from './LibraryResourceModal';
import { ResourceViewer } from './ResourceViewer';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../shared/ConfirmModal';

export function LibraryDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role_id === 'admin' || user?.role_id === 'superadmin';
  const studentId = !isAdmin ? user?.id : undefined;

  const { data: resources, isLoading } = useLibraryResources(studentId);
  const deleteResource = useDeleteLibraryResource();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'BOOK' | 'DOCUMENT' | 'VIDEO'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const filteredResources = resources?.filter((r: any) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (r.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'ALL' || r.resource_type === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleDelete = async () => {
    try {
      await deleteResource.mutateAsync(confirmDelete.id);
      toast.success('Recurso eliminado correctamente');
      setConfirmDelete({ isOpen: false, id: '' });
    } catch (err) {
      toast.error('Error al eliminar el recurso');
    }
  };

  const openViewer = (resource: any) => {
    setViewerUrl(getStaticUrl(`/uploads/library/${resource.file_url}`));
    setViewerTitle(resource.title);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOK': return Book;
      case 'DOCUMENT': return FileText;
      case 'VIDEO': return Video;
      default: return MoreHorizontal;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center">
            <Book className="w-3 h-3 mr-2 text-blue-500" />
            Repositorio Digital
          </h2>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Biblioteca <span className="text-blue-500 italic">Virtual</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {isAdmin 
              ? 'Gestiona la documentación y recursos educativos para los estudiantes.' 
              : 'Accede a tus libros, manuales y material de apoyo autorizado.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => { setSelectedResource(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center shadow-xl shadow-blue-600/20 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Recurso
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar libros, manuales, guías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl pl-14 pr-6 py-5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
          />
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-[2rem] border border-slate-800 shrink-0">
          {(['ALL', 'BOOK', 'DOCUMENT', 'VIDEO'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'ALL' ? 'Todos' : tab === 'BOOK' ? 'Libros' : tab === 'DOCUMENT' ? 'Manuales' : 'Videos'}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-80 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredResources?.map((resource: any) => {
            const Icon = getIcon(resource.resource_type);
            return (
              <div 
                key={resource.id} 
                className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col h-full shadow-2xl hover:shadow-blue-900/10"
              >
                {/* Thumbnail / Type Overlay */}
                <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center p-12">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                  <Icon className="w-20 h-20 text-blue-500/20 group-hover:text-blue-500/40 transition-all duration-500 transform group-hover:scale-110" />
                  
                  {/* Action Badges */}
                  <div className="absolute top-6 right-6 flex space-x-2">
                    {isAdmin && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedResource(resource); setIsModalOpen(true); }}
                          className="p-3 bg-slate-800/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-white transition-all hover:bg-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({ isOpen: true, id: resource.id }); }}
                          className="p-3 bg-slate-800/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6">
                    <span className="bg-blue-600/10 border border-blue-500/20 text-blue-500 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {resource.resource_type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-white font-bold text-lg mb-2 leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-slate-500 text-xs mb-8 line-clamp-2 font-medium">
                    {resource.description || 'Sin descripción adicional para este material.'}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800/50">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Lock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest italic">Solo Lectura</span>
                    </div>
                    
                    <button 
                      onClick={() => openViewer(resource)}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/10 transition-all transform active:scale-90"
                    >
                      {resource.resource_type === 'VIDEO' ? <Play className="w-5 h-5 fill-current" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredResources?.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem]">
              <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-800">
                <Search className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">No se encontraron recursos</h3>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">Prueba con otros términos de búsqueda o filtros diferentes.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <LibraryResourceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resource={selectedResource}
      />

      {viewerUrl && (
        <ResourceViewer 
          url={viewerUrl}
          title={viewerTitle}
          onClose={() => setViewerUrl(null)}
        />
      )}

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Eliminar Recurso"
        message="¿Estás seguro de eliminar este recurso de la biblioteca? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '' })}
        isDanger={true}
      />
    </div>
  );
}
