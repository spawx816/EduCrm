import React, { useState, useEffect } from 'react';
import { Search, Printer, Grid, List as ListIcon, RefreshCw } from 'lucide-react';
import apiClient, { getStaticUrl } from '../../lib/api-client';
import { StudentIDCard } from './StudentIDCard';

export const StudentCardsManager: React.FC = () => {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedCard, setSelectedCard] = useState<any | null>(null);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/student-cards');
            setCards(res.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const filteredCards = cards.filter(card =>
        card.student_name.toLowerCase().includes(filter.toLowerCase()) ||
        card.matricula.toLowerCase().includes(filter.toLowerCase()) ||
        card.program_name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#0f172a] text-white">
            <header className="h-20 shrink-0 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                        <Printer className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none">Carnetización</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Identificaciones</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchCards}
                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700"
                        title="Refrescar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-700">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                {/* Search and Filters */}
                <div className="mb-10 relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, matrícula o programa..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-slate-700 rounded-[2rem] text-lg focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-600 text-white shadow-2xl"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                        <Printer className="w-20 h-20 mb-6 opacity-20" />
                        <p className="text-xl font-bold italic">No se encontraron carnets generados</p>
                    </div>
                ) : (
                    <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"}>
                        {filteredCards.map((card) => (
                            <div
                                key={card.id}
                                className={`bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/80 transition-all cursor-pointer group relative overflow-hidden ${view === 'list' ? 'flex items-center space-x-4' : ''}`}
                                onClick={() => setSelectedCard(card)}
                            >
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className={`aspect-[3/4] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-xl ${view === 'list' ? 'w-16 h-20 shrink-0' : 'mb-6'}`}>
                                    {card.avatar_url ? (
                                        <img
                                            src={getStaticUrl(`/uploads/students/avatars/${card.avatar_url}`)}
                                            alt={card.student_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[#1e3a8a]">
                                            <Printer className="w-1/2 h-1/2 opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-white truncate group-hover:text-blue-400 transition-colors uppercase leading-tight">
                                        {card.student_name}
                                    </h3>
                                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                        {card.program_name}
                                    </p>
                                    <div className="mt-4 flex flex-col space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            <span>ID</span>
                                            <span className="text-slate-300">{card.matricula}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            <span>Cohorte</span>
                                            <span className="text-slate-300 truncate ml-2">{card.cohort_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {selectedCard && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setSelectedCard(null)} />
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-h-full overflow-y-auto relative z-10 shadow-3xl shadow-blue-900/20 max-w-md w-full">
                        <button
                            onClick={() => setSelectedCard(null)}
                            className="absolute top-8 right-8 p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <Grid className="w-6 h-6 rotate-45" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white leading-none">Vista Previa</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 px-1">Diseño de Carnet Estudiantil</p>
                        </div>

                        <StudentIDCard card={selectedCard} />
                    </div>
                </div>
            )}
        </div>
    );
};
