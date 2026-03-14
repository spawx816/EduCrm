import { useEffect } from 'react';
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from 'lucide-react';

interface PlatformTourProps {
    role: 'admin' | 'docente' | 'estudiante';
}

export function PlatformTour({ role }: PlatformTourProps) {
    
    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            doneBtnText: 'Finalizar',
            allowClose: true,
            overlayColor: 'rgba(2, 6, 23, 0.85)',
            steps: getSteps(),
            onDestroyed: () => {
                localStorage.setItem(`tour_seen_${role}`, 'true');
            }
        });

        driverObj.drive();
    };

    const getSteps = (): DriveStep[] => {
        if (role === 'admin') {
            return [
                {
                    element: '#tour-logo',
                    popover: {
                        title: 'INSTITUCIÓN',
                        description: '¡Bienvenido Administrador! Aquí puedes ver la identidad de tu institución.',
                        side: "bottom" as any,
                        align: 'start'
                    }
                },
                {
                    element: '#tour-nav-dashboard',
                    popover: {
                        title: 'DASHBOARD',
                        description: 'El Dashboard te ofrece una vista rápida de métricas clave, como prospectos y estudiantes activos.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-nav-prospects',
                    popover: {
                        title: 'PROSPECTOS (LEADS)',
                        description: 'Aquí gestionas los nuevos leads. Puedes arrastrarlos entre etapas hasta que se inscriban.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-nav-students',
                    popover: {
                        title: 'DIRECTORIO',
                        description: 'Directorio completo de alumnos. Desde aquí puedes ver perfiles, notas y asistencias.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-nav-academic',
                    popover: {
                        title: 'ACADÉMICO',
                        description: 'Configura tus programas de estudio y las cohortes (grupos) activas.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-nav-billing',
                    popover: {
                        title: 'FACTURACIÓN',
                        description: 'Módulo de finanzas. Gestiona facturas y métodos de pago de los alumnos.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-nav-payroll',
                    popover: {
                        title: 'NÓMINA DOCENTE',
                        description: 'Registra y descarga los comprobantes de pago para tus profesores.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-nav-settings',
                    popover: {
                        title: 'CONFIGURACIÓN',
                        description: 'Configuración global: Logo, colores y gestión de otros usuarios admin.',
                        side: "right" as any
                    }
                },
                {
                    element: '#tour-user-section',
                    popover: {
                        title: 'TU PERFIL',
                        description: 'Tu perfil personal como administrador. Cambia tus datos de contacto aquí.',
                        side: "top" as any
                    }
                }
            ];
        } else if (role === 'docente') {
            return [
                {
                    element: '#tour-instructor-academic',
                    popover: {
                        title: 'MIS CURSOS',
                        description: 'Aquí verás todos los grupos que tienes asignados actualmente.',
                        side: "bottom"
                    }
                },
                {
                    element: '#tour-instructor-payments',
                    popover: {
                        title: 'MIS PAGOS',
                        description: 'Consulta tu historial de honorarios y descarga tus comprobantes en PDF.',
                        side: "bottom"
                    }
                },
                {
                    element: '#tour-instructor-profile',
                    popover: {
                        title: 'MI PERFIL',
                        description: 'Mantén tu información de contacto actualizada para la institución.',
                        side: "bottom"
                    }
                }
            ];
        } else {
            return [
                {
                    element: '#tour-student-progress',
                    popover: {
                        title: 'MI PROGRESO',
                        description: 'Revisa tus notas, porcentaje de asistencia y módulos completados.',
                        side: "bottom"
                    }
                },
                {
                    element: '#tour-student-diplomas',
                    popover: {
                        title: 'DIPLOMAS',
                        description: 'Descarga tus certificados una vez finalices tus estudios.',
                        side: "bottom"
                    }
                },
                {
                    element: '#tour-student-profile',
                    popover: {
                        title: 'MI CUENTA',
                        description: 'Gestiona tu información personal y verifica la seguridad de tu portal.',
                        side: "bottom"
                    }
                }
            ];
        }
    };

    useEffect(() => {
        const hasSeenTour = localStorage.getItem(`tour_seen_${role}`);
        if (!hasSeenTour) {
            // startTour(); // Uncomment to enable auto-run
        }
    }, [role]);

    return (
        <button
            onClick={startTour}
            className="fixed bottom-6 right-6 z-[60] p-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 group flex items-center space-x-2 px-4 shrink-0"
            title="Ayuda / Tour por la plataforma"
        >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
                ¿Cómo funciona?
            </span>
        </button>
    );
}
