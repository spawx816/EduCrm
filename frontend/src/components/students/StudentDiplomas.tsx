import { useStudentDiplomas } from '../../hooks/useDiplomas';
import { Award, Download, Loader2 } from 'lucide-react';
import apiClient from '../../lib/api-client';

interface StudentDiplomasProps {
    studentId: string;
}

export function StudentDiplomas({ studentId }: StudentDiplomasProps) {
    const { data: diplomas, isLoading } = useStudentDiplomas(studentId);

    const handleDownload = async (id: string) => {
        try {
            const response = await apiClient.get(`/students/diplomas/${id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `diploma-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading diploma:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!diplomas || diplomas.length === 0) {
        return (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 text-center">
                <Award className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No se han generado diplomas para este estudiante.</p>
                <p className="text-slate-600 text-xs mt-2 italic">Los diplomas se generan automáticamente al facturar "Derecho a Graduación".</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diplomas.map((diploma: any) => (
                <div key={diploma.id} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600/20 transition-colors">
                            <Award className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm tracking-tight">{diploma.course_name}</h4>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Generado: {new Date(diploma.issue_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleDownload(diploma.id)}
                        className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg border border-slate-700 hover:border-blue-500"
                        title="Descargar Diploma PDF"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
}
