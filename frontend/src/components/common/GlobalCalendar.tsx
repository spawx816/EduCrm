import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, GraduationCap, PartyPopper, Bell } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { apiClient } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    event_date: string;
    type: 'GRADUATION' | 'EVENT' | 'HOLIDAY';
    visibility: 'ALL' | 'TEACHERS' | 'STAFF';
}

interface GlobalCalendarProps {
    isAdmin?: boolean;
}

export function GlobalCalendar({ isAdmin = false }: GlobalCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        event_date: format(new Date(), 'yyyy-MM-dd'),
        type: 'EVENT',
        visibility: 'ALL'
    });

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/calendar');
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            toast.error('Error al cargar el calendario');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/calendar', newEvent);
            toast.success('Evento creado correctamente');
            setIsAddModalOpen(false);
            setNewEvent({
                title: '',
                description: '',
                event_date: format(new Date(), 'yyyy-MM-dd'),
                type: 'EVENT',
                visibility: 'ALL'
            });
            fetchEvents();
        } catch (error) {
            toast.error('Error al crear el evento');
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-6 py-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 rounded-t-[2.5rem]">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white leading-none uppercase tracking-tighter">Calendario Institucional</h2>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="ml-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nuevo Evento</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div className="grid grid-cols-7 bg-[#020617]/50 border-b border-slate-800">
                {days.map((day, i) => (
                    <div key={i} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const dayEvents = events.filter(e => isSameDay(parseISO(e.event_date), cloneDay));

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] p-2 border-r border-b border-slate-800/50 transition-all ${
                            !isSameMonth(day, monthStart) ? "bg-[#020617]/20 opacity-20" : ""
                        } ${isSameDay(day, new Date()) ? "bg-indigo-500/5" : ""}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : "text-slate-500"
                            }`}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {dayEvents.map(event => (
                                <div 
                                    key={event.id}
                                    className={`px-2 py-1.5 rounded-lg text-[9px] font-bold truncate transition-all cursor-pointer hover:scale-105 ${
                                        event.type === 'GRADUATION' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' :
                                        event.type === 'HOLIDAY' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/20' :
                                        'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                                    }`}
                                    title={`${event.title}: ${event.description}`}
                                >
                                    <div className="flex items-center space-x-1">
                                        {event.type === 'GRADUATION' && <GraduationCap className="w-2.5 h-2.5" />}
                                        {event.type === 'HOLIDAY' && <PartyPopper className="w-2.5 h-2.5" />}
                                        {event.type === 'EVENT' && <Bell className="w-2.5 h-2.5" />}
                                        <span className="truncate">{event.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-[#020617]/40">{rows}</div>;
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {/* Modal para añadir evento */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Plus className="w-6 h-6 text-blue-500" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Añadir Evento</h3>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEvent} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Título del Evento</label>
                                <input 
                                    required
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    placeholder="Ej. Ceremonia de Graduación"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Descripción</label>
                                <textarea 
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none h-24"
                                    placeholder="Detalles del evento..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Fecha</label>
                                    <input 
                                        required
                                        type="date"
                                        value={newEvent.event_date}
                                        onChange={e => setNewEvent({...newEvent, event_date: e.target.value})}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo</label>
                                    <select 
                                        value={newEvent.type}
                                        onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all uppercase"
                                    >
                                        <option value="EVENT">Evento General</option>
                                        <option value="GRADUATION">Graduación</option>
                                        <option value="HOLIDAY">Día Festivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Visibilidad</label>
                                <select 
                                    value={newEvent.visibility}
                                    onChange={e => setNewEvent({...newEvent, visibility: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all uppercase"
                                >
                                    <option value="ALL">Público (Todos)</option>
                                    <option value="TEACHERS">Solo Docentes</option>
                                    <option value="STAFF">Solo Administrativo (Oculto)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-900/40">
                                Guardar Evento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

