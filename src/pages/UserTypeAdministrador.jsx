import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'banknotes',
    title: 'Gastos comunes integrados',
    description: 'Genera cobros mensuales con prorrateos, emite estados de cuenta en PDF y recibe pagos en línea vía Mercado Pago.',
  },
  {
    iconName: 'exclamationTriangle',
    title: 'Control de morosidad',
    description: 'Visualiza saldos pendientes por unidad, aplica intereses y restringe servicios automáticamente al tercer mes de mora.',
  },
  {
    iconName: 'chartBar',
    title: 'Dashboard y reportes',
    description: 'Panel con métricas clave de tu comunidad: ingresos, egresos, estado de morosidad y cumplimiento de tareas.',
  },
  {
    iconName: 'clipboardCheck',
    title: 'Gestión de personal y tareas',
    description: 'Asigna tareas a conserjes y personal de apoyo, controla turnos y mide cumplimiento con indicadores.',
  },
  {
    iconName: 'chatBubbleLeftRight',
    title: 'Comunicación comunitaria',
    description: 'Publica avisos en el muro de la comunidad, gestiona el foro y mantén un canal directo con residentes.',
  },
  {
    iconName: 'wrench',
    title: 'Proveedores y mantenimiento',
    description: 'Registra proveedores, genera órdenes de trabajo, recibe cotizaciones y haz seguimiento de cada servicio.',
  },
];

const benefits = [
  'Genera y distribuye estados de cuenta sin trabajo manual',
  'Seguimiento de morosidad con restricción automática de servicios',
  'Reportes financieros exportables para rendición de cuentas',
  'Comunicación directa con residentes, comité y proveedores',
  'Control de tareas y turnos de personal operativo',
  'Plataforma alineada con la Ley de Copropiedad 21.442',
];

const UserTypeAdministrador = () => {
  const featuresRef = useStaggerReveal();
  const benefitsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const handleCreateCommunity = () => {
    window.location.href = `${ROUTES.HOME}?openCommunityModal=1`;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.SOLUCIONES;
  };

  const handleViewFeatures = () => {
    const target = document.getElementById('soluciones-funcionalidades');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="usertype-page public-page fade-in">
      <Seo
        title="DOMU para Administradores | Software de gestión de condominios"
        description="Software completo para administradores de edificios: gestión de gastos comunes, cobranza, reportes financieros y comunicación con residentes."
        keywords="administrador edificios domu, software administracion condominios, gastos comunes, cobranza edificios"
        canonicalPath="/soluciones/administrador"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Administradores</span>
            <h1 className="usertype-hero__title">
              Administra sin planillas ni sistemas <strong>desconectados</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Gastos comunes, cobranza, personal y proveedores en una sola plataforma.
              Deja de perder tiempo con herramientas fragmentadas y centraliza toda la operación.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleViewFeatures} variant="primary">
                Ver funcionalidades
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Explorar soluciones
              </Button>
            </div>
          </div>
          <div className="usertype-hero__visual">
            <span className="usertype-hero__illustration" aria-hidden="true">
              <Icon name="chartBar" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section id="soluciones-funcionalidades" ref={featuresRef} className="usertype-features reveal-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Herramientas pensadas para el administrador</h2>
              <p>Cada módulo resuelve un problema real de la gestión diaria de edificios y condominios</p>
            </div>
            <div className="usertype-features__grid">
              {features.map((feature, index) => (
                <div key={index} className="usertype-feature-card reveal-stagger-child">
                  <div className="usertype-feature-card__icon" aria-hidden="true">
                    <Icon name={feature.iconName} size={42} strokeWidth={1.8} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section ref={benefitsRef} className="usertype-benefits reveal-section">
          <div className="container">
            <div className="usertype-benefits__content">
              <div className="usertype-benefits__text">
                <h2>Beneficios para tu gestión administrativa</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="buildingOffice" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Dashboard administrativo</h3>
                  <p>Métricas financieras, estado de tareas y alertas de morosidad en un panel centralizado.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>≤500 ms</strong>
                      <span>Tiempo de respuesta</span>
                    </div>
                    <div>
                      <strong>2.000</strong>
                      <span>Unidades soportadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="usertype-cta reveal-section">
          <div className="container">
            <div className="usertype-cta__content">
              <h2>Centraliza la gestión de tu edificio hoy</h2>
              <p>Crea tu comunidad en DOMU y empieza a administrar con herramientas profesionales</p>
              <div className="usertype-cta__actions">
                <Button onClick={handleCreateCommunity} variant="primary">
                  Crear mi comunidad
                </Button>
                <Button onClick={handleDemo} variant="ghost">
                  Conocer más
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

export default UserTypeAdministrador;
