import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Smartphone, Instagram, Globe, MessageSquare, Search, Filter, Facebook } from 'lucide-react';
import apiClient from '../lib/api-client';
import type { ChatConversation, ChatMessage } from '../types';
import { ChatWindow } from '../components/chat/ChatWindow';

export function ChatInbox() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchConversations();
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const newSocket = io(apiBaseUrl);
        setSocket(newSocket);

        newSocket.on('inbox_update', () => {
            fetchConversations();
        });

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: ChatMessage) => {
            if (selectedConv && msg.conversation_id === selectedConv.id) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === msg.id);
                    if (exists) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.on('new_message', handleNewMessage);

        if (selectedConv) {
            fetchMessages(selectedConv.id);
            socket.emit('join_conversation', selectedConv.id);
        }

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [selectedConv, socket]);

    const fetchConversations = async () => {
        try {
            const { data } = await apiClient.get('/integrations/conversations');
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            const { data } = await apiClient.get(`/integrations/conversations/${id}/messages`);
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages', err);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedConv) return;
        try {
            await apiClient.post(`/integrations/conversations/${selectedConv.id}/reply`, {
                content,
                userId: '15474f88-466d-495c-9c90-09b69b52a784' // System Admin ID
            });
        } catch (err) {
            console.error('Error sending message', err);
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'whatsapp': return <Smartphone className="w-4 h-4 text-emerald-500" />;
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
            default: return <Globe className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
            <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full justify-between">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3 text-blue-500" />
                    Bandeja de Entrada Unificada
                </h1>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden px-3 items-center">
                        <Search className="w-4 h-4 text-slate-500 mr-2" />
                        <input type="text" placeholder="Buscar conversación..." className="bg-transparent border-none text-xs text-white py-2 focus:outline-none w-48" />
                    </div>
                    <button className="p-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Sidebar: Conversations List */}
                <div className="w-80 flex flex-col gap-4 shrink-0">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-900/50 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : !Array.isArray(conversations) || conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">No hay conversaciones</p>
                                <p className="text-[10px] mt-2 leading-relaxed opacity-60">Los mensajes de WhatsApp e Instagram aparecerán aquí automáticamente.</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`w-full p-4 rounded-2xl border transition-all flex flex-col text-left group
                    ${selectedConv?.id === conv.id
                                            ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${conv.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedConv?.id === conv.id ? 'text-blue-400' : 'text-slate-500'}`}>
                                                {conv.source}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-bold">
                                            {new Date(conv.last_message_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 group-hover:scale-110 transition-transform">
                                            {(conv.first_name || 'U').substring(0, 1)}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className={`text-sm font-bold truncate ${selectedConv?.id === conv.id ? 'text-white' : 'text-slate-300'}`}>
                                                {conv.first_name} {conv.last_name}
                                            </h4>
                                            <div className="flex items-center mt-1">
                                                {getSourceIcon(conv.source)}
                                                <span className="text-[10px] text-slate-500 ml-1.5 truncate">
                                                    {conv.external_id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1">
                    {selectedConv ? (
                        <ChatWindow
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            source={selectedConv.source}
                            name={`${selectedConv.first_name || ''} ${selectedConv.last_name || ''}`}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 p-12 text-center">
                            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight mb-2">Selecciona una conversación</h3>
                            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                                Gestiona todas las respuestas para prospectos y alumnos desde un solo lugar.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
