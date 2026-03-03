import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, LoginPage, RegisterPage } from './modules/auth';
import { GastosPage } from './modules/gastos/pages';
import { LandingPage } from './modules/landing/LandingPage';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app">
      {/* Solo mostrar navbar si está autenticado */}
      {isAuthenticated && user && (
        <nav className="navbar">
          <a href="/gastos" className="navbar__brand">
            <div className="navbar__icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="navbar__title">MiDinero</span>
          </a>

          <div className="navbar__right">
            <div className="navbar__user">
              <div className="navbar__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="navbar__name">{user.name}</span>
            </div>
            <button className="navbar__logout" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </nav>
      )}

      <main className="app__main">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/gastos" replace /> : <LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/gastos" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/gastos" replace /> : <RegisterPage />} />
          <Route path="/gastos" element={<ProtectedRoute><GastosPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/gastos' : '/'} replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
