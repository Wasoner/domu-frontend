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

  const features = [
    {
      icon: '💳',
      title: 'Gastos Comunes en línea',
      description: 'Pagos digitales seguros y seguimiento en tiempo real de tus gastos comunes.'
    },
    {
      icon: '📱',
      title: 'App móvil',
      description: 'Gestiona tu comunidad desde cualquier lugar con nuestra aplicación móvil.'
    },
    {
      icon: '📢',
      title: 'Comunicación directa',
      description: 'Mantén a tu comunidad informada con anuncios y mensajería instantánea.'
    },
    {
      icon: '🔐',
      title: 'Control de acceso',
      description: 'Registra visitas y gestiona el acceso a tu comunidad de forma segura.'
    },
    {
      icon: '📊',
      title: 'Reportes y estadísticas',
      description: 'Visualiza el estado financiero y la gestión de tu comunidad en tiempo real.'
    },
    {
      icon: '🏠',
      title: 'Reserva de espacios',
      description: 'Gestiona la reserva de espacios comunes como quinchos y salas de eventos.'
    },
  ];

  const benefits = [
    {
      title: 'Para Administradores',
      items: [
        'Módulo de recaudación completo',
        'Reportes financieros detallados',
        'Gestión centralizada de comunidades',
        'Comunicación eficiente con residentes'
      ]
    },
    {
      title: 'Para Residentes',
      items: [
        'Pagos de gastos comunes online',
        'Comunicación directa con administración',
        'Reserva de espacios comunes',
        'Acceso desde app móvil'
      ]
    },
    {
      title: 'Para Comités',
      items: [
        'Transparencia en las finanzas',
        'Revisión en tiempo real de gestión',
        'Comunicación activa con comunidad',
        'Toma de decisiones informadas'
      ]
    },
  ];

  return (
    <div className="home-page fade-in">
      <Header />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            <div className="home-hero__text">
              <h1 className="home-hero__title">
                Software para la administración de <strong>edificios y condominios</strong>
              </h1>
              <p className="home-hero__subtitle">
                Administra edificios con DOMU: el software y la aplicación para tu comunidad. 
                Gastos Comunes en línea y mucho más.
              </p>
              <div className="home-hero__actions">
                <Button onClick={handleCreateCommunity} variant="primary" className="home-hero__cta">
                  Crear mi comunidad
                </Button>
                <Button onClick={handleResidentLogin} variant="ghost" className="home-hero__secondary">
                  Soy residente
                </Button>
              </div>
            </div>
            <div className="home-hero__visual">
              <img src={heroLogo} alt="DOMU Logo" className="home-hero__logo" />
            </div>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section className="home-features">
          <div className="container">
            <div className="home-section__header">
              <h2>Funcionalidades principales</h2>
              <p>Todo lo que necesitas para administrar tu comunidad de forma eficiente</p>
            </div>
            <div className="home-features__grid">
              {features.map((feature, index) => (
                <div key={index} className="home-feature-card">
                  <div className="home-feature-card__icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="home-benefits">
          <div className="container">
            <div className="home-section__header">
              <h2>El software DOMU está pensado para cada integrante del condominio</h2>
            </div>
            <div className="home-benefits__grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="home-benefit-card">
                  <h3>{benefit.title}</h3>
                  <ul className="home-benefit-list">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="home-cta">
          <div className="container">
            <div className="home-cta__content">
              <h2>¿Listo para mejorar la gestión de tu comunidad?</h2>
              <p>Crea tu comunidad ahora y comienza a administrar de forma más eficiente</p>
              <div className="home-cta__actions">
                <Button onClick={handleCreateCommunity} variant="primary" className="home-cta__button">
                  Crear mi comunidad
                </Button>
                <Button onClick={handleDemoAccess} variant="ghost" className="home-cta__button">
                  Ver demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Home;
