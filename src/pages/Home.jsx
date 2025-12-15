import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components';
import { Header, MainContent, Footer, AuthLayout } from '../layout';
import heroLogo from '../assets/LogotipoDOMU.svg';
import { ROUTES } from '../constants';
import { useAppContext } from '../context';
import { api } from '../services';
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

const formatCurrency = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
};

const ResidentHome = ({ user }) => {
  const [charges, setCharges] = useState([]);
  const [chargesError, setChargesError] = useState(null);
  const [loadingCharges, setLoadingCharges] = useState(true);

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
    fetchCharges();
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
              <strong>{loadingCharges ? 'Cargando...' : formatCurrency(totalPending)}</strong>
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

            {loadingCharges && <p>Cargando gastos...</p>}
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
};

/**
 * Home Page Component
 * Main landing page for Domu platform
 */
const Home = () => {
  const { user, isAuthenticated, isLoading } = useAppContext();
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [communityForm, setCommunityForm] = useState({
    name: '',
    towerLabel: '',
    address: '',
    commune: '',
    city: '',
    adminPhone: '',
    adminEmail: '',
    adminName: '',
    adminDocument: '',
    floors: 4,
    unitsCount: 8,
    latitude: '',
    longitude: '',
    proofText: '',
  });
  const [communityStatus, setCommunityStatus] = useState({ loading: false, message: null, error: null });

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
    setCommunityStatus({ loading: false, message: null, error: null });
    setShowCommunityModal(true);
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

  const handleProofFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCommunityForm((prev) => ({ ...prev, proofText: reader.result?.toString() || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleCommunitySubmit = async (event) => {
    event.preventDefault();
    if (!api.auth.isAuthenticated()) {
      setCommunityStatus({ loading: false, message: null, error: 'Inicia sesión como administrador para enviar la solicitud.' });
      window.location.href = ROUTES.LOGIN;
      return;
    }
    if (!communityForm.proofText) {
      setCommunityStatus({ loading: false, message: null, error: 'Adjunta el documento de propiedad (PDF en base64).' });
      return;
    }
    setCommunityStatus({ loading: true, message: null, error: null });
    try {
      const payload = {
        ...communityForm,
        floors: Number(communityForm.floors) || null,
        unitsCount: Number(communityForm.unitsCount) || null,
        latitude: communityForm.latitude ? Number(communityForm.latitude) : null,
        longitude: communityForm.longitude ? Number(communityForm.longitude) : null,
      };
      const response = await api.buildings.createRequest(payload);
      setCommunityStatus({
        loading: false,
        message: `Solicitud enviada. Estado: ${response?.status || 'PENDING'}. Un administrador revisará el documento.`,
        error: null,
      });
    } catch (error) {
      setCommunityStatus({ loading: false, message: null, error: error.message });
    }
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

      {showCommunityModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="community-modal">
            <header className="community-modal__header">
              <div>
                <p className="eyebrow">Paso 1: Solicitud</p>
                <h3>Crear mi comunidad</h3>
                <small>Adjunta el documento que respalda la propiedad del edificio.</small>
              </div>
              <button type="button" className="close-button" onClick={() => setShowCommunityModal(false)}>
                ✕
              </button>
            </header>

            <form className="community-form" onSubmit={handleCommunitySubmit}>
              <div className="form-notebook">
                <div className="form-page">
                  <p className="eyebrow">Administrador</p>
                  <label>
                    Nombre completo
                    <input
                      type="text"
                      value={communityForm.adminName}
                      onChange={(e) => setCommunityForm({ ...communityForm, adminName: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Documento (RUT/Pasaporte)
                    <input
                      type="text"
                      value={communityForm.adminDocument}
                      onChange={(e) => setCommunityForm({ ...communityForm, adminDocument: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Teléfono admin
                    <input
                      type="text"
                      value={communityForm.adminPhone}
                      onChange={(e) => setCommunityForm({ ...communityForm, adminPhone: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Email admin
                    <input
                      type="email"
                      value={communityForm.adminEmail}
                      onChange={(e) => setCommunityForm({ ...communityForm, adminEmail: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <div className="form-divider" aria-hidden="true" />

                <div className="form-page">
                  <p className="eyebrow">Edificio / Torre</p>
                  <label>
                    Nombre del condominio
                    <input
                      type="text"
                      value={communityForm.name}
                      onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Torre (ej: 1822)
                    <input
                      type="text"
                      value={communityForm.towerLabel}
                      onChange={(e) => setCommunityForm({ ...communityForm, towerLabel: e.target.value })}
                    />
                  </label>
                  <label>
                    Dirección
                    <input
                      type="text"
                      value={communityForm.address}
                      onChange={(e) => setCommunityForm({ ...communityForm, address: e.target.value })}
                      required
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Comuna
                      <input
                        type="text"
                        value={communityForm.commune}
                        onChange={(e) => setCommunityForm({ ...communityForm, commune: e.target.value })}
                      />
                    </label>
                    <label>
                      Ciudad
                      <input
                        type="text"
                        value={communityForm.city}
                        onChange={(e) => setCommunityForm({ ...communityForm, city: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="form-grid">
                    <label>
                      Pisos
                      <input
                        type="number"
                        min="1"
                        value={communityForm.floors}
                        onChange={(e) => setCommunityForm({ ...communityForm, floors: e.target.value })}
                      />
                    </label>
                    <label>
                      Deptos totales
                      <input
                        type="number"
                        min="1"
                        value={communityForm.unitsCount}
                        onChange={(e) => setCommunityForm({ ...communityForm, unitsCount: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="form-grid">
                    <label>
                      Latitud
                      <input
                        type="number"
                        step="0.000001"
                        value={communityForm.latitude}
                        onChange={(e) => setCommunityForm({ ...communityForm, latitude: e.target.value })}
                        placeholder="-33.4489"
                      />
                    </label>
                    <label>
                      Longitud
                      <input
                        type="number"
                        step="0.000001"
                        value={communityForm.longitude}
                        onChange={(e) => setCommunityForm({ ...communityForm, longitude: e.target.value })}
                        placeholder="-70.6693"
                      />
                    </label>
                  </div>
                  <div className="map-placeholder">
                    <p>Ubicación exacta (próxima iteración con mapa interactivo)</p>
                    <Button type="button" variant="ghost" disabled>
                      Seleccionar en mapa
                    </Button>
                  </div>
                </div>
              </div>

              <label className="file-input">
                Documento (PDF en base64 o imagen)
                <input type="file" accept=".pdf,image/*" onChange={handleProofFile} />
              </label>

              {communityStatus.error && <p className="error-text">{communityStatus.error}</p>}
              {communityStatus.message && <p className="success-text">{communityStatus.message}</p>}

              <div className="community-modal__actions">
                <Button type="button" variant="ghost" onClick={() => setShowCommunityModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={communityStatus.loading}>
                  {communityStatus.loading ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
