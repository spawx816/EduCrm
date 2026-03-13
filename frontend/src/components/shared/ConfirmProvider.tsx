import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
        isDanger: boolean;
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfig({
                isOpen: true,
                title: options.title,
                message: options.message,
                confirmText: options.confirmText || 'Confirmar',
                cancelText: options.cancelText || 'Cancelar',
                isDanger: options.isDanger ?? true,
                resolve
            });
        });
    }, []);

    const handleClose = (value: boolean) => {
        if (config) {
            config.resolve(value);
            setConfig(null);
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {config && createPortal(
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-modal-fade-in"
                    onClick={() => handleClose(false)}
                >
                    <div 
                        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal-scale-up relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-10">
                            <div className="flex items-center justify-center mb-8">
                                <div className={`p-5 rounded-[2rem] ${config.isDanger ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                    {config.isDanger ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-white text-center mb-3 tracking-tight tracking-[-0.02em]">{config.title}</h3>
                            <p className="text-slate-400 text-sm text-center leading-relaxed font-medium px-4">
                                {config.message}
                            </p>

                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleClose(false)}
                                    className="px-6 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {config.cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleClose(true)}
                                    className={`px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-[1.02] active:scale-95 ${
                                        config.isDanger 
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40' 
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                                    }`}
                                >
                                    {config.confirmText}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleClose(false)}
                            className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes modal-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modal-scale-up {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-fade-in {
                    animation: modal-fade-in 0.3s ease-out;
                }
                .animate-modal-scale-up {
                    animation: modal-scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </ConfirmContext.Provider>
    );
};
