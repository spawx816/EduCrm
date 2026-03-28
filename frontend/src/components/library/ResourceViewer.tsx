import { useEffect, useRef } from 'react';
import { X, Shield, Lock } from 'lucide-react';

interface ResourceViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function ResourceViewer({ url, title, onClose }: ResourceViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+Shift+I
      if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'd')) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
    };

    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (viewer) {
        viewer.removeEventListener('contextmenu', handleContextMenu);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Visualización Protegida (Sin descarga)</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all transform hover:scale-110 active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewer */}
      <div ref={viewerRef} className="flex-1 relative overflow-hidden bg-slate-900 select-none">
        <iframe 
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title={title}
        />
        
        {/* Invisible overlay to further complicate interactions if needed, 
            but it might block scrolling if not careful. 
            For now, relying on toolbar=0 and keyboard blocks. */}
      </div>

      {/* Footer Security Note */}
      <div className="p-4 bg-slate-950 text-center">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
          Este documento es propiedad de EN-AA Academy. Queda prohibida su reproducción o distribución.
        </p>
      </div>
    </div>
  );
}
