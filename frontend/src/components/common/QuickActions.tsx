import { useState } from 'react';
import { PlusCircle, Users, GraduationCap, Receipt, X, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
    onAction: (tab: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { id: 'students', label: 'Nuevo Estudiante', icon: GraduationCap, color: 'bg-indigo-600' },
        { id: 'prospects', label: 'Nuevo Prospecto', icon: Users, color: 'bg-blue-600' },
        { id: 'billing', label: 'Registrar Cobro', icon: Receipt, color: 'bg-emerald-600' },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[90]">
            {isOpen && (
                <div className="mb-4 flex flex-col items-end space-y-3 animate-in slide-in-from-bottom-5 duration-300">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => {
                                onAction(action.id);
                                setIsOpen(false);
                            }}
                            className="flex items-center space-x-3 group"
                        >
                            <span className="bg-[#0f172a] border border-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                {action.label}
                            </span>
                            <div className={`${action.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/20 hover:scale-110 active:scale-95 transition-all`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ease-spring ${
                    isOpen ? 'bg-slate-800 rotate-45' : 'bg-blue-600 shadow-blue-900/40'
                }`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <PlusCircle className="w-8 h-8" />}
            </button>
        </div>
    );
}
