import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartsProps {
    leadsByStage: { stage: string; count: string }[];
    studentsByProgram: { program: string; count: string }[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export function DashboardCharts({ leadsByStage, studentsByProgram }: ChartsProps) {
    const stageData = leadsByStage.map(s => ({ name: s.stage, value: parseInt(s.count) }));
    const programData = studentsByProgram.map(p => ({ name: p.program, value: parseInt(p.count) }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads by Stage - Funnel-like Bar Chart */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm min-h-[400px]">
                <h3 className="text-white font-bold mb-6 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Embudo de Ventas (Leads por Etapa)
                </h3>
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stageData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Students by Program - Pie Chart */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm min-h-[400px]">
                <h3 className="text-white font-bold mb-6 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Distribución de Alumnos por Programa
                </h3>
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={programData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {programData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
