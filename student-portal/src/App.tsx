import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, 
  LogOut, 
  ChevronRight, 
  BookOpen, 
  Star,
  Clock,
  GraduationCap
} from 'lucide-react';

const api = axios.create({
  baseURL: '/api',
});

interface Assignment {
  id: string;
  exam: {
    id: string;
    title: string;
    description: string;
    totalQuestions: number;
    durationMinutes: number;
    passingGrade: number;
  };
  startDate: string;
  endDate: string;
}

interface Attempt {
  id: string;
  examId: string;
  score: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  createdAt: string;
}

const App = () => {
  const [student, setStudent] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ studentId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('enaa_student');
    if (saved) {
      const data = JSON.parse(saved);
      setStudent(data);
      fetchDashboardData(data.studentId, data.cohortId);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificamos que el estudiante exista
      await api.get(`/portal-exams/attempts/${loginForm.studentId}`);
      
      const studentData = { 
        studentId: loginForm.studentId, 
        email: loginForm.email,
        cohortId: '3602eb5b-606f-42b5-8bf6-8ab1e12d6b84' 
      };

      setStudent(studentData);
      localStorage.setItem('enaa_student', JSON.stringify(studentData));
      fetchDashboardData(studentData.studentId, studentData.cohortId);
    } catch (err: any) {
      setError('ID de Estudiante no encontrado o datos incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (studentId: string, cohortId: string) => {
    try {
      const [assignRes, attemptRes] = await Promise.all([
        api.get(`/portal-exams/assignments/${cohortId}`),
        api.get(`/portal-exams/attempts/${studentId}`)
      ]);
      setAssignments(assignRes.data);
      setAttempts(attemptRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('enaa_student');
    setStudent(null);
  };

  if (!student) {
    return (
      <div className="login-page">
        <div className="glass-card login-form animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <GraduationCap size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Portal ENAA</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Acceso Estudiantes</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>ID de Estudiante</label>
              <input type="text" required placeholder="Ingresa tu ID" value={loginForm.studentId}
                onChange={(e) => setLoginForm({...loginForm, studentId: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input type="email" required placeholder="ejemplo@correo.com" value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} />
            </div>
            {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Validando...' : 'Entrar al Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={32} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>ENAA Estudiante</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.email}</p>
            </div>
          </div>
          <button onClick={logout} className="glass-card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <LogOut size={18} />
            <span style={{ fontSize: '0.875rem' }}>Salir</span>
          </button>
        </div>
      </nav>

      <main className="container" style={{ padding: '2rem 1.5rem' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bienvenido de nuevo</h1>
        </header>

        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', marginBottom: '3rem', paddingBottom: '0.5rem' }}>
          <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <BookOpen color="var(--accent-primary)" size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pendientes</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{assignments.length}</h3>
            </div>
          </div>
          <div className="glass-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <Star color="var(--success)" size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Realizados</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{attempts.length}</h3>
            </div>
          </div>
        </div>

        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ClipboardList color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Exámenes Disponibles</h2>
          </div>

          <div className="grid-exams">
            {assignments.map((assign) => (
              <div key={assign.id} className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{assign.exam.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{assign.exam.description}</p>
                <button className="btn-primary" style={{ width: '100%' }}>
                  Tomar Examen <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Clock color="var(--text-secondary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Historial</h2>
          </div>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Puntuación</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{attempt.score}%</td>
                    <td style={{ padding: '1rem' }}>{attempt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
