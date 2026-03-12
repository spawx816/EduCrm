import React from 'react';
import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = true,
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className={`p-4 rounded-3xl ${isDanger ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                            {isDanger ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-white text-center mb-2 tracking-tight">{title}</h3>
                    <p className="text-slate-400 text-sm text-center leading-relaxed">
                        {message}
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 ${
                                isDanger 
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                            }`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>{confirmText}</span>
                            )}
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={onCancel}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <XCircle className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
