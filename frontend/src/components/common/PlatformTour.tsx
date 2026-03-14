import { useState, useEffect } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS } from 'react-joyride';
import { HelpCircle } from 'lucide-react';

interface PlatformTourProps {
    role: 'admin' | 'docente' | 'estudiante';
}

export function PlatformTour({ role }: PlatformTourProps) {
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);

    useEffect(() => {
        // Only run automatically once per session or use localStorage
        const hasSeenTour = localStorage.getItem(`tour_seen_${role}`);
        if (!hasSeenTour) {
            // setRun(true); // Uncomment to enable auto-run on first visit
        }

        const adminSteps: Step[] = [
            {
                target: '#tour-logo',
                content: '¡Bienvenido Administrador! Aquí puedes ver la identidad de tu institución.',
                disableBeacon: true,
            },
            {
                target: '#tour-nav-dashboard',
                content: 'El Dashboard te ofrece una vista rápida de métricas clave, como prospectos y estudiantes activos.',
            },
            {
                target: '#tour-nav-prospects',
                content: 'Aquí gestionas los nuevos leads. Puedes arrastrarlos entre etapas (Kanban) hasta que se inscriban.',
            },
            {
                target: '#tour-nav-students',
                content: 'Directorio completo de alumnos. Desde aquí puedes ver perfiles detallados, notas y asistencias.',
            },
            {
                target: '#tour-nav-academic',
                content: 'Configura tus programas de estudio (Carreras/Cursos) y las cohortes (grupos) activas.',
            },
            {
                target: '#tour-nav-billing',
                content: 'Módulo de finanzas. Gestiona facturas, cobros y métodos de pago de los alumnos.',
            },
            {
                target: '#tour-nav-payroll',
                content: 'Nómina Docente: Registra y descarga los comprobantes de pago para tus profesores.',
            },
            {
                target: '#tour-nav-settings',
                content: 'Configuración global: Logo de la empresa, colores de marca y gestión de otros usuarios admin.',
            },
            {
                target: '#tour-user-section',
                content: 'Tu perfil personal. Cambia tu foto, nombre y datos de contacto como administrador.',
            }
        ];

        const instructorSteps: Step[] = [
            {
                target: '#tour-instructor-academic',
                content: 'Vista Principal: Aquí verás todos los grupos que tienes asignados actualmente.',
                disableBeacon: true,
            },
            {
                target: '#tour-instructor-payments',
                content: 'Tus Pagos: Consulta tu historial de honorarios y descarga tus volantes de pago en PDF.',
            },
            {
                target: '#tour-instructor-profile',
                content: 'Mi Perfil: Mantén tu información de contacto actualizada para la institución.',
            }
        ];

        const studentSteps: Step[] = [
            {
                target: '#tour-student-progress',
                content: 'Mi Progreso: Revisa tus notas acumuladas, porcentaje de asistencia y módulos completados.',
                disableBeacon: true,
            },
            {
                target: '#tour-student-diplomas',
                content: 'Diplomas: Una vez finalices tus estudios, aquí podrás descargar tus certificados oficiales.',
            },
            {
                target: '#tour-student-profile',
                content: 'Mi Cuenta: Gestiona tu información personal y verifica el estado de seguridad de tu cuenta.',
            }
        ];

        if (role === 'admin') setSteps(adminSteps);
        else if (role === 'docente') setSteps(instructorSteps);
        else if (role === 'estudiante') setSteps(studentSteps);

    }, [role]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem(`tour_seen_${role}`, 'true');
        }
    };

    return (
        <>
            <button
                onClick={() => setRun(true)}
                className="fixed bottom-6 right-6 z-[60] p-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 group flex items-center space-x-2 px-4 shrink-0"
                title="Ayuda / Tour por la plataforma"
            >
                <HelpCircle className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
                    Tour de Ayuda
                </span>
            </button>

            <Joyride
                steps={steps}
                run={run}
                continuous
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        arrowColor: '#1e293b',
                        backgroundColor: '#1e293b',
                        overlayColor: 'rgba(2, 6, 23, 0.85)',
                        primaryColor: '#4f46e5',
                        textColor: '#f8fafc',
                        zIndex: 10000,
                    },
                    tooltipTitle: {
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '12px'
                    },
                    tooltipContent: {
                        fontSize: '14px',
                        color: '#94a3b8'
                    },
                    buttonNext: {
                        borderRadius: '12px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        padding: '12px 20px',
                        letterSpacing: '0.1em'
                    },
                    buttonBack: {
                        color: '#94a3b8',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em'
                    },
                    buttonSkip: {
                        color: '#64748b',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        letterSpacing: '0.1em'
                    }
                }}
                locale={{
                    back: 'Atrás',
                    close: 'Cerrar',
                    last: 'Finalizar',
                    next: 'Siguiente',
                    skip: 'Saltar Tour'
                }}
            />
        </>
    );
}
