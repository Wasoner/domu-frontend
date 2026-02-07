import { useEffect, useMemo, useState } from 'react';
import { Button, LocationPicker, Seo, Skeleton } from '../components';
import { Header, MainContent, Footer, AuthLayout } from '../layout';
import heroLogo from '../assets/LogotipoDOMU.svg';
import { ROUTES } from '../constants';
import { useAppContext } from '../context';
import { api } from '../services';
import Dashboard from './Dashboard';
import './Home.scss';

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

const formatRut = (value) => {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

const COMMUNITY_FORM_STORAGE_KEY = 'communityFormDraft';
const COMMUNITY_DOC_NAME_KEY = 'communityDocName';

const communityFormDefaults = {
  name: '',
  towerLabel: '',
  address: '',
  commune: '',
  city: '',
  postalCode: '',
  adminPhone: '',
  adminEmail: '',
  adminName: '',
  adminDocument: '',
  floors: 4,
  unitsCount: 8,
  latitude: '',
  longitude: '',
  proofText: '',
};

const getDefaultCommunityStatus = () => ({
  loading: false,
  message: null,
  error: null,
  success: false,
  status: null,
});

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

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAppContext();
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [step, setStep] = useState(1);
  const [communityForm, setCommunityForm] = useState(() => {
    const stored = localStorage.getItem(COMMUNITY_FORM_STORAGE_KEY);
    if (stored) {
      try {
        return { ...communityFormDefaults, ...JSON.parse(stored) };
      } catch (error) {
        console.warn('[Community form] No se pudo parsear el borrador guardado', error);
      }
    }
    return communityFormDefaults;
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState(() => localStorage.getItem(COMMUNITY_DOC_NAME_KEY) || '');
  const [communityStatus, setCommunityStatus] = useState(getDefaultCommunityStatus);
  const currentOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://domu.app';
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Domu',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
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
    localStorage.setItem(COMMUNITY_FORM_STORAGE_KEY, JSON.stringify(communityForm));
    if (documentName) {
      localStorage.setItem(COMMUNITY_DOC_NAME_KEY, documentName);
    } else {
      localStorage.removeItem(COMMUNITY_DOC_NAME_KEY);
    }
  }, [communityForm, documentName]);

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
          <div className="home-loader" role="status" style={{ maxWidth: '720px', margin: '3rem auto', padding: '0 1rem' }}>
            <Skeleton variant="rect" height="200px" borderRadius="var(--radius-md, 12px)" />
            <div style={{ marginTop: '1.5rem' }}>
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

  const resetCommunityState = () => {
    setStep(1);
    setCommunityForm(communityFormDefaults);
    setCommunityStatus(getDefaultCommunityStatus());
    setDocumentFile(null);
    setDocumentName('');
    localStorage.removeItem(COMMUNITY_FORM_STORAGE_KEY);
    localStorage.removeItem(COMMUNITY_DOC_NAME_KEY);
  };

  const handleCreateCommunity = () => {
    setCommunityStatus(getDefaultCommunityStatus());
    setStep(1);
    setShowCommunityModal(true);
  };

  const handleOverlayClose = () => {
    setShowCommunityModal(false);
  };

  const handleCloseAndReset = () => {
    setShowCommunityModal(false);
    resetCommunityState();
  };

  const handleResidentLogin = () => {
    window.location.href = ROUTES.LOGIN;
  };

  const handleDemoAccess = () => {
    window.location.href = ROUTES.ABOUT;
  };

  const handleProofFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentFile(file);
    setDocumentName(file.name);
    setCommunityForm((prev) => ({
      ...prev,
      proofText: prev.proofText?.trim() ? prev.proofText : `Documento adjunto: ${file.name}`,
    }));
  };

  const handleLocationSelect = ({ lat, lng, address, postcode, city, state }) => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      setCommunityForm((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        address: address || prev.address,
        city: city || prev.city,
        commune: state || prev.commune,
        postalCode: postcode || prev.postalCode,
      }));
    }
  };

  const handleCommunitySubmit = async (event) => {
    event.preventDefault();
    if (!documentFile) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'Adjunta el documento de propiedad (PDF o imagen).' });
      return;
    }
    setCommunityStatus({ ...getDefaultCommunityStatus(), loading: true });
    try {
      const payload = {
        ...communityForm,
        documentFile,
        floors: communityForm.floors ? Number(communityForm.floors) : null,
        unitsCount: communityForm.unitsCount ? Number(communityForm.unitsCount) : null,
        latitude: communityForm.latitude ? Number(communityForm.latitude) : null,
        longitude: communityForm.longitude ? Number(communityForm.longitude) : null,
        proofText: communityForm.proofText?.trim() || `Documento adjunto: ${documentFile.name}`,
      };
      const response = await api.buildings.createRequest(payload);
      setCommunityStatus({
        ...getDefaultCommunityStatus(),
        success: true,
        message: '¡Solicitud enviada!',
        status: response?.status || 'PENDING',
      });
    } catch (error) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: error.message });
    }
  };

  const handleNewCommunityRequest = () => {
    resetCommunityState();
    setShowCommunityModal(true);
  };

  const features = [
    { icon: '💳', title: 'Gastos Comunes en línea', description: 'Pagos digitales seguros y seguimiento en tiempo real de tus gastos comunes.' },
    { icon: '📱', title: 'Portal web responsivo', description: 'Gestiona tu comunidad desde cualquier dispositivo con nuestro portal web optimizado para celulares, tablets y computadores.' },
    { icon: '📢', title: 'Comunicación directa', description: 'Mantén a tu comunidad informada con anuncios y mensajería instantánea.' },
    { icon: '🔐', title: 'Control de acceso', description: 'Registra visitas y gestiona el acceso a tu comunidad de forma segura.' },
    { icon: '📊', title: 'Reportes y estadísticas', description: 'Visualiza el estado financiero y la gestión de tu comunidad en tiempo real.' },
    { icon: '🏠', title: 'Reserva de espacios', description: 'Gestiona la reserva de espacios comunes como quinchos y salas de eventos.' },
  ];

  const heroHighlights = [
    { title: 'Pagos sin fricción', description: 'Cobranza clara, pagos en línea y reportes al instante.' },
    { title: 'Accesos más seguros', description: 'Registro de visitas con QR y trazabilidad de ingresos.' },
    { title: 'Comunidad conectada', description: 'Mensajes, avisos y gestión centralizada en un solo lugar.' },
  ];

  const benefits = [
    { title: 'Para Administradores', items: ['Módulo de recaudación completo', 'Reportes financieros detallados', 'Gestión centralizada de comunidades', 'Comunicación eficiente con residentes'] },
    { title: 'Para Residentes', items: ['Pagos de gastos comunes online', 'Comunicación directa con administración', 'Reserva de espacios comunes', 'Acceso desde portal web responsivo'] },
    { title: 'Para Comités', items: ['Transparencia en las finanzas', 'Revisión en tiempo real de gestión', 'Comunicación activa con comunidad', 'Toma de decisiones informadas'] },
  ];

  return (
    <div className="home-page fade-in">
      <Seo
        title="Domu | Software de administración de edificios y condominios"
        description="Administra edificios y condominios con Domu: gastos comunes en línea, comunicación con residentes y control de accesos desde un portal web responsivo."
        keywords="domu, gastos comunes en línea, software condominios, administración de edificios, portal residentes, control de accesos"
        canonicalPath="/"
        structuredData={homeStructuredData}
      />
      <Header />
      <section className="home-hero animated-section">
        <div className="container">
          <div className="home-hero__content">
            <div className="home-hero__text">
              <p className="home-hero__eyebrow">Plataforma DOMU para comunidades</p>
              <h1 className="home-hero__title">Software para la administración de <strong>edificios y condominios</strong></h1>
              <p className="home-hero__subtitle">Administra edificios con DOMU: el software y el portal web responsivo para tu comunidad. Gastos Comunes en línea y mucho más.</p>
              <div className="home-hero__highlights">
                {heroHighlights.map((item) => (
                  <div key={item.title} className="home-hero__highlight">
                    <span>{item.title}</span>
                    <small>{item.description}</small>
                  </div>
                ))}
              </div>
              <div className="home-hero__actions">
                <Button onClick={handleCreateCommunity} variant="primary">Crear mi comunidad</Button>
                <Button onClick={handleResidentLogin} variant="ghost">Soy residente</Button>
              </div>
            </div>
            <div className="home-hero__visual">
              <div className="home-hero__frame">
                <img src={heroLogo} alt="DOMU Logo" className="home-hero__logo" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <MainContent>
        <section className="home-features animated-section">
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
        <section className="home-benefits animated-section">
          <div className="container">
            <div className="home-section__header">
              <h2>El software DOMU está pensado para cada integrante del condominio</h2>
            </div>
            <div className="home-benefits__grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="home-benefit-card">
                  <h3>{benefit.title}</h3>
                  <ul className="home-benefit-list">
                    {benefit.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="home-cta animated-section">
          <div className="container">
            <div className="home-cta__content">
              <h2>¿Listo para mejorar la gestión de tu comunidad?</h2>
              <p>Crea tu comunidad ahora y comienza a administrar de forma más eficiente</p>
              <div className="home-cta__actions">
                <Button onClick={handleCreateCommunity} variant="primary">Crear mi comunidad</Button>
                <Button onClick={handleDemoAccess} variant="ghost">Ver demo</Button>
              </div>
            </div>
          </div>
        </section>
      </MainContent>
      <Footer />
      {showCommunityModal && (
        <div className="modal-overlay" onClick={handleOverlayClose}>
          <div className="community-modal" onClick={(e) => e.stopPropagation()}>
            <header className="community-modal__header">
              <div>
                <p className="eyebrow">{communityStatus.success ? 'Solicitud enviada' : 'Solicitud de comunidad'}</p>
                <h3>{communityStatus.success ? '¡Listo! Hemos recibido tu solicitud' : 'Crear mi comunidad'}</h3>
                {!communityStatus.success && (
                  <div className="stepper">
                    <span className={step === 1 ? 'step-current' : 'step-done'}>1. Administrador</span>
                    <span className={step === 2 ? 'step-current' : step > 2 ? 'step-done' : 'step-upcoming'}>2. Comunidad</span>
                    <span className={step === 3 ? 'step-current' : 'step-upcoming'}>3. Documento</span>
                  </div>
                )}
              </div>
              <button type="button" className="close-button" onClick={handleCloseAndReset} aria-label="Cerrar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </header>

            {communityStatus.success ? (
              <div className="community-success">
                <div className="community-success__icon">✓</div>
                <h4>¡Solicitud enviada!</h4>
                <p className="community-success__note">
                  Tu solicitud ha sido recibida y será revisada por nuestro equipo.
                  Te enviaremos un correo con el resultado.
                </p>
                <div className="community-success__actions">
                  <Button type="button" variant="primary" onClick={handleCloseAndReset}>Volver al inicio</Button>
                  <Button type="button" variant="ghost" onClick={handleNewCommunityRequest}>Nueva solicitud</Button>
                </div>
              </div>
            ) : (
              <div className="community-modal__content">
                <form className="community-form" onSubmit={handleCommunitySubmit}>
                  {communityStatus.error && (
                    <p className="error-text">{communityStatus.error}</p>
                  )}

                  {step === 1 && (
                    <div className="form-page">
                      <p className="eyebrow">Datos del administrador</p>
                      <div className="form-grid">
                        <label>
                          Nombre completo *
                          <input
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            value={communityForm.adminName}
                            onChange={(e) => setCommunityForm({ ...communityForm, adminName: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Correo electrónico
                          <input
                            type="email"
                            placeholder="admin@ejemplo.com"
                            value={communityForm.adminEmail}
                            onChange={(e) => setCommunityForm({ ...communityForm, adminEmail: e.target.value })}
                          />
                        </label>
                        <label>
                          Teléfono
                          <input
                            type="tel"
                            placeholder="+56 9 1234 5678"
                            value={communityForm.adminPhone}
                            onChange={(e) => setCommunityForm({ ...communityForm, adminPhone: e.target.value })}
                          />
                        </label>
                        <label>
                          RUT / Documento
                          <input
                            type="text"
                            placeholder="12.345.678-9"
                            maxLength={12}
                            value={communityForm.adminDocument}
                            onChange={(e) => setCommunityForm({ ...communityForm, adminDocument: formatRut(e.target.value) })}
                          />
                        </label>
                      </div>
                      <div className="community-modal__actions">
                        <Button type="button" variant="ghost" onClick={handleOverlayClose}>Cancelar</Button>
                        <Button type="button" variant="primary" onClick={() => setStep(2)}>Siguiente</Button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="form-page">
                      <p className="eyebrow">Datos de la comunidad</p>
                      <div className="form-grid">
                        <label>
                          Nombre del condominio *
                          <input
                            type="text"
                            placeholder="Ej: Edificio Plaza Central"
                            value={communityForm.name}
                            onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Dirección *
                          <input
                            type="text"
                            placeholder="Av. Libertad 123"
                            value={communityForm.address}
                            onChange={(e) => setCommunityForm({ ...communityForm, address: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Comuna *
                          <input
                            type="text"
                            placeholder="Santiago"
                            value={communityForm.commune}
                            onChange={(e) => setCommunityForm({ ...communityForm, commune: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Ciudad
                          <input
                            type="text"
                            placeholder="Región Metropolitana"
                            value={communityForm.city}
                            onChange={(e) => setCommunityForm({ ...communityForm, city: e.target.value })}
                          />
                        </label>
                        <label>
                          Torre / Etiqueta
                          <input
                            type="text"
                            placeholder="Torre A"
                            value={communityForm.towerLabel}
                            onChange={(e) => setCommunityForm({ ...communityForm, towerLabel: e.target.value })}
                          />
                        </label>
                        <label>
                          Pisos
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={communityForm.floors}
                            onChange={(e) => setCommunityForm({ ...communityForm, floors: e.target.value })}
                          />
                        </label>
                        <label>
                          Cantidad de unidades
                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={communityForm.unitsCount}
                            onChange={(e) => setCommunityForm({ ...communityForm, unitsCount: e.target.value })}
                          />
                        </label>
                      </div>
                      <p className="eyebrow" style={{ marginTop: '0.5rem' }}>Ubicación en el mapa (opcional)</p>
                      <LocationPicker
                        latitude={communityForm.latitude}
                        longitude={communityForm.longitude}
                        onSelect={handleLocationSelect}
                      />
                      <div className="community-modal__actions">
                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                        <Button type="button" variant="primary" onClick={() => setStep(3)}>Siguiente</Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="form-page">
                      <p className="eyebrow">Documento de acreditación</p>
                      <label>
                        Texto de acreditación *
                        <textarea
                          rows={3}
                          placeholder="Ej: Adjunto acta de asamblea de nombramiento como administrador"
                          value={communityForm.proofText}
                          onChange={(e) => setCommunityForm({ ...communityForm, proofText: e.target.value })}
                          required
                        />
                      </label>
                      <label className="file-input">
                        Documento adjunto (PDF o imagen) *
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleProofFile} />
                      </label>
                      {documentName && <p className="info-text">Archivo seleccionado: {documentName}</p>}
                      <div className="community-modal__actions">
                        <Button type="button" variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
                        <Button type="submit" variant="primary" disabled={communityStatus.loading}>
                          {communityStatus.loading ? 'Enviando...' : 'Enviar solicitud'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;