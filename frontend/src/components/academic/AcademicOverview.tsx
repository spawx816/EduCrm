import { useState } from 'react';
import { useCohorts } from '../../hooks/useAcademic.ts';
import { Layers, Calendar, ArrowRight, UserPlus, GraduationCap } from 'lucide-react';
import { ProgramList } from './ProgramList.tsx';
import { CohortList } from './CohortList.tsx';
import type { AcademicProgram } from '../../types';

export function AcademicOverview() {
    const [view, setView] = useState<'overview' | 'program_detail' | 'all_programs'>('overview');
    const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);

    const { data: allCohorts, isLoading: loadingCohorts } = useCohorts(''); // Load all

    const recentCohorts = allCohorts?.slice(0, 6) || [];

    if (view === 'program_detail' && selectedProgram) {
        return <CohortList program={selectedProgram} onBack={() => setView('overview')} />;
    }

    if (view === 'all_programs') {
        return <ProgramList onSelectProgram={(p) => { setSelectedProgram(p); setView('program_detail'); }} />;
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white px-2 italic">Control <span className="text-blue-500">Académico</span></h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 px-2">Gestión de cohortes, programas y cronogramas</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setView('all_programs')}
                        className="bg-slate-900 border border-slate-800 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-blue-500/50 transition-all"
                    >
                        Ver Todos los Programas
                    </button>
                </div>
            </div>

            {/* Quick Stats or Metrics would go here */}

            {/* Recent/Pinned Cohorts */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Grupos Activos Recientes
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingCohorts ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-900/50 rounded-[2.5rem] animate-pulse" />)
                    ) : (
                        recentCohorts.map((cohort: any) => (
                            <div key={cohort.id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col h-full">
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <Layers className="w-32 h-32" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-900/30 truncate max-w-[150px]">
                                            {cohort.program_name}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors mb-4">{cohort.name}</h4>
                                    
                                    <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500">
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>Sincronizado</span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                // Need to find the program for this cohort to open CohortList correctly
                                                // For now, let's keep it simple or expand the API
                                                setSelectedProgram({ id: cohort.program_id, name: cohort.program_name } as any);
                                                // Actually we can't easily open CohortList without the full program object
                                                // Let's just go to all programs for now until we refine
                                                setView('all_programs');
                                            }}
                                            className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* All Programs Shortcut */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-30 pointer-events-none" />
                <GraduationCap className="w-16 h-16 text-indigo-500 mx-auto mb-6 opacity-30 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Explorar Oferta Académica</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 font-medium">Accede a la configuración detallada de módulos, precios, instructores y cohortes de cada programa.</p>
                <button 
                    onClick={() => setView('all_programs')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-indigo-900/40 hover:scale-105 active:scale-95"
                >
                    Ir al Catálogo de Programas
                </button>
            </div>
        </div>
    );
}
