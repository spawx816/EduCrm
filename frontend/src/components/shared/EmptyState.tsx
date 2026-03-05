import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500 mb-6 border border-slate-700/50 shadow-inner">
                <Icon className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs mb-8 font-medium">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-wider"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
