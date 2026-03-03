import { Link } from 'react-router-dom';
import './LandingPage.css';

export const LandingPage = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing__nav">
        <div className="landing__nav-brand">
          <div className="landing__nav-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="landing__nav-title">MiDinero</span>
        </div>

        <div className="landing__nav-links">
          <Link to="/login" className="landing__nav-link landing__nav-link--ghost">
            Iniciar sesión
          </Link>
          <Link to="/register" className="landing__nav-link landing__nav-link--primary">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <div className="landing__badge">
            <span className="landing__badge-dot" />
            Gestión financiera personal
          </div>

          <h1 className="landing__hero-title">
            Tus gastos bajo <span>total control</span>
          </h1>

          <p className="landing__hero-subtitle">
            Registra, organiza y analiza cada gasto de forma sencilla. Toma decisiones
            financieras más inteligentes con información clara y precisa.
          </p>

          <div className="landing__hero-actions">
            <Link to="/register" className="landing__cta landing__cta--primary">
              Comenzar gratis
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link to="/login" className="landing__cta landing__cta--secondary">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing__features">
        <h2 className="landing__features-title">Todo lo que necesitas</h2>
        <p className="landing__features-subtitle">
          Herramientas diseñadas para facilitar tu gestión financiera
        </p>

        <div className="landing__features-grid">
          <div className="landing__feature-card">
            <div className="landing__feature-icon landing__feature-icon--coral">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="landing__feature-title">Registro rápido</h3>
            <p className="landing__feature-desc">
              Agrega gastos en segundos con un formulario intuitivo. Título, monto, fecha y categoría en un solo lugar.
            </p>
          </div>

          <div className="landing__feature-card">
            <div className="landing__feature-icon landing__feature-icon--sage">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="landing__feature-title">Filtros por mes</h3>
            <p className="landing__feature-desc">
              Filtra tus gastos por mes y año. Visualiza estadísticas como total, promedio y cantidad de registros.
            </p>
          </div>

          <div className="landing__feature-card">
            <div className="landing__feature-icon landing__feature-icon--navy">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className="landing__feature-title">Recordatorios</h3>
            <p className="landing__feature-desc">
              Configura recordatorios para no olvidar pagos importantes. Prioriza gastos con el sistema de semáforo.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        © {new Date().getFullYear()} MiDinero — Gestión financiera personal
      </footer>
    </div>
  );
};
