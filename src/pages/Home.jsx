import { Button, FeatureCard, ResidentCard } from '../components';
import { Header, MainContent, Footer, AuthLayout } from '../layout';
import heroLogo from '../assets/LogotipoDOMU.svg';
import { ROUTES } from '../constants';
import { useAppContext } from '../context';
import Dashboard from './Dashboard';
import './Home.css';

const residentChartData = [
  { month: 'May', amount: '$64.3K', value: 70 },
  { month: 'Jun', amount: '$85.7K', value: 95 },
  { month: 'Jul', amount: '$72.5K', value: 80 },
  { month: 'Ago', amount: '$70.1K', value: 78 },
  { month: 'Sept', amount: '$81.2K', value: 90 },
  { month: 'Oct', amount: '$79.4K', value: 85 },
];

const residentQuickActions = [
  {
    label: 'Mensajes',
    title: 'Enviar mensaje',
    description: 'Contacta al administrador para resolver dudas.',
    cta: 'Escribir',
  },
  {
    label: 'Visitas',
    title: 'Registrar acceso',
    description: 'Anuncia visitas o proveedores con anticipación.',
    cta: 'Nueva visita',
  },
  {
    label: 'Reservas',
    title: 'Reservar espacio común',
    description: 'Agenda quinchos o salas de eventos en segundos.',
    cta: 'Reservar',
  },
];

const communityFeed = [
  {
    date: '17 Nov 2025',
    title: 'Información de interés para la comunidad',
    description: 'Recordatorio sobre mantenciones y uso responsable de espacios comunes.',
  },
  {
    date: '02 Oct 2025',
    title: 'Corte de gas programado',
    description: 'El servicio se suspenderá el viernes 03-10-2025 desde las 23:00 hrs.',
  },
  {
    date: '29 Sept 2025',
    title: 'Cotizaciones de trabajos',
    description: 'Revisa el detalle de los trabajos aprobados para áreas comunes.',
  },
];

const upcomingEvent = {
  title: 'Próximo evento',
  description: 'Gestión de siniestros: aprende cómo llevar el proceso de manera eficiente.',
};

const ResidentHome = ({ user }) => (
  <AuthLayout user={user}>
    <div className="resident-dashboard">
      <div className="resident-dashboard__left">
        <section className="resident-card resident-hero" aria-live="polite">
          <div>
            <p className="eyebrow">Tus cuentas están al día</p>
            <h2>Hola, {user?.firstName || user?.email || 'Residente'}</h2>
            <p>Último pago: 24 Nov 2025 · Próximo pago: 30 Nov 2025</p>
          </div>

          <div className="resident-hero__amount">
            <span>Saldo del mes</span>
            <strong>$78.860</strong>
          </div>

          <div className="resident-hero__actions">
            <Button variant="primary">Pagar ahora</Button>
            <Button variant="ghost">Historial de pagos</Button>
          </div>
        </section>

        <section className="resident-card resident-chart" aria-label="Evolución de gastos comunes">
          <header>
            <div>
              <h3>Evolución Gastos Comunes</h3>
              <p>Seguimiento últimos 6 meses</p>
            </div>
            <button type="button" className="link-button">Comparar</button>
          </header>

          <div className="chart-bars" role="img" aria-label="Barras mensuales de gastos">
            {residentChartData.map((item) => (
              <span
                key={item.month}
                className="chart-bar"
                style={{ height: `${item.value}%` }}
                aria-label={`${item.month}: ${item.amount}`}
              >
                <em className="chart-bar__value">{item.amount}</em>
                <strong className="chart-bar__month">{item.month}</strong>
              </span>
            ))}
          </div>
        </section>

        <section className="resident-card quick-actions-card">
          <h3>Accesos rápidos</h3>
          <ul className="quick-actions">
            {residentQuickActions.map((action) => (
              <li key={action.title}>
                <div>
                  <p className="eyebrow">{action.label}</p>
                  <strong>{action.title}</strong>
                  <span>{action.description}</span>
                </div>
                <Button variant="secondary">{action.cta}</Button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="resident-dashboard__right">
        <section className="resident-card community-wall">
          <h3>Muro de la comunidad</h3>
          <ul className="community-feed">
            {communityFeed.map((item) => (
              <li key={item.title}>
                <p className="community-feed__date">{item.date}</p>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
          <Button variant="ghost">Ir a publicaciones</Button>
        </section>

        <section className="resident-card qr-card">
          <h3>App móvil</h3>
          <p>Escanea el código para pagar, revisar avisos y reservar espacios comunes.</p>
          <div className="qr-placeholder" aria-hidden="true">QR</div>
          <div className="store-badges">
            <span>Google Play ⭐4.5</span>
            <span>App Store ⭐4.3</span>
          </div>
        </section>
      </aside>
    </div>

    <div className="floating-event" aria-live="polite">
      <strong>{upcomingEvent.title}</strong>
      <p>{upcomingEvent.description}</p>
      <Button variant="primary">Registrarse</Button>
    </div>
  </AuthLayout>
);

/**
 * Home Page Component
 * Main landing page for Domu platform
 */
const Home = () => {
  const { user, isAuthenticated, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="home-page">
        <Header />
        <MainContent>
          <div className="home-loader" role="status">
            Preparando tu portal...
          </div>
        </MainContent>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated) {
    const isAdmin = user?.roleId === 1 || user?.userType === 'admin';
    if (isAdmin) {
      return <Dashboard />;
    }
    return <ResidentHome user={user} />;
  }

  const handleCreateCommunity = () => {
    // TODO: Implement community creation flow
    console.log('Creating community...');
    // Navigate to login or create account
    window.location.href = ROUTES.LOGIN;
  };

  const handleResidentLogin = () => {
    // Navigate to login page for residents
    window.location.href = ROUTES.LOGIN;
  };

  const handleDemoAccess = () => {
    // TODO: Implement demo access flow
    console.log('Accessing demo...');
    // For now, redirect to about page
    window.location.href = ROUTES.ABOUT;
  };

  return (
    <div className="home-page fade-in">
      <Header />

      <MainContent>
        <div className="container">
          <div className="home-grid">
            <section className="left-column">
              <h1>Software para la administración de edificios y condominios</h1>
              <p className="lead">Administra edificios con Domu: el software y la aplicación para tu comunidad. Gastos Comunes en línea y mucho más.</p>

              <div className="hero-media">
                <img src={heroLogo} alt="DOMU - Software para administración de edificios y condominios" className="hero-logo" />
              </div>
            </section>

            <aside className="right-column" aria-label="Acciones principales">
              <div className="stack-cards">
                <FeatureCard title="Crea tu comunidad">
                  <p>Una vez creada tu comunidad te contactaremos para seguir avanzando.</p>
                  <Button onClick={handleCreateCommunity} variant="primary">
                    Crea tu Comunidad
                  </Button>
                </FeatureCard>

                <ResidentCard title="¿Eres residente?">
                  <p>Ingresa a tu portal para pagos y comunicación.</p>
                  <Button onClick={handleResidentLogin} variant="primary">
                    Soy residente
                  </Button>
                </ResidentCard>

                <FeatureCard title="Prueba gratis">
                  <p>Explora la demo online</p>
                  <Button onClick={handleDemoAccess} variant="primary">
                    Entrar Demo Online Gratis
                  </Button>
                </FeatureCard>
              </div>
            </aside>
          </div>
        </div>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Home;
