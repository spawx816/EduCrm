import React, { useRef } from 'react';
import { User, Printer } from 'lucide-react';
import { getStaticUrl } from '../../lib/api-client';

interface StudentCardProps {
    card: {
        student_name: string;
        matricula: string;
        program_name: string;
        cohort_name: string;
        avatar_url?: string;
    };
}

export const StudentIDCard: React.FC<StudentCardProps> = ({ card }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;

        if (printContent) {
            const printWindow = window.open('', '_blank');
            printWindow?.document.write(`
            <html>
                <head>
                    <title>Carnet - ${card.student_name}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                    ${printContent}
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
            printWindow?.document.close();
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div
                ref={printRef}
                className="w-[320px] h-[500px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative font-sans border border-slate-200"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 50%, #1e3a8a 50%, #1e3a8a 100%)'
                }}
            >
                {/* Top Header */}
                <div className="h-[250px] flex flex-col items-center pt-8 px-6 bg-white relative">
                    <div className="flex flex-col items-center mb-6 w-full">
                        <img src="/logo_enaa_carnet.png" alt="ENAA" className="w-full max-h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>

                    {/* Photo Placeholder/Avatar */}
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center relative z-10 box-content">
                        {card.avatar_url ? (
                            <img
                                src={getStaticUrl(`/uploads/students/avatars/${card.avatar_url}`)}
                                alt={card.student_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-slate-300" />
                        )}
                    </div>

                    {/* Decorative Orange Arc */}
                    <div className="absolute left-[-20px] top-[140px] w-20 h-20 border-[6px] border-orange-500 rounded-full opacity-80" />
                </div>

                {/* Bottom Section */}
                <div className="flex-1 flex flex-col items-center pt-10 px-6 text-center space-y-4">
                    {/* Program Badge */}
                    <div className="bg-[#f97316] text-white px-8 py-2 rounded-full shadow-lg transform -skew-x-6">
                        <span className="text-xs font-black tracking-widest uppercase italic">
                            {card.program_name}
                        </span>
                    </div>

                    {/* Role Header */}
                    <h1 className="text-white text-3xl font-black tracking-widest uppercase">
                        STUDENT
                    </h1>

                    {/* Student Info */}
                    <div className="space-y-1">
                        <p className="text-white text-lg font-bold uppercase tracking-tight">
                            {card.student_name}
                        </p>
                        <div className="flex flex-col space-y-0.5">
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">
                                Cohorte: {card.cohort_name}
                            </p>
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest text-center mt-0.5">
                                ID: {card.matricula}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Dark Corner Decor */}
                <div className="absolute top-0 right-[-40px] w-40 h-40 bg-[#0f172a] rounded-full -translate-y-20 translate-x-10" />
            </div>

            <div className="flex space-x-3 mt-6">
                <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all font-bold"
                >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Carnet</span>
                </button>
            </div>
        </div>
    );
};
