import { useState } from 'react';
import { Layers, ArrowRight, GraduationCap, Search, BookOpen, Clock } from 'lucide-react';
import { useCohorts, usePrograms } from '../../hooks/useAcademic.ts';
import { ProgramList } from './ProgramList.tsx';
import { CohortList } from './CohortList.tsx';
import type { AcademicProgram } from '../../types';

export function AcademicOverview({ onSelectStudent }: { onSelectStudent: (id: string) => void }) {
    const [view, setView] = useState<'overview' | 'program_detail' | 'all_programs'>('overview');
    const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
    const [jumpInfo, setJumpInfo] = useState<{ cohortId: string; mode: any } | null>(null);
    const [searchProgram, setSearchProgram] = useState('');
    
    const { data: programs, isLoading: loadingPrograms } = usePrograms();
    const { data: allCohorts, isLoading: loadingCohorts } = useCohorts(''); 

    const recentCohorts = allCohorts?.slice(0, 4) || [];
    const filteredPrograms = programs?.filter(p => p.name.toLowerCase().includes(searchProgram.toLowerCase())) || [];

    if (view === 'program_detail' && selectedProgram) {
        return (
            <CohortList 
                program={selectedProgram} 
                onBack={() => { setView('overview'); setJumpInfo(null); }} 
                onSelectStudent={onSelectStudent}
                initialCohortId={jumpInfo?.cohortId}
                initialMode={jumpInfo?.mode}
            />
        );
    }

    if (view === 'all_programs') {
        return <ProgramList onSelectProgram={(p) => { setSelectedProgram(p); setView('program_detail'); }} />;
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header section with Glassmorphism */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white italic tracking-tight leading-none mb-4">
                        Centro <span className="text-blue-500">Académico</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Organización por programas, cohortes y oferta educativa</p>
                </div>
                
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Buscar programa académico..."
                        value={searchProgram}
                        onChange={(e) => setSearchProgram(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all shadow-2xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Left Column: Programs Grid */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                            <BookOpen className="w-4 h-4 mr-3 text-blue-500" /> Catálogo de Programas
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {loadingPrograms ? (
                             Array(6).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-900/50 rounded-[2.5rem] animate-pulse" />)
                        ) : (
                            filteredPrograms.map((program) => (
                                <div key={program.id} className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-8 hover:border-blue-500/40 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full shadow-2xl shadow-black/20" onClick={() => { setSelectedProgram(program); setView('program_detail'); }}>
                                    <div className="absolute -right-6 -top-6 opacity-[0.02] group-hover:scale-125 transition-transform duration-700">
                                        <GraduationCap className="w-40 h-40" />
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl shadow-blue-900/10">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors mb-3">{program.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose line-clamp-3">{program.description || 'Sin descripción detallada disponible para este programa académico.'}</p>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activo</span>
                                            </div>
                                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Mini Activity Feed */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="flex items-center space-x-3 px-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Acesso Rápido</h3>
                    </div>

                    <div className="space-y-4">
                        {loadingCohorts ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-900/50 rounded-3xl animate-pulse" />)
                        ) : (
                            recentCohorts.map((cohort: any) => (
                                <div key={cohort.id} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl hover:border-emerald-500/40 transition-all group shadow-lg">
                                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1 truncate">{cohort.program_name}</p>
                                    <h5 className="text-xs font-black text-white mb-4 line-clamp-1">{cohort.name}</h5>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProgram({ id: cohort.program_id, name: cohort.program_name } as any);
                                                setJumpInfo({ cohortId: cohort.id, mode: 'attendance' });
                                                setView('program_detail');
                                            }}
                                            className="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600/20 text-slate-500 hover:text-blue-400 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all border border-slate-800"
                                        >
                                            Asistencia
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProgram({ id: cohort.program_id, name: cohort.program_name } as any);
                                                setJumpInfo({ cohortId: cohort.id, mode: 'grades' });
                                                setView('program_detail');
                                            }}
                                            className="flex-1 py-2.5 bg-slate-900 hover:bg-amber-600/20 text-slate-500 hover:text-amber-500 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all border border-slate-800"
                                        >
                                            Grados
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        <button 
                            onClick={() => setView('all_programs')}
                            className="w-full py-5 mt-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-white rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
                        >
                            Catálogo Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
