import { useState, useEffect } from 'react';
import { useCreateExam, useUpdateExam, useAddQuestion, useUpdateQuestion, useDeleteQuestion, useExamDetail } from '../../hooks/useExams';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Plus, Trash2, HelpCircle, CheckCircle, Image as ImageIcon, Save, Edit2, Layers, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExamBuilderProps {
    moduleId: string;
    onBack: () => void;
    examId?: string;
}

export function ExamBuilder({ moduleId, onBack, examId }: ExamBuilderProps) {
    const { user } = useAuth();
    const { data: existingExam, isLoading: loadingExam } = useExamDetail(examId);

    const createExamMutation = useCreateExam();
    const updateExamMutation = useUpdateExam();
    const addQuestionMutation = useAddQuestion();
    const updateQuestionMutation = useUpdateQuestion();
    const deleteQuestionMutation = useDeleteQuestion();

    const [currentExamId, setCurrentExamId] = useState<string | null>(examId || null);
    const [header, setHeader] = useState({ title: '', description: '', timeLimit: '60', passingScore: '60' });
    const [editingQuestion, setEditingQuestion] = useState<any>(null); // For the modal/form
    const [showQuestionForm, setShowQuestionForm] = useState(false);

    useEffect(() => {
        if (existingExam) {
            setHeader({
                title: existingExam.title,
                description: existingExam.description || '',
                timeLimit: String(existingExam.time_limit_minutes),
                passingScore: String(existingExam.passing_score)
            });
        }
    }, [existingExam]);

    const handleSaveHeader = async () => {
        if (!header.title) {
            toast.error('El título es obligatorio');
            return;
        }

        try {
            if (currentExamId) {
                await updateExamMutation.mutateAsync({
                    id: currentExamId,
                    data: {
                        title: header.title,
                        description: header.description,
                        time_limit_minutes: parseInt(header.timeLimit),
                        passing_score: parseFloat(header.passingScore)
                    }
                });
                toast.success('Cabecera actualizada');
            } else {
                const res = await createExamMutation.mutateAsync({
                    module_id: moduleId,
                    title: header.title,
                    description: header.description,
                    time_limit_minutes: parseInt(header.timeLimit),
                    passing_score: parseFloat(header.passingScore),
                    created_by: user?.id
                });
                setCurrentExamId(res.id);
                toast.success('Examen creado. ¡Añade preguntas!');
            }
        } catch (error) {
            toast.error('Error al guardar cabecera');
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar esta pregunta?')) return;
        try {
            await deleteQuestionMutation.mutateAsync({ id, examId: currentExamId! });
            toast.success('Pregunta eliminada');
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    if (loadingExam) return <div className="p-20 text-center animate-pulse text-indigo-500 font-black uppercase tracking-widest text-[10px]">Cargando detalles del examen...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            {/* Navigation & Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl transition-all group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            {currentExamId ? 'Editando Examen' : 'Nuevo Examen'}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración y banco de preguntas</p>
                    </div>
                </div>
                {currentExamId && (
                    <button
                        onClick={() => {
                            setEditingQuestion({
                                text: '',
                                type: 'MULTIPLE_CHOICE',
                                points: '1',
                                image_url: '',
                                options: [{ text: '', is_correct: false }, { text: '', is_correct: false }]
                            });
                            setShowQuestionForm(true);
                        }}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Pregunta</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Header Config */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-6 sticky top-8">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-4 flex items-center">
                            <Save className="w-4 h-4 mr-2 text-indigo-500" /> Cabecera
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block px-1">Título</label>
                                <input
                                    type="text"
                                    value={header.title}
                                    onChange={(e) => setHeader({ ...header, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block px-1">Descripción</label>
                                <textarea
                                    value={header.description}
                                    onChange={(e) => setHeader({ ...header, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none h-20 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block px-1">Tiempo (min)</label>
                                    <input
                                        type="number"
                                        value={header.timeLimit}
                                        onChange={(e) => setHeader({ ...header, timeLimit: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block px-1">Nota Apueb (%)</label>
                                    <input
                                        type="number"
                                        value={header.passingScore}
                                        onChange={(e) => setHeader({ ...header, passingScore: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveHeader}
                                className="w-full py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all mt-4"
                            >
                                {currentExamId ? 'Actualizar Cabecera' : 'Crear y Continuar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Question List */}
                <div className="lg:col-span-8 space-y-6">
                    {!currentExamId ? (
                        <div className="bg-slate-900/30 border border-dashed border-slate-800 p-20 rounded-[3rem] text-center">
                            <Layers className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-500">Primero configura la cabecera para empezar a añadir preguntas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center px-2">
                                <HelpCircle className="w-4 h-4 mr-2 text-indigo-500" /> Banco de Preguntas ({existingExam?.questions?.length || 0})
                            </h3>
                            {existingExam?.questions?.map((q: any, idx: number) => (
                                <div key={q.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex items-start justify-between group hover:border-indigo-500/30 transition-all">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[8px] font-black uppercase text-slate-500">
                                                {q.type}
                                            </span>
                                            {q.image_url && <ImageIcon className="w-3.5 h-3.5 text-amber-500" />}
                                            <span className="text-[10px] font-bold text-indigo-400">
                                                {q.points} pts
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-white line-clamp-2">{q.text}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => {
                                                setEditingQuestion({
                                                    ...q,
                                                    points: String(q.points),
                                                    options: q.options.map((o: any) => ({ ...o }))
                                                });
                                                setShowQuestionForm(true);
                                            }}
                                            className="p-2 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white hover:bg-indigo-600 rounded-xl transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(q.id)}
                                            className="p-2 bg-slate-950 border border-slate-800 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!existingExam?.questions || existingExam.questions.length === 0) && (
                                <div className="py-20 text-center opacity-30 border border-dashed border-slate-800 rounded-[2.5rem]">
                                    <Plus className="w-10 h-10 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Aclm: ¡Añade tu primera pregunta!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Question Form Modal */}
            {showQuestionForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Editor de Pregunta</h3>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Personaliza el enunciado y las opciones</p>
                            </div>
                            <button onClick={() => setShowQuestionForm(false)} className="p-3 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 rounded-2xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Question Content */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block px-1">Enunciado</label>
                                        <textarea
                                            value={editingQuestion.text}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                            placeholder="¿Cuál es la capital de...?"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500 outline-none h-32 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block px-1 mb-2">Tipo</label>
                                            <select
                                                value={editingQuestion.type}
                                                onChange={(e) => {
                                                    const type = e.target.value;
                                                    let options = [...editingQuestion.options];
                                                    if (type === 'TRUE_FALSE') {
                                                        options = [{ text: 'Verdadero', is_correct: true }, { text: 'Falso', is_correct: false }];
                                                    } else if (type === 'MATCHING' && options.length < 2) {
                                                        options = [{ text: '', match_text: '' }, { text: '', match_text: '' }];
                                                    }
                                                    setEditingQuestion({ ...editingQuestion, type, options });
                                                }}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-white outline-none focus:border-indigo-500"
                                            >
                                                <option value="MULTIPLE_CHOICE">OPCIÓN MÚLTIPLE</option>
                                                <option value="TRUE_FALSE">FALSO / VERDADERO</option>
                                                <option value="MATCHING">EMPAREJAMIENTO (MATCH)</option>
                                                <option value="OPEN">RESPUESTA ABIERTA</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block px-1 mb-2">Puntos</label>
                                            <input
                                                type="number"
                                                value={editingQuestion.points}
                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, points: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 text-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block px-1 flex items-center justify-between">
                                            <span>Imagen de apoyo (URL)</span>
                                            <ImageIcon className="w-3.5 h-3.5" />
                                        </label>
                                        <input
                                            type="text"
                                            value={editingQuestion.image_url || ''}
                                            onChange={(e) => setEditingQuestion({ ...editingQuestion, image_url: e.target.value })}
                                            placeholder="https://servidor.com/imagen.jpg"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                                        />
                                        {editingQuestion.image_url && (
                                            <div className="mt-2 rounded-2xl overflow-hidden border border-slate-800 h-32 bg-slate-950">
                                                <img src={editingQuestion.image_url} alt="Vista previa" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Answers Config */}
                                <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-indigo-500" />
                                        {editingQuestion.type === 'MATCHING' ? 'Configurar Pares' : 'Configurar Opciones'}
                                    </h4>

                                    <div className="space-y-4">
                                        {editingQuestion.options.map((opt: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    {editingQuestion.type !== 'MATCHING' && (
                                                        <input
                                                            type="checkbox"
                                                            checked={opt.is_correct}
                                                            onChange={(e) => {
                                                                const newOpts = [...editingQuestion.options];
                                                                // Single choice logic for simplicity if needed, but MULTIPLE_CHOICE implies multiple
                                                                newOpts[idx].is_correct = e.target.checked;
                                                                setEditingQuestion({ ...editingQuestion, options: newOpts });
                                                            }}
                                                            className="w-5 h-5 rounded-lg border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                                                        />
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={opt.text}
                                                        onChange={(e) => {
                                                            const newOpts = [...editingQuestion.options];
                                                            newOpts[idx].text = e.target.value;
                                                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                                                        }}
                                                        placeholder={editingQuestion.type === 'MATCHING' ? `Premisa ${idx + 1}` : `Opción ${idx + 1}`}
                                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500"
                                                    />
                                                    {editingQuestion.type === 'MULTIPLE_CHOICE' && editingQuestion.options.length > 2 && (
                                                        <button onClick={() => {
                                                            const newOpts = editingQuestion.options.filter((_: any, i: number) => i !== idx);
                                                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                                                        }} className="text-rose-500 p-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                {editingQuestion.type === 'MATCHING' && (
                                                    <div className="pl-8">
                                                        <input
                                                            type="text"
                                                            value={opt.match_text || ''}
                                                            onChange={(e) => {
                                                                const newOpts = [...editingQuestion.options];
                                                                newOpts[idx].match_text = e.target.value;
                                                                setEditingQuestion({ ...editingQuestion, options: newOpts });
                                                            }}
                                                            placeholder="Respuesta que encaja..."
                                                            className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-2 text-[11px] text-indigo-400 placeholder:text-indigo-900 border-dashed"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {editingQuestion.type === 'MULTIPLE_CHOICE' && (
                                            <button
                                                onClick={() => setEditingQuestion({ ...editingQuestion, options: [...editingQuestion.options, { text: '', is_correct: false }] })}
                                                className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Añadir Opción
                                            </button>
                                        )}
                                        {editingQuestion.type === 'MATCHING' && (
                                            <button
                                                onClick={() => setEditingQuestion({ ...editingQuestion, options: [...editingQuestion.options, { text: '', match_text: '' }] })}
                                                className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Añadir Par de Emparejamiento
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-4">
                            <button onClick={() => setShowQuestionForm(false)} className="px-8 py-3 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (!editingQuestion.text) return toast.error('El enunciado es obligatorio');
                                    if (editingQuestion.type !== 'OPEN' && editingQuestion.options.some((o: any) => !o.text)) return toast.error('Completa todas las opciones');
                                    if ((editingQuestion.type === 'MULTIPLE_CHOICE' || editingQuestion.type === 'TRUE_FALSE') && !editingQuestion.options.some((o: any) => o.is_correct)) {
                                        return toast.error('Marca la respuesta correcta');
                                    }
                                    if (editingQuestion.type === 'MATCHING' && editingQuestion.options.some((o: any) => !o.match_text)) {
                                        return toast.error('Configura todos los pares de emparejamiento');
                                    }

                                    try {
                                        if (editingQuestion.id) {
                                            await updateQuestionMutation.mutateAsync({
                                                id: editingQuestion.id,
                                                examId: currentExamId!,
                                                data: { ...editingQuestion, points: parseFloat(editingQuestion.points) }
                                            });
                                            toast.success('Pregunta actualizada');
                                        } else {
                                            await addQuestionMutation.mutateAsync({
                                                examId: currentExamId!,
                                                data: { ...editingQuestion, points: parseFloat(editingQuestion.points) }
                                            });
                                            toast.success('Pregunta añadida');
                                        }
                                        setShowQuestionForm(false);
                                    } catch (e) {
                                        toast.error('Error al guardar pregunta');
                                    }
                                }}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <Save className="w-4 h-4 mr-2 inline-block" /> Guardar Pregunta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
