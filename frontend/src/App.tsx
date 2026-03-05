import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import { StudentList } from './components/students/StudentList.tsx';
import { BillingDashboard } from './components/billing/BillingDashboard.tsx';
import { DashboardOverview } from './pages/DashboardOverview.tsx';
import { StudentProfile } from './pages/StudentProfile.tsx';
import { PublicLeadForm } from './pages/PublicLeadForm.tsx';
import { IntegrationsPage } from './pages/IntegrationsPage.tsx';
import { ProgramList } from './components/academic/ProgramList.tsx';
import { CohortList } from './components/academic/CohortList.tsx';
import type { AcademicProgram } from './types/index.ts';
import { PortalLogin } from './pages/PortalLogin.tsx';
import { PortalMain } from './pages/PortalMain.tsx';
import { usePortalAuth, PortalProvider } from './hooks/usePortal.tsx';
import { LeadInboxList } from './components/students/LeadInboxList.tsx';
import { useAuth, AuthProvider } from './hooks/useAuth.tsx';
import { InstructorMain } from './pages/InstructorMain.tsx';
import { Login } from './pages/Login.tsx';
import { Users, GraduationCap, Menu, X, Receipt, BarChart3, Link, Wallet, Package, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { InstructorPayrollManager } from './components/academic/InstructorPayrollManager.tsx';
import { ChatInbox } from './pages/ChatInbox.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

import { InventoryManager } from './components/billing/InventoryManager.tsx';
import { ExpenseManager } from './components/billing/ExpenseManager.tsx';
import apiClient, { getStaticUrl } from './lib/api-client';

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prospects' | 'students' | 'academic' | 'billing' | 'student_profile' | 'integrations' | 'payroll' | 'chat' | 'inventory' | 'expenses' | 'settings'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // ADDED useAuth to get the current user

  type NavItemType = {
    id: string;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
  };

  const navItems: NavItemType[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'prospects', label: 'Prospectos / Leads', icon: Users },
    { id: 'students', label: 'Directorio Estudiantes', icon: GraduationCap },
    { id: 'academic', label: 'Académico', icon: GraduationCap },
    { id: 'billing', label: 'Facturación', icon: Receipt },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'expenses', label: 'Gastos', icon: Wallet, adminOnly: true },
    { id: 'integrations', label: 'Integraciones', icon: Link },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon, adminOnly: true },
  ];


  const [pendingLeadsCount, setPendingLeadsCount] = useState(0);

  useEffect(() => {
    const fetchLeadCount = async () => {
      try {
        const res = await apiClient.get('/leads');
        setPendingLeadsCount(res.data.length);
      } catch (error) {
        console.error('Error fetching leads count:', error);
      }
    };

    // Fetch initially
    fetchLeadCount();

    // Refresh every 30 seconds since this is the global layout
    const interval = setInterval(fetchLeadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    setActiveTab('student_profile');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'student_profile':
        return selectedStudentId ? (
          <StudentProfile
            studentId={selectedStudentId}
            onBack={() => setActiveTab('students')}
          />
        ) : <StudentList onSelectStudent={handleStudentSelect} />;

      case 'chat': return <ChatInbox />;
      case 'prospects': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <h1 className="text-lg font-bold text-white tracking-tight">Solicitudes Web</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans text-xs">
            <LeadInboxList />
          </div>
        </div>
      );
      case 'students': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <h1 className="text-lg font-bold text-white tracking-tight">Gestión de Estudiantes</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans text-xs">
            <StudentList onSelectStudent={handleStudentSelect} />
          </div>
        </div>
      );
      case 'academic': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <h1 className="text-lg font-bold text-white tracking-tight">Oferta Académica</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans">
            {selectedProgram ? (
              <CohortList
                program={selectedProgram}
                onBack={() => setSelectedProgram(null)}
              />
            ) : (
              <ProgramList onSelectProgram={setSelectedProgram} />
            )}
          </div>
        </div>
      );
      case 'billing': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <h1 className="text-lg font-bold text-white tracking-tight">Facturación e Impuestos</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans">
            <BillingDashboard />
          </div>
        </div>
      );
      case 'inventory': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-blue-500" />
              <h1 className="text-lg font-bold text-white tracking-tight">Inventario de Materiales</h1>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans">
            <InventoryManager />
          </div>
        </div>
      );
      case 'expenses': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5 text-rose-500" />
              <h1 className="text-lg font-bold text-white tracking-tight">Control de Gastos Operativos</h1>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans">
            <ExpenseManager />
          </div>
        </div>
      );
      case 'integrations': return <IntegrationsPage />;
      case 'payroll': return (
        <div className="flex flex-col h-full bg-[#0f172a] overflow-hidden">
          <header className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 w-full">
            <h1 className="text-lg font-bold text-white tracking-tight">Gestión de Nómina Docente</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-6 text-white font-sans">
            <InstructorPayrollManager />
          </div>
        </div>
      );
      case 'settings': return <SettingsPage />;
      default: return <DashboardOverview />;

    }
  };

  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/settings').then(res => setCompanySettings(res.data)).catch(console.error);
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-[#020617] border-r border-slate-800">
        <div className="p-6 flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg overflow-hidden ${companySettings?.logo_url ? 'bg-white shadow-slate-900/20' : 'bg-blue-600 shadow-blue-900/40'}`}>
            {companySettings?.logo_url ? (
              <img
                src={getStaticUrl(companySettings.logo_url)}
                alt="Logo"
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <GraduationCap className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-black tracking-tight text-white leading-tight uppercase line-clamp-2" title={companySettings?.company_name}>
              {companySettings?.company_name || 'EduCRM'}
            </span>
          </div>
        </div>


        <nav className="flex-1 px-4 space-y-1 mt-4">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Principal</p>
          {navItems
            .filter(item => !item.adminOnly || user?.role === 'admin') // Filter based on adminOnly property
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === item.id
                  ? 'bg-blue-600/10 text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                {item.id === 'prospects' && pendingLeadsCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-900/20">
                    {pendingLeadsCount > 99 ? '99+' : pendingLeadsCount}
                  </span>
                )}
              </button>
            ))}

          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">Administración</p>
          <button
            onClick={() => {
              setActiveTab('payroll');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === 'payroll'
              ? 'bg-indigo-600/10 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <Wallet className={`w-5 h-5 transition-colors ${activeTab === 'payroll' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className="text-sm font-bold tracking-tight">Nómina Docente</span>
          </button>
        </nav>

        <div className="px-4 mb-4">
          <a
            href="/portal"
            target="_blank"
            className="w-full flex items-center space-x-3 px-3 py-3 bg-emerald-600/10 text-emerald-400 rounded-2xl border border-emerald-500/20 hover:bg-emerald-600/20 transition-all group"
          >
            <GraduationCap className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight uppercase">Portal del Alumno</span>
              <span className="text-[8px] font-bold text-emerald-500/60 tracking-widest uppercase">Vista Externa</span>
            </div>
          </a>
        </div>

        <div className="p-4 mt-auto space-y-4">


          <div className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex shrink-0 items-center justify-center text-white font-bold shadow-inner uppercase">
              {(user?.first_name || user?.firstName)?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.first_name || user?.firstName} {user?.last_name || user?.lastName}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Cerrar Sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-[#0f172a] relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-4 z-20">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-black tracking-tighter">EduCRM</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {renderContent()}

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-[#020617]/95 z-50 p-6 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-black">Menú Principal</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg"><X /></button>
            </div>
            <nav className="space-y-4">
              {navItems
                .filter(item => !item.adminOnly || user?.role === 'admin')
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl text-lg font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400'
                      }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </button>
                ))}
            </nav>
            <div className="mt-8 pt-8 border-t border-slate-800">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg uppercase">
                  {(user?.first_name || user?.firstName)?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{user?.first_name || user?.firstName} {user?.last_name || user?.lastName}</p>
                  <p className="text-sm text-slate-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button onClick={logout} className="w-full flex items-center space-x-4 p-4 rounded-2xl text-lg font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all">
                <LogOut className="w-6 h-6" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PortalWrapper() {
  const { isAuthenticated } = usePortalAuth();
  return isAuthenticated ? <PortalMain /> : <PortalLogin />;
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/solicitar" element={<PublicLeadForm />} />
        <Route path="/portal" element={<PortalWrapper />} />
        <Route path="/*" element={<Login />} />
      </Routes>
    );
  }

  // If instructor, show Instructor Portal by default
  if (user?.role === 'docente') {
    return <InstructorMain />;
  }

  return (
    <Routes>
      <Route path="/solicitar" element={<PublicLeadForm />} />
      <Route path="/portal" element={<PortalWrapper />} />
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    apiClient.get('/settings')
      .then(res => {
        if (res.data?.company_name) {
          document.title = `CRM - ${res.data.company_name}`;
        } else {
          document.title = 'CRM';
        }
      })
      .catch(() => {
        document.title = 'CRM';
      });
  }, []);

  return (
    <AuthProvider>
      <PortalProvider>
        <AppContent />
      </PortalProvider>
    </AuthProvider>
  );
}

export default App;