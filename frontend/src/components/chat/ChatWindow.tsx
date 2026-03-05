import React, { useState, useEffect, useRef } from 'react';
import { Send, Smartphone, Instagram, Globe, Paperclip, Facebook } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ChatMessage } from '../../types';

interface ChatWindowProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    source: 'whatsapp' | 'instagram' | 'web' | 'facebook';
    name: string;
}

export function ChatWindow({ messages, onSendMessage, source, name }: ChatWindowProps) {
    const [content, setContent] = useState('');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSendMessage(content);
        setContent('');
    };

    const getSourceIcon = () => {
        switch (source) {
            case 'whatsapp': return <Smartphone className="w-4 h-4 text-emerald-500" />;
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
            default: return <Globe className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700 uppercase">
                        {name.substring(0, 2)}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-none mb-1">{name}</h3>
                        <div className="flex items-center space-x-1">
                            {getSourceIcon()}
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{source}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_type === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                }`}
                        >
                            {(msg.message_type === 'image' || msg.metadata?.message_type === 'image') && (
                                <div className="mb-2">
                                    {msg.metadata?.media?.base64 ? (
                                        <img
                                            src={`data:${msg.metadata.media.mimetype};base64,${msg.metadata.media.base64}`}
                                            alt="Chat attachment"
                                            className="rounded-lg max-h-64 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                                            onClick={() => setLightboxImage(`data:${msg.metadata.media.mimetype};base64,${msg.metadata.media.base64}`)}
                                        />
                                    ) : msg.metadata?.url ? (
                                        <img
                                            src={msg.metadata.url}
                                            alt="Chat attachment"
                                            className="rounded-lg max-h-64 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                                            onClick={() => setLightboxImage(msg.metadata.url)}
                                        />
                                    ) : (
                                        <div className="p-4 bg-slate-900/50 rounded-lg flex items-center justify-center border border-slate-700">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multimedia no disponible</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="leading-relaxed">{msg.content}</p>
                            <div className={`text-[9px] mt-1.5 opacity-50 font-bold ${msg.sender_type === 'user' ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white hover:text-blue-400 p-2">✕</button>
                    <img
                        src={lightboxImage}
                        className="max-w-full max-h-full rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
                        alt="Enlarged view"
                    />
                </div>
            )}

            {/* Footer */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => toast.success('Pronto: Carga de archivos multimedia')}
                        className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                        title="Adjuntar archivo"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
