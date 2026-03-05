import { useState } from 'react';
import {
    FileText, Upload, Trash2, Download,
    File, FileArchive, FileImage,
    Loader2
} from 'lucide-react';
import { useStudentAttachments, useUploadStudentAttachment, useDeleteStudentAttachment } from '../../hooks/useStudents';
import { toast } from 'react-hot-toast';

interface StudentAttachmentsProps {
    studentId: string;
}

export function StudentAttachments({ studentId }: StudentAttachmentsProps) {
    const { data: attachments, isLoading } = useStudentAttachments(studentId);
    const uploadMutation = useUploadStudentAttachment();
    const deleteMutation = useDeleteStudentAttachment();
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadMutation.mutateAsync({ studentId, file });
            toast.success('Archivo subido correctamente');
        } catch (err) {
            toast.error('Error al subir el archivo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

        try {
            await deleteMutation.mutateAsync({ studentId, attachmentId: id });
            toast.success('Archivo eliminado');
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const getFileIcon = (mimetype: string) => {
        if (mimetype.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
        if (mimetype.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
        if (mimetype.includes('zip') || mimetype.includes('rar')) return <FileArchive className="w-5 h-5 text-amber-500" />;
        return <File className="w-5 h-5 text-slate-400" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p className="text-xs font-bold uppercase tracking-widest">Cargando documentos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Upload Zone */}
            <div
                className={`relative group bg-slate-950/40 border-2 border-dashed rounded-[2rem] p-8 transition-all flex flex-col items-center justify-center text-center ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) uploadMutation.mutateAsync({ studentId, file });
                }}
            >
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {uploadMutation.isPending ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8 text-blue-500" />
                    )}
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1">Cargar Documento</h4>
                    <p className="text-xs text-slate-500 mb-6">PDF, Imágenes o Archivos comprimidos</p>
                    <label className="cursor-pointer px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        Seleccionar Archivo
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {/* List */}
            <div className="bg-slate-900/50 rounded-[2rem] border border-slate-800 overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentación Registrada</h3>
                    <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-[9px] font-black text-slate-400">
                        {attachments?.length || 0} Archivos
                    </span>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {attachments && attachments.length > 0 ? (
                        attachments.map((file) => (
                            <div key={file.id} className="p-4 hover:bg-slate-800/30 transition-all flex items-center group">
                                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 mr-4 group-hover:bg-slate-900 transition-colors">
                                    {getFileIcon(file.mimetype)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{file.original_name}</p>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{file.mimetype.split('/')[1]}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <span className="text-[10px] text-slate-500 font-bold">{formatSize(file.size)}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <span className="text-[10px] text-slate-600">{new Date(file.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 px-2">
                                    <a
                                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/uploads/students/${file.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
                                        title="Descargar"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center opacity-30 text-center px-8">
                            <FileArchive className="w-12 h-12 mb-4 text-slate-600" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                No hay documentos asociados<br />a este estudiante aún.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
