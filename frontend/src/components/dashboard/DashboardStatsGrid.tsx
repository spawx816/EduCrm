import { TrendingUp, Target, CircleDollarSign } from 'lucide-react';

interface StatsProps {
    summary: {
        revenue30d: number;
        totalExpenses: number;
        netProfit: number;
        newLeads7d: number;
        totalStudents: number;
        pendingRevenue: number;
    };
}

export function DashboardStatsGrid({ summary }: StatsProps) {
    const cards = [
        {
            title: 'Ingresos (30d)',
            value: `RD$${summary.revenue30d.toLocaleString()}`,
            icon: CircleDollarSign,
            color: 'bg-emerald-500/10 text-emerald-500',
            label: 'Pagos recibidos'
        },
        {
            title: 'Egresos (30d)',
            value: `RD$${summary.totalExpenses.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-rose-500/10 text-rose-500',
            label: 'Gastos + Nómina'
        },
        {
            title: 'Utilidad Neta',
            value: `RD$${summary.netProfit.toLocaleString()}`,
            icon: Target,
            color: summary.netProfit >= 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500',
            label: 'Ganancia real'
        },
        {
            title: 'Cartera Pendiente',
            value: `RD$${summary.pendingRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-amber-500/10 text-amber-500',
            label: 'Por cobrar'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, i) => (
                <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                    </div>
                    <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                    <p className="text-slate-500 text-[10px] font-medium">{card.label}</p>
                </div>
            ))}
        </div>
    );
}
