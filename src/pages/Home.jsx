import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Icon, Seo, Skeleton } from '../components';
import { Header, MainContent, Footer, AuthLayout } from '../layout';
import heroLogo from '../assets/LogotipoDOMU.svg';
import { ROUTES } from '../constants';
import { useAppContext } from '../context';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import { api } from '../services';
import Dashboard from './Dashboard';
import CreateCommunityModal from './CreateCommunityModal';
import './Home.scss';

const constellationNodes = [
  { iconName: 'creditCard', label: 'Pagos' },
  { iconName: 'shieldCheck', label: 'Seguridad' },
  { iconName: 'chatBubbleLeftRight', label: 'Chat' },
  { iconName: 'archiveBox', label: 'Encomiendas' },
  { iconName: 'chartBar', label: 'Reportes' },
  { iconName: 'calendar', label: 'Reservas' },
  { iconName: 'users', label: 'Comunidad' },
  { iconName: 'buildingOffice', label: 'Edificios' },
  { iconName: 'door', label: 'Accesos' },
];

const heroStats = [
  { value: '5 roles', label: 'integrados' },
  { value: '<5s', label: 'registro QR' },
  { value: '2.000', label: 'unidades' },
];

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

const upcomingEvent = {
  title: 'Próximo evento',
  description: 'Gestión de siniestros: aprende cómo llevar el proceso de manera eficiente.',
};

const OPEN_COMMUNITY_MODAL_PARAM = 'openCommunityModal';

const formatCurrency = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
};

const ResidentHome = ({ user }) => {
  const [charges, setCharges] = useState([]);
  const [chargesError, setChargesError] = useState(null);
  const [loadingCharges, setLoadingCharges] = useState(true);
  const [communityFeed, setCommunityFeed] = useState([]);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const data = await api.finance.getMyCharges();
        setCharges(Array.isArray(data) ? data : []);
      } catch (error) {
        setChargesError(error.message);
      } finally {
        setLoadingCharges(false);
      }
    };

    const fetchFeed = async () => {
      try {
        const data = await api.forum.list();
        if (Array.isArray(data)) {
          setCommunityFeed(data.slice(0, 3).map((item) => ({
            date: new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
            title: item.title,
            description: item.content,
          })));
        }
      } catch (error) {
        console.error('Error loading community feed', error);
      }
    };

    fetchCharges();
    fetchFeed();
  }, []);

  const totalPending = useMemo(
    () => charges.reduce((acc, charge) => acc + (Number(charge.pending) || 0), 0),
    [charges]
  );

  const pendingPeriods = useMemo(() => {
    const set = new Set();
    charges.forEach((charge) => {
      const pending = Number(charge.pending) || 0;
      if (pending > 0 && charge.year && charge.month) {
        const key = `${charge.year}-${String(charge.month).padStart(2, '0')}`;
        set.add(key);
      }
    });
    return set;
  }, [charges]);

  const showDelinquencyWarning = pendingPeriods.size >= 2;

  return (
    <AuthLayout user={user}>
      <div className="resident-dashboard">
        <div className="resident-dashboard__left">
          <section className="resident-card resident-hero" aria-live="polite">
            <div>
              <p className="eyebrow">{showDelinquencyWarning ? 'Alerta de mora' : 'Tus cuentas'}</p>
              <h2>Hola, {user?.firstName || user?.email || 'Residente'}</h2>
              {showDelinquencyWarning ? (
                <p>Tienes 2 periodos con saldo. Al tercer mes se restringirá electricidad.</p>
              ) : (
                <p>Revisa y paga tus gastos comunes a tiempo.</p>
              )}
            </div>

            <div className="resident-hero__amount">
              <span>Saldo pendiente</span>
              <strong>{loadingCharges ? <Skeleton variant="text" width="90px" height="18px" /> : formatCurrency(totalPending)}</strong>
            </div>

            <div className="resident-hero__actions">
              <Button variant="primary">Pagar ahora</Button>
              <Button variant="ghost">Historial de pagos</Button>
            </div>
          </section>

          <section className="resident-card charges-card" aria-label="Gastos comunes">
            <header className="charges-card__header">
              <div>
                <h3>Gastos comunes</h3>
                <p>Pagos y saldos por periodo</p>
              </div>
              {showDelinquencyWarning && (
                <span className="warning-pill">Evita bloqueo al tercer mes</span>
              )}
            </header>

            {loadingCharges && <Skeleton.List rows={3} />}
            {chargesError && !loadingCharges && (
              <p className="error-text">No pudimos cargar tus gastos: {chargesError}</p>
            )}
            {!loadingCharges && !chargesError && charges.length === 0 && (
              <p>No tienes gastos pendientes.</p>
            )}
            {!loadingCharges && !chargesError && charges.length > 0 && (
              <ul className="charges-list">
                {charges.map((charge) => (
                  <li key={charge.chargeId} className="charge-row">
                    <div>
                      <p className="eyebrow">{`${charge.month}/${charge.year}`}</p>
                      <strong>{charge.description}</strong>
                      <span className="charge-type">{charge.type}</span>
                    </div>
                    <div className="charge-row__amounts">
                      <span>Pendiente {formatCurrency(charge.pending)}</span>
                      <span>Pagado {formatCurrency(charge.paid)}</span>
                      <span className={`status-pill status-${(charge.status || '').toLowerCase()}`}>
                        {charge.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
            <h3>Acceso desde tu celular</h3>
            <p>Portal web responsivo optimizado para celulares y tablets. Paga, consulta avisos y reserva espacios desde cualquier navegador.</p>
            <div className="qr-placeholder" aria-hidden="true">QR</div>
            <div className="store-badges">
              <span>PWA optimizada</span>
              <span>Sin descarga</span>
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
};

const Home = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAppContext();
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const currentOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://domu.app';
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Domu',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${currentOrigin}/`,
    description:
      'Software para la administración de edificios y condominios con pagos de gastos comunes en línea, comunicación y control de accesos.',
    inLanguage: 'es',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CLP',
      availability: 'https://schema.org/PreOrder',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Domu',
      url: `${currentOrigin}/`,
    },
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenCommunityModal = params.get(OPEN_COMMUNITY_MODAL_PARAM) === '1';

    if (!shouldOpenCommunityModal) return;

    setShowCommunityModal(true);

    params.delete(OPEN_COMMUNITY_MODAL_PARAM);
    const nextSearch = params.toString();
    const nextUrl = `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}${location.hash || ''}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [location.hash, location.pathname, location.search]);

  const benefitsCarouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCarouselButtons = useCallback(() => {
    const el = benefitsCarouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.offsetWidth - 1);
  }, []);

  useEffect(() => {
    const el = benefitsCarouselRef.current;
    if (el) {
      updateCarouselButtons();
      el.addEventListener('scroll', updateCarouselButtons);
    }
    window.addEventListener('resize', updateCarouselButtons);
    return () => {
      const carouselEl = benefitsCarouselRef.current;
      if (carouselEl) {
        carouselEl.removeEventListener('scroll', updateCarouselButtons);
      }
      window.removeEventListener('resize', updateCarouselButtons);
    };
  }, [updateCarouselButtons]);

  const featuresRef = useStaggerReveal();
  const benefitsSectionRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  if (isAuthenticated) {
    const isAdmin = user?.roleId === 1 || user?.userType === 'admin';
    if (isAdmin) {
      return <Dashboard />;
    }
    return <ResidentHome user={user} />;
  }

  if (isLoading) {
    return (
      <div className="home-page">
        <Header />
        <MainContent>
          <div className="home-loader" role="status">
            <Skeleton variant="rect" height="200px" borderRadius="var(--radius-md, 12px)" />
            <div className="home-loader__group">
              <Skeleton variant="title" width="40%" />
              <Skeleton variant="text" count={3} />
            </div>
            <Skeleton.Cards count={3} />
          </div>
        </MainContent>
        <Footer />
      </div>
    );
  }

  const handleCreateCommunity = () => {
    setShowCommunityModal(true);
  };

  const handleDemoAccess = () => {
    window.location.href = ROUTES.SOLUCIONES;
  };

  const features = [
    { iconName: 'creditCard', title: 'Gastos comunes en línea', description: 'Genera cobros mensuales, recibe pagos digitales y haz seguimiento de morosidad desde un solo lugar.' },
    { iconName: 'shieldCheck', title: 'Control de acceso con QR', description: 'Registra visitas en menos de 5 segundos con lectura QR de cédula chilena y notificación automática al residente.' },
    { iconName: 'chatBubbleLeftRight', title: 'Comunicación en tiempo real', description: 'Chat directo entre residentes, foro comunitario y publicaciones para mantener informada a tu comunidad.' },
    { iconName: 'archiveBox', title: 'Gestión de encomiendas', description: 'Recepción de paquetes con evidencia fotográfica, firma de entrega y aviso inmediato al destinatario.' },
    { iconName: 'chartBar', title: 'Reportes y dashboard', description: 'Panel administrativo con métricas de gestión, estados financieros y control de tareas del personal.' },
    { iconName: 'calendar', title: 'Reserva de espacios', description: 'Agenda quinchos, salas y áreas comunes con control de capacidad y bloqueo automático por morosidad.' },
  ];

  const solucionesIntegrantes = [
    { title: 'Administrador', route: ROUTES.SOLUCIONES_ADMINISTRADOR, iconName: 'chartBar' },
    { title: 'Comité', route: ROUTES.SOLUCIONES_COMITE, iconName: 'scale' },
    { title: 'Conserjería', route: ROUTES.SOLUCIONES_CONSERJERIA, iconName: 'buildingOffice' },
    { title: 'Cumplimiento normativo', route: ROUTES.SOLUCIONES_FUNCIONARIOS, iconName: 'buildingLibrary' },
    { title: 'Residente', route: ROUTES.SOLUCIONES_RESIDENTE, iconName: 'home' },
    { title: 'Proveedores', route: ROUTES.SOLUCIONES_PROVEEDORES, iconName: 'wrench' },
  ];

  const scrollBenefitsCarousel = (direction) => {
    const el = benefitsCarouselRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.home-benefit-card');
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(el).gap, 10) || 28;
    const amount = cardWidth + gap;
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="home-page public-page fade-in">
      <Seo
        title="Domu | Software de administración de edificios y condominios"
        description="Administra edificios y condominios con Domu: gastos comunes en línea, comunicación con residentes y control de accesos desde un portal web responsivo."
        keywords="domu, gastos comunes en línea, software condominios, administración de edificios, portal residentes, control de accesos"
        canonicalPath="/"
        structuredData={homeStructuredData}
      />
      <Header />
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            <div className="home-hero__text">
              <h1 className="home-hero__title">La plataforma integral para <strong>edificios y condominios</strong></h1>
              <p className="home-hero__subtitle">Accesos, finanzas, operación y comunicación en un solo sistema. DOMU reemplaza las planillas, los cuadernos de portería y las herramientas desconectadas.</p>
              <div className="home-hero__actions">
                <Button onClick={handleCreateCommunity} variant="primary">Crear mi comunidad</Button>
              </div>
              <div className="home-hero__stats">
                {heroStats.map((stat, i) => (
                  <div key={i} className="home-hero__stat">
                    <span className="mono-accent">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="home-hero__visual">
              <div className="hero-constellation" aria-hidden="true">
                <div className="hero-constellation__center">
                  <img src={heroLogo} alt="" className="hero-constellation__logo" />
                </div>
                {constellationNodes.map((node, i) => (
                  <div
                    key={node.label}
                    className="hero-constellation__node"
                    style={{ '--node-index': i }}
                  >
                    <Icon name={node.iconName} size={22} strokeWidth={1.8} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <MainContent>
        <section ref={featuresRef} className="home-features reveal-section">
          <div className="container">
            <div className="home-section__header">
              <h2>Todo lo que tu comunidad necesita</h2>
              <p>Módulos integrados que cubren desde el control de accesos hasta la gestión financiera</p>
            </div>
            <div className="home-features__grid">
              {features.map((feature, index) => (
                <div key={index} className="home-feature-card reveal-stagger-child">
                  <div className="home-feature-card__icon" aria-hidden="true">
                    <Icon name={feature.iconName} size={42} strokeWidth={1.8} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section ref={benefitsSectionRef} className="home-benefits reveal-section">
          <div className="container">
            <div className="home-section__header">
              <h2>DOMU está pensado para cada integrante de la comunidad</h2>
            </div>
            <div className="home-benefits__carousel-wrap">
              <button
                type="button"
                className="home-benefits__nav home-benefits__nav--left"
                onClick={() => scrollBenefitsCarousel('left')}
                disabled={!canScrollLeft}
                aria-label="Anterior"
              >
                <Icon name="arrowLeft" size={24} strokeWidth={2} />
              </button>
              <div
                ref={benefitsCarouselRef}
                className="home-benefits__carousel"
              >
                {solucionesIntegrantes.map((item, index) => (
                  <div key={index} className="home-benefit-card">
                    <div className="home-benefit-card__icon" aria-hidden="true">
                      <Icon name={item.iconName} size={42} strokeWidth={1.8} />
                    </div>
                    <h3>{item.title}</h3>
                    <Link to={item.route} className="home-benefit-card__cta">
                      Más información
                    </Link>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="home-benefits__nav home-benefits__nav--right"
                onClick={() => scrollBenefitsCarousel('right')}
                disabled={!canScrollRight}
                aria-label="Siguiente"
              >
                <Icon name="arrowRight" size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>
        <section ref={ctaRef} className="home-cta reveal-section">
          <div className="container">
            <div className="home-cta__content">
              <h2>Deja atrás las planillas y los sistemas desconectados</h2>
              <p>Crea tu comunidad en DOMU y centraliza toda la gestión en minutos</p>
              <div className="home-cta__actions">
                <Button onClick={handleCreateCommunity} variant="primary">Crear mi comunidad</Button>
                <Button onClick={handleDemoAccess} variant="ghost">Explorar soluciones</Button>
              </div>
            </div>
          </div>
        </section>
      </MainContent>
      <Footer />
      <CreateCommunityModal open={showCommunityModal} onClose={() => setShowCommunityModal(false)} />
    </div>
  );
};

export default Home;
